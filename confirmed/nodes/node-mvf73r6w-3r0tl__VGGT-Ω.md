---
title: VGGT-Ω
stage: oct
level: 3
type: detail
status: confirmed
position:
  x: 38.29266864991129
  'y': 1222.7580447096689
summary: 前馈式 3D 重建
tags:
  - 前馈神经网络
id: node-mvf73r6w-3r0tl
schemaVersion: 1
date: '2026-10-01'
---
任务：输入 N 张无序/有序图像，端到端直接输出——每帧的相机位姿（外参+内参）、每帧的稠密深度图与置信度；再由「深度 + 相机」反投影得到 3D 点云
idea：模型质量和数据量之间存在可预测的 scaling law
效果：用 30% 显存训练 15 倍数据

设计：
1. dense prediction head 
2. Register tokens
3. Register Attention：O(F²P²) -> O(FP² + F²R)

![架构图](./picture/VGGT-Ω.png)
- Dino：Kernel/strip=16（512/16=32，32²=1024）——>  每张图对应 1024个patch，每个patch可投影为1024维的向量
- DenseHead 同时读主干第 4、11、17、23 层的 patch token
- Camera token(cat)：
     - nn.init.normal_高斯初始化, 
     - nn.Parameter(torch.empty(1, 2, 1, embed_dim))；
     - 输出9个数（position-3、rotation-4、intrinsics-视场角fov-2）
- Scene token(cat)：
     - nn.init.normal_高斯初始化, 
     - nn.Parameter(torch.empty(1, 2, 16, embed_dim))；
- 层2/6/9/14/20 → register   ││   其余19层  → global 

```
################
每帧的 token 序列
################

位置:             0             1~16             17~1040
       ┌─────┬─────────────┬────────────────────┐
       │相机     │  Register tokens×16  │   像素patch×1024                 │
       └─────┴─────────────┴────────────────────┘
                                         ↑ patch_token_start = 17（这个偏移就是这么来的）
```


> - 团队：牛津 VGG + Meta 
> - 年份：CVPR 2026 Oral
> - 代码：[vggt-omega](https://github.com/facebookresearch/vggt-omega)
> - 论文：arXiv 2605.15195

---

## 附录：会话 Q&A 知识点


### A. Token 

#### 1. 为什么 token 要 1024 维？有什么根据？
- 没有理论根据，是架构设计超参数。
- ① 继承 DINOv3 ViT-Large 的 embed_dim=1024；② 是 2 的幂，能被 16 个头整除（1024÷16=64）、GPU 友好；③ 是「表达力够强」和「成本可控」的平衡点。

#### 2. camera token 初始化 shape (1, 2, 1, 1024) 什么意思？
- 第 0 维 = 1：一份参数，所有 batch/输入共用。
- 第 1 维 = 2：两种「岗位」（不是两台相机！）——第 0 组给「第一帧」，第 1 组给「其余帧共用」。
- 第 2 维 = 1：每帧 1 个 camera token。
- 第 3 维 = 1024：向量长度。
- 为什么分两组：第一帧是「坐标系原点/组长」（世界坐标基准），其余帧是「组员」（报相对位姿），两种活儿本质不同，各给一份模板；用 `.expand()` 复制到各帧。
- 为什么不能每帧一份（=N）：帧数不固定，且「提取相机信息」的能力是全帧通用的，共享才正确。



### B. 位姿表示（9 个数字的来龙去脉）

#### 3. 为什么 fov 要用两个数？
- 画面是长方形，横竖张角天生不同：水平视场角 + 垂直视场角，两个独立数。
- 对应 fx/fy 两个方向的焦距。
- 类比：透过长方形窗户看世界，「能看多宽」和「能看多高」是两件事。

#### 4. 为什么四元数能表示旋转？
- 三维旋转本质 = 绕一根轴转一个角度 = 3 个自由度。
- 四元数 q = (w, x, y, z)：w = cos(θ/2) 记「转多少」，(x,y,z) = sin(θ/2)·轴 记「绕哪转」。
- 旋转公式 `q p q⁻¹`（两次半角旋转合起来正好 θ）。
- 可以理解成「复数的三维版」：复数做 2D 旋转，四元数做 3D 旋转。
- 为什么选四元数：比矩阵紧凑（4 vs 9）、比欧拉角稳定（无万向锁）、连续性好、可归一化；唯一代价是 q 和 -q 等价，损失函数要处理符号歧义（`_quaternion_l1` 比较 q 和 -q 取较小值）。



### C. 模型架构（交替注意力 + 三个头）
#### 5. 为什么大费周章、register 只用在 5 层？
- global 太贵（O((帧数×1041)²)，500 帧 → 43GB 显存）；register 太损（16 个代表转述会丢像素级对应细节）。
- 折中：大部分层 global 保精度，隔几层插 register 省钱 + 定期全局同步。
- 均匀铺开（2/6/9/14/20）是把成本摊薄到整个深度，而不是集中某段。
- 诚实边界：恰好 5 层、恰好这几个位置，是消融实验试出来的经验值（代码里硬编码 `[2,6,9,14,20]`，无注释解释），不是理论推导的必然。



### D. 训练

#### 6. 训练
- 三要素：
  1. 监督信号：GT 外参 + GT 内参 + GT 深度 + 有效 mask（来自 8 个数据集）。
  2. 损失：camera + depth + point + consistency 加权和。
  3. 优化：前向 → 算 loss → backward 求梯度 → 梯度裁剪 → 优化器更新 → 调度学习率，循环几十万次。
- 关键监督设计：point loss = 预测深度×预测相机反投影的点 vs GT 点，同时逼深度和相机都准（耦合）。
- 初始化策略：backbone 白嫖 DINOv3 预训练（否则学不动），交替注意力块/head/token 从零学。

#### 7. 损失函数细节
- loss_camera：平移 L1 + 四元数 L1（处理 ±q 等价）+ 焦距 L1 + 可选 pairwise 相对位姿（triu_indices 枚举所有帧对）。
- loss_depth：相对 L1（误差除以真值深度，防止远处偏袒）+ 可选置信度损失 + 梯度损失。
- loss_point：可微三角化，耦合相机与深度。
- loss_consistency：跨帧几何一致性（多射线应交于一点的可微版）。


