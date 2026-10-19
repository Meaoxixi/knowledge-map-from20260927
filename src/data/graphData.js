// 此文件由 scripts/sync-graphdata.mjs 自动生成，请勿手改。
// 数据源：confirmed/nodes/*.md + workspace/nodes/*.md + */relations.json + confirmed/layout.json
// 重新生成：node scripts/sync-graphdata.mjs

export const stages = [
  {
    "id": "aug",
    "date": "08.21",
    "month": "AUG",
    "ym": "2026-08",
    "title": "基础调研",
    "subtitle": "建立技术地图",
    "description": "识别世界模型的主要范式、能力边界与评测难点。"
  },
  {
    "id": "sep",
    "date": "09.12",
    "month": "SEP",
    "ym": "2026-09",
    "title": "技术路线梳理",
    "subtitle": "从认知到问题",
    "description": "把调研结论组织为模型、数据、评测三个分析维度。"
  },
  {
    "id": "oct",
    "date": "10.18",
    "month": "OCT",
    "ym": "2026-10",
    "title": "研究问题形成",
    "subtitle": "形成可验证方向",
    "description": "探索评测反馈如何进入数据筛选与训练闭环。"
  }
];

export const nodes = [
  {
    "id": "survey",
    "title": "工业界与学术界路线对比",
    "short": "路线对比",
    "type": "topic",
    "stage": "aug",
    "x": 90.38260578756598,
    "y": 796.33048626485,
    "level": 1,
    "summary": "比较不同团队的目标、训练范式与系统取舍。",
    "detail": "可从建模目标、输入输出、生成/预测能力、交互方式、训练数据、部署形态等维度建立对比表。当前内容仅作为信息组织示例。",
    "tags": [
      "调研",
      "对比"
    ],
    "status": "confirmed",
    "date": ""
  },
  {
    "id": "synthesis",
    "title": "技术路线、能力边界与关键挑战",
    "short": "关键挑战",
    "type": "summary",
    "stage": "aug",
    "x": 488.6881840704898,
    "y": 791.2921247773531,
    "level": 1,
    "summary": "将分散调研汇总为后续分析框架。",
    "detail": "这是一个阶段性归纳节点。请在真实研究中为每个判断补充来源、反例与置信度，避免将示例关系误当作已证实结论。",
    "tags": [
      "阶段总结"
    ],
    "status": "confirmed",
    "date": ""
  },
  {
    "id": "data",
    "title": "数据层面",
    "short": "数据",
    "type": "branch",
    "stage": "sep",
    "x": 600,
    "y": 945,
    "level": 2,
    "summary": "采集、清洗、质量筛选与覆盖范围。",
    "detail": "关注数据质量与覆盖范围、场景/动作分布、低质量样本识别，以及筛选策略对下游训练效果的影响。",
    "tags": [
      "数据开发"
    ],
    "status": "confirmed",
    "date": ""
  },
  {
    "id": "evaluation",
    "title": "评测层面",
    "short": "评测",
    "type": "branch",
    "stage": "sep",
    "x": 930,
    "y": 945,
    "level": 2,
    "summary": "质量指标、评测模型、效率与一致性。",
    "detail": "关注评测结果是否与人工判断和下游任务效果一致，以及评测器的成本、泛化能力和反馈可操作性。",
    "tags": [
      "评测体系"
    ],
    "status": "confirmed",
    "date": ""
  },
  {
    "id": "model",
    "title": "模型层面",
    "short": "模型",
    "type": "branch",
    "stage": "sep",
    "x": 270,
    "y": 945,
    "level": 2,
    "summary": "架构、时序建模、生成能力与一致性。",
    "detail": "关注模型架构与状态表示、长时序一致性、可控生成、推理成本，以及训练和推理中的关键瓶颈。",
    "tags": [
      "模型开发"
    ],
    "status": "confirmed",
    "date": ""
  },
  {
    "id": "model-consistency",
    "title": "3D 视觉几何",
    "short": "一致性",
    "type": "detail",
    "stage": "oct",
    "x": 150,
    "y": 1110,
    "level": 3,
    "summary": "空间理解基座",
    "detail": "- VGGT-Ω\n- π³",
    "tags": [
      "视觉底座"
    ],
    "status": "confirmed",
    "date": "2026-09-11"
  },
  {
    "id": "model-training",
    "title": "世界模型",
    "short": "训练 / 推理",
    "type": "detail",
    "stage": "oct",
    "x": 350,
    "y": 1110,
    "level": 3,
    "summary": "演变",
    "detail": "记录训练目标、推理延迟、显存占用、可控性与质量的权衡。具体问题应由实验或可靠来源支持。\n训练范式也很多",
    "tags": [
      "模型"
    ],
    "status": "confirmed",
    "date": ""
  },
  {
    "id": "node-mvf73pft-3ilq2",
    "title": "π³",
    "short": "π³",
    "type": "detail",
    "stage": "oct",
    "x": 245.37266317715137,
    "y": 1213.7613903428537,
    "level": 3,
    "summary": "排列等变视觉几何学习",
    "detail": "![架构图](.\\public\\picture\\Π3.png)\n\n- register_token：nn.Parameter(torch.randn(1, 1, 5, self.dec_embed_dim))\n- 位姿信息通过对所有的patch做avgpool回归得到\n- reshape 同构异注意力计算方式\n(B×N, hw) 帧内\n(B, N×hw) 帧间\n\n> - π³: Scalable Permutation-Equivariant Visual Geometry Learning\n> - 团队：上海 AI Lab / 上海交大 / 浙大\n> - 年份：ICLR 2026\n> - 代码：https://github.com/yyfz/Pi3 \n> - 论文：arXiv 2507.13347",
    "tags": [
      "排列等变",
      "前馈神经网络"
    ],
    "status": "confirmed",
    "date": "2026-10-01"
  },
  {
    "id": "node-mvf73r6w-3r0tl",
    "title": "VGGT-Ω",
    "short": "VGGT-Ω",
    "type": "detail",
    "stage": "oct",
    "x": 38.29266864991129,
    "y": 1222.7580447096689,
    "level": 3,
    "summary": "前馈式 3D 重建",
    "detail": "任务：输入 N 张无序/有序图像，端到端直接输出——每帧的相机位姿（外参+内参）、每帧的稠密深度图与置信度；再由「深度 + 相机」反投影得到 3D 点云\nidea：模型质量和数据量之间存在可预测的 scaling law\n效果：用 30% 显存训练 15 倍数据\n\n设计：\n1. dense prediction head \n2. Register tokens\n3. Register Attention：O(F²P²) -> O(FP² + F²R)\n\n![架构图](./picture/VGGT-Ω.png)\n- Dino：Kernel/strip=16（512/16=32，32²=1024）——>  每张图对应 1024个patch，每个patch可投影为1024维的向量\n- DenseHead 同时读主干第 4、11、17、23 层的 patch token\n- Camera token(cat)：\n     - nn.init.normal_高斯初始化, \n     - nn.Parameter(torch.empty(1, 2, 1, embed_dim))；\n     - 输出9个数（position-3、rotation-4、intrinsics-视场角fov-2）\n- Scene token(cat)：\n     - nn.init.normal_高斯初始化, \n     - nn.Parameter(torch.empty(1, 2, 16, embed_dim))；\n- 层2/6/9/14/20 → register   ││   其余19层  → global \n\n```\n################\n每帧的 token 序列\n################\n\n位置:             0             1~16             17~1040\n       ┌─────┬─────────────┬────────────────────┐\n       │相机     │  Register tokens×16  │   像素patch×1024                 │\n       └─────┴─────────────┴────────────────────┘\n                                         ↑ patch_token_start = 17（这个偏移就是这么来的）\n```\n\n\n> - 团队：牛津 VGG + Meta \n> - 年份：CVPR 2026 Oral\n> - 代码：[vggt-omega](https://github.com/facebookresearch/vggt-omega)\n> - 论文：arXiv 2605.15195\n\n---\n\n## 附录：会话 Q&A 知识点\n\n\n### A. Token \n\n#### 1. 为什么 token 要 1024 维？有什么根据？\n- 没有理论根据，是架构设计超参数。\n- ① 继承 DINOv3 ViT-Large 的 embed_dim=1024；② 是 2 的幂，能被 16 个头整除（1024÷16=64）、GPU 友好；③ 是「表达力够强」和「成本可控」的平衡点。\n\n#### 2. camera token 初始化 shape (1, 2, 1, 1024) 什么意思？\n- 第 0 维 = 1：一份参数，所有 batch/输入共用。\n- 第 1 维 = 2：两种「岗位」（不是两台相机！）——第 0 组给「第一帧」，第 1 组给「其余帧共用」。\n- 第 2 维 = 1：每帧 1 个 camera token。\n- 第 3 维 = 1024：向量长度。\n- 为什么分两组：第一帧是「坐标系原点/组长」（世界坐标基准），其余帧是「组员」（报相对位姿），两种活儿本质不同，各给一份模板；用 `.expand()` 复制到各帧。\n- 为什么不能每帧一份（=N）：帧数不固定，且「提取相机信息」的能力是全帧通用的，共享才正确。\n\n\n\n### B. 位姿表示（9 个数字的来龙去脉）\n\n#### 3. 为什么 fov 要用两个数？\n- 画面是长方形，横竖张角天生不同：水平视场角 + 垂直视场角，两个独立数。\n- 对应 fx/fy 两个方向的焦距。\n- 类比：透过长方形窗户看世界，「能看多宽」和「能看多高」是两件事。\n\n#### 4. 为什么四元数能表示旋转？\n- 三维旋转本质 = 绕一根轴转一个角度 = 3 个自由度。\n- 四元数 q = (w, x, y, z)：w = cos(θ/2) 记「转多少」，(x,y,z) = sin(θ/2)·轴 记「绕哪转」。\n- 旋转公式 `q p q⁻¹`（两次半角旋转合起来正好 θ）。\n- 可以理解成「复数的三维版」：复数做 2D 旋转，四元数做 3D 旋转。\n- 为什么选四元数：比矩阵紧凑（4 vs 9）、比欧拉角稳定（无万向锁）、连续性好、可归一化；唯一代价是 q 和 -q 等价，损失函数要处理符号歧义（`_quaternion_l1` 比较 q 和 -q 取较小值）。\n\n\n\n### C. 模型架构（交替注意力 + 三个头）\n#### 5. 为什么大费周章、register 只用在 5 层？\n- global 太贵（O((帧数×1041)²)，500 帧 → 43GB 显存）；register 太损（16 个代表转述会丢像素级对应细节）。\n- 折中：大部分层 global 保精度，隔几层插 register 省钱 + 定期全局同步。\n- 均匀铺开（2/6/9/14/20）是把成本摊薄到整个深度，而不是集中某段。\n- 诚实边界：恰好 5 层、恰好这几个位置，是消融实验试出来的经验值（代码里硬编码 `[2,6,9,14,20]`，无注释解释），不是理论推导的必然。\n\n\n\n### D. 训练\n\n#### 6. 训练\n- 三要素：\n  1. 监督信号：GT 外参 + GT 内参 + GT 深度 + 有效 mask（来自 8 个数据集）。\n  2. 损失：camera + depth + point + consistency 加权和。\n  3. 优化：前向 → 算 loss → backward 求梯度 → 梯度裁剪 → 优化器更新 → 调度学习率，循环几十万次。\n- 关键监督设计：point loss = 预测深度×预测相机反投影的点 vs GT 点，同时逼深度和相机都准（耦合）。\n- 初始化策略：backbone 白嫖 DINOv3 预训练（否则学不动），交替注意力块/head/token 从零学。\n\n#### 7. 损失函数细节\n- loss_camera：平移 L1 + 四元数 L1（处理 ±q 等价）+ 焦距 L1 + 可选 pairwise 相对位姿（triu_indices 枚举所有帧对）。\n- loss_depth：相对 L1（误差除以真值深度，防止远处偏袒）+ 可选置信度损失 + 梯度损失。\n- loss_point：可微三角化，耦合相机与深度。\n- loss_consistency：跨帧几何一致性（多射线应交于一点的可微版）。",
    "tags": [
      "前馈神经网络"
    ],
    "status": "confirmed",
    "date": "2026-10-01"
  },
  {
    "id": "node-mvf9rvkx-gfr84",
    "title": "因果世界模型",
    "short": "因果世界模型",
    "type": "detail",
    "stage": "oct",
    "x": 602,
    "y": 1221,
    "level": 3,
    "summary": "",
    "detail": "",
    "tags": [],
    "status": "workspace",
    "date": "2026-10-01"
  }
];

export const edges = [
  {
    "id": "e14",
    "source": "model",
    "target": "model-training",
    "label": "细化",
    "type": "extends"
  },
  {
    "id": "edge-mvf7f8an-3vuf4",
    "source": "model-consistency",
    "target": "node-mvf73pft-3ilq2",
    "label": "",
    "type": "extends"
  },
  {
    "id": "edge-mvf7f45o-42kmn",
    "source": "model-consistency",
    "target": "node-mvf73r6w-3r0tl",
    "label": "",
    "type": "extends"
  },
  {
    "id": "e13",
    "source": "model",
    "target": "model-consistency",
    "label": "细化",
    "type": "extends"
  },
  {
    "id": "edge-mvdpum5j-en72d",
    "source": "synthesis",
    "target": "model",
    "label": "",
    "type": "extends"
  },
  {
    "id": "edge-mvdpyd50-zmu09",
    "source": "synthesis",
    "target": "evaluation",
    "label": "",
    "type": "extends"
  },
  {
    "id": "edge-mvdpy9xv-o685e",
    "source": "synthesis",
    "target": "data",
    "label": "",
    "type": "extends"
  }
];
