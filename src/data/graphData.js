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
    "title": "路线对比",
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
    "title": "关键挑战",
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
    "title": "训推",
    "short": "模型",
    "type": "branch",
    "stage": "sep",
    "x": 270,
    "y": 945,
    "level": 2,
    "summary": "架构、训练、推理",
    "detail": "关注模型架构与状态表示、长时序一致性、可控生成、推理成本，以及训练和推理中的关键瓶颈。",
    "tags": [
      "模型开发"
    ],
    "status": "confirmed",
    "date": ""
  },
  {
    "id": "diffusion-forcing",
    "title": "Diffusion Forcing",
    "short": "Diffusion Forcing",
    "type": "detail",
    "stage": "oct",
    "x": 350.4488857803502,
    "y": 1379.8294912658275,
    "level": 3,
    "summary": "扩散强制：统一 next-token 预测与全序列扩散的训练范式。",
    "detail": "> 论文：Diffusion Forcing: Next-token Prediction Meets Full-Sequence Diffusion（MIT CSAIL, NeurIPS 2024）\n\n核心思想：通过不同噪声水平统一「逐 token 自回归预测」和「全序列扩散」，让模型既能逐步推理、又能全局生成。\n\n（此处补充学习笔记）",
    "tags": [
      "扩散",
      "视频生成"
    ],
    "status": "confirmed",
    "date": "2026-10-20"
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
    "x": 521.3016715488328,
    "y": 1120.168592375045,
    "level": 3,
    "summary": "演变起点：视频生成 + 扩散训练范式",
    "detail": "记录训练目标、推理延迟、显存占用、可控性与质量的权衡。具体问题应由实验或可靠来源支持。\n训练范式也很多",
    "tags": [
      "模型"
    ],
    "status": "confirmed",
    "date": "2026-09-21"
  },
  {
    "id": "node-mvf73pft-3ilq2",
    "title": "Π3",
    "short": "Π3",
    "type": "detail",
    "stage": "oct",
    "x": 245.37266317715137,
    "y": 1213.7613903428537,
    "level": 3,
    "summary": "排列等变视觉几何学习",
    "detail": "![架构图](./picture/Π3.png)\n\n- register_token：nn.Parameter(torch.randn(1, 1, 5, self.dec_embed_dim))\n- 位姿信息通过对所有的patch做avgpool回归得到\n- reshape 同构异注意力计算方式\n(B×N, hw) 帧内\n(B, N×hw) 帧间\n\n> - π³: Scalable Permutation-Equivariant Visual Geometry Learning\n> - 团队：上海 AI Lab / 上海交大 / 浙大\n> - 年份：ICLR 2026\n> - 代码：https://github.com/yyfz/Pi3 \n> - 论文：arXiv 2507.13347",
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
    "title": "原生Dit",
    "short": "原生Dit",
    "type": "detail",
    "stage": "oct",
    "x": 524.1298629725512,
    "y": 1270.4418615912741,
    "level": 3,
    "summary": "",
    "detail": "[[diffusion-forcing|eg.]],[[node-mvfs29zw-6gn26__Wan2.2|eg.]]",
    "tags": [],
    "status": "confirmed",
    "date": "2026-09-21"
  },
  {
    "id": "node-mvfs29zw-6gn26",
    "title": "Wan2.2",
    "short": "Wan2.2",
    "type": "detail",
    "stage": "oct",
    "x": 726.4261899518007,
    "y": 1371.394969657099,
    "level": 3,
    "summary": "",
    "detail": "key: 原生Dit，MoE，Flowmatching\n\n![架构](./picture/wan2.2.png)\n\n> 代码：[仓库地址](https://github.com/Wan-Video/Wan2.2)\n> 团队：阿里巴巴通义实验室\n```python\nWan2.2/\n├── ...                      \n└── wan/                        # 核心代码包 ★\n    ├── __init__.py             # 包初始化，导出4个Pipeline类\n    ├── configs/                # 模型配置（分辨率/参数/路径）\n    │   └── __init__.py           ## WAN_CONFIGS, SIZE_CONFIGS, MAX_AREA_CONFIGS\n    │\n    ├── distributed/            # 分布式推理工具 —— 6\n    │   └── util.py               ## init_distributed_group, FSDP, Ulysses\n    │\n    ├── modules/                # 核心模块 ★★\n    │   ├── vae2_1.py             ## Wan2.1 VAE（128×压缩，16通道）—— 1\n    │   ├── vae2_2.py             ## Wan2.2 VAE（1024×压缩，48通道）—— 2\n    │   ├── dit/                # DiT模型定义\n    │   │   ├── wan2_1.py         ## Wan2.1 DiT（单一14B Dense模型）—— 3\n    │   │   └── wan2_2.py         ## Wan2.2 DiT（MoE双专家）—— 4\n    │   └── animate/            # Animate模块\n    │       └── preprocess/       ## 姿态预处理\n    │\n    ├── utils/                  # 工具函数\n    │   ├── prompt_extend.py      ## Prompt扩展（DashScope/Qwen）\n    │   └── utils.py              ## save_video, merge_video_audio等\n    │\n    ├── text2video.py           # WanT2V Pipeline ★\n    ├── image2video.py          # WanI2V Pipeline ★\n    ├── textimage2video.py      # WanTI2V Pipeline ★\n    └── speech2video.py         # WanS2V Pipeline ★\n```\n\n## 1. `modules/vae2_1.py`（128×压缩）\n```python\nclass Wan2_1_VAE(nn.Module):\n    \"\"\"3D因果VAE — 时间4×压缩, 空间8×压缩, 16通道, 总128倍\"\"\"\n\n    def __init__(self, vae_pth, device='cuda'):\n        super().__init__()\n        self.encoder = Encoder3D(\n            dim=128,                    # 基础通道数\n            z_dim=4,                    # 单组件潜变量通道(实际×2=8→最终16)\n            dim_mult=[1, 2, 4, 4],      # 4级下采样通道变化: 128→256→512→512\n            num_res_blocks=2,\n            attn_scales=[],             # 注意力注入尺度(空=不注入)\n            temperal_downsample=[True, True, False],  # ★ 第1,2级做时间下采样\n            dropout=0.0,\n        )\n        self.decoder = Decoder3D(...)\n        # GroupNorm → RMSNorm (关键：保证因果性)\n        # 空间上采样层通道减半：推理内存再降33%\n\n#####################################################\n\"\"\" 编码流程\n输入: x ∈ R^{B×3×(1+T)×H×W}   (像素空间)\n  ↓ patchify(1,2,2) — 无patchify，直接3D卷积\n  ↓ Encoder3D:\n  │─ Level 1: dim 128→256, 时间下采样2×, 空间下采样2×\n  │─ Level 2: dim 256→512, 时间下采样2×, 空间下采样2×\n  │─ Level 3: dim 512→512, 无时间下采样, 空间下采样2×\n  │─ Level 4: dim 512→512, 无下采样(残差块)\n  ↓ Conv3D(z_dim*2)  → mu, log_var\n  ↓ 重参数化: z = mu + sigma * noise\n  ↓ 归一化: z = (z - scale[0]) * scale[1]\n输出: z ∈ R^{B×16×(1+T/4)×H/8×W/8}   (潜变量空间)\n\"\"\"\n#####################################################\n```\n\n\n## 2. `modules/vae2_2.py`（1024×压缩）\n```python\nclass Wan2_2_VAE(nn.Module):\n    \"\"\"高压缩VAE — 时间4×, 空间16×(含patchify 2×), 48通道, 总1024倍\"\"\"\n\n    def __init__(self, vae_pth, device='cuda'):\n        super().__init__()\n        self.patch_size = (1, 2, 2)  # ★ 时间1, 空间2×2\n\n        self.encoder = Encoder3D(\n            dim=128,\n            z_dim=4,\n            dim_mult=[1, 2, 4, 4],\n            num_res_blocks=2,\n            temperal_downsample=[True, True, False],  # 同Wan2.1\n            # 但多了patchify预压缩！\n        )\n        # 通道数: 16 → 48（补偿高压缩信息损失）\n\n\n# Patchify额外压缩：\ndef patchify(x, patch_size=(1, 2, 2)):\n    \"\"\"空间2×2打patch → 空间额外4倍压缩\"\"\"\n    if x.dim() == 5:  # [B, C, F, H, W]\n        x = rearrange(x, \"b c f (hq wq) w -> b (c hq wq) f h w\",\n                       hq=patch_size[1], wq=patch_size[2])\n    return x\n\n```\n\n|            | Wan2.1 VAE | Wan2.2 VAE |\n| ---------- | ---------- | ---------- |\n| 时间下采样 | 4×         |     4×        |\n| 空间卷积下采样           |   8×         |      8×      |\n| Patchify           |    \\        |    4x        |\n| 总空间           |      8x      |     16x       |\n| 总压缩           |    4*8=32× (×通道)\t       | 4×16=64× (×通道)           |\n| 通道数           |    16        |     48       |\n| 最终压缩比           |  128x          |   1024x         |\n\n\n## 3. `modules/dit/wan2_1.py`: 单一Dense模型\n```python\nclass Wan2_1_DiT(nn.Module):\n    \"\"\"Wan2.1 DiT: 单一14B参数的Dense DiT模型\"\"\"\n\n    def __init__(self, config):\n        super().__init__()\n        self.patch_size = (1, 2, 2)\n        self.in_channels = 16          # VAE潜变量通道\n        self.out_channels = 16\n        self.hidden_size = 5120        # 隐藏维度\n        self.num_heads = 40            # 注意力头数\n        self.num_layers = 40           # Transformer层数\n\n        # Patchify：3D Conv (1,2,2)\n        self.patch_embedding = nn.Conv3d(\n            in_channels, hidden_size, kernel_size=(1,2,2), stride=(1,2,2))\n\n        # Transformer Blocks\n        self.blocks = nn.ModuleList([\n            WanTransformerBlock(hidden_size, num_heads, ...)\n            for _ in range(num_layers)\n        ])\n\n        # Un-patchify\n        self.unpatch = nn.Linear(hidden_size, patch_size[1]*patch_size[2]*out_channels)\n\n        # 共享时间步MLP（★关键设计：参数减少25%）\n        self.shared_mlp = nn.Sequential(\n            nn.Linear(hidden_size, hidden_size * 6),\n            nn.SiLU(),\n            nn.Linear(hidden_size * 6, hidden_size * 6),\n        )\n\n########################################\n# Transformer Block结构\n########################################\nclass WanTransformerBlock(nn.Module):\n    def __init__(self, hidden_size, num_heads, ...):\n        # 1. Cross-Attention：注入文本条件\n        self.cross_attn = Attention(hidden_size, num_heads)\n\n        # 2. Full Self-Attention：全局时空建模（非因果！）\n        self.self_attn = Attention(hidden_size, num_heads)\n\n        # 3. FFN/MLP\n        self.ffn = FeedForward(hidden_size)\n\n        # 4. 时间步调制（共享MLP + 块专属偏置）\n        self.shift_bias = nn.Parameter(torch.zeros(hidden_size * 6))\n\n    def forward(self, x, text_emb, timestep_emb):\n        # 时间步调制：6个参数（scale, shift, gate各×2）\n        mod_params = self.shared_mlp(timestep_emb) + self.shift_bias\n        shift_msa, scale_msa, gate_msa, shift_mlp, scale_mlp, gate_mlp = \\\n            mod_params.chunk(6, dim=-1)\n\n        # Cross-Attention ← 文本\n        x = x + gate_msa * self.cross_attn(\n            norm(x) * (1 + scale_msa) + shift_msa, text_emb)\n\n        # Self-Attention ← 全局\n        x = x + gate_msa * self.self_attn(norm(x))\n\n        # FFN\n        x = x + gate_mlp * self.ffn(norm(x) * (1 + scale_mlp) + shift_mlp)\n        return x\n```\n\n## 4. `modules/dit/wan2_2.py`: MoE(时间步路由)专家\n```python\nclass Wan2_2_DiT(nn.Module):\n    \"\"\"Wan2.2 MoE DiT: 高噪声专家 + 低噪声专家\"\"\"\n\n    def __init__(self, config):\n        super().__init__()\n        # ★ 两个独立的Dense DiT！\n        self.high_noise_model = Wan2_1_DiT(config)  # 高噪声专家 ~14B\n        self.low_noise_model = Wan2_1_DiT(config)   # 低噪声专家 ~14B\n        # 总参数 ~27B，但推理时仅14B活跃\n\n        self.t_moe = None  # ★ MoE切换阈值时间步（加载权重时设置）\n\n    def select_expert(self, t):\n        \"\"\"根据当前时间步选择专家\"\"\"\n        if t > self.t_moe:\n            return self.high_noise_model   # 高噪声阶段 → 布局专家\n        else:\n            return self.low_noise_model    # 低噪声阶段 → 细节专家\n\n    def forward(self, x, timestep, text_emb, **kwargs):\n        t = timestep.item() if isinstance(timestep, torch.Tensor) else timestep\n\n        # ★ 选择并加载对应专家\n        if t > self.t_moe:\n            model = self._load_expert('high_noise')\n        else:\n            model = self._load_expert('low_noise')\n\n        return model(x, timestep, text_emb, **kwargs)\n\n    def _load_expert(self, required_name):\n        \"\"\"显存管理：激活所需专家，卸载另一个\"\"\"\n        offload_name = 'low_noise_model' if required_name == 'high_noise_model' \\\n                        else 'high_noise_model'\n\n        if self.offload_model:\n            # 将非活跃专家卸载到CPU\n            if next(getattr(self, offload_name).parameters()).device.type == 'cuda':\n                getattr(self, offload_name).to('cpu')\n            # 将活跃专家加载到GPU\n            if next(getattr(self, required_name).parameters()).device.type == 'cpu':\n                getattr(self, required_name).to(self.device)\n\n        return getattr(self, required_name)\n```\nMoE切换点：SNR(t_moe) = SNR_min / 2\n- t_moe 通常设置在 ~800步（总1000步的前80%）, 推理时GPU上始终只有一个14B模型，显存占用不变\n- 去噪初期(t大, SNR低) → 高噪声专家\n- 去噪后期(t小, SNR高) → 低噪声专家\n\n\n## 5. Flow Matching调度器\n```python\nclass FlowMatchScheduler:\n    \"\"\"Rectified Flow调度器 — 线性插值噪声路径\"\"\"\n\n    def __init__(self, shift=5.0, num_train_timesteps=1000):\n        self.num_train_timesteps = num_train_timesteps\n        self.shift = shift  # ★ 时间步偏移，控制采样密度\n\n    def set_timesteps(self, num_inference_steps):\n        \"\"\"设置推理时间步 — 应用shift采样\"\"\"\n        timesteps = torch.linspace(\n            1.0, 0.0, num_inference_steps + 1)  # [1.0 → 0.0]\n        # ★ Shift采样：偏向中间时间步\n        timesteps = self._shift_schedule(timesteps)\n        self.timesteps = timesteps[:-1]\n\n    def _shift_schedule(self, timesteps):\n        \"\"\"Shift Schedule：对数正态偏移\n        使采样密度偏向中间时间步，同时关注粗布局和细细节\"\"\"\n        return 1.0 / (1.0 + (1.0 - timesteps) / timesteps * self.shift)\n\n    def step(self, model_output, timestep, sample):\n        \"\"\"ODE步进：x_{t-1} = x_t + v_pred * dt\"\"\"\n        dt = timestep - self.prev_timestep  # 时间步差\n        prev_sample = sample + model_output * dt\n        return prev_sample\n```\n- Rectified Flow使用线性路径（而非DDPM的弯曲路径），ODE采样更高效\n- shift参数控制时间步采样密度：偏向中间步既关注全局布局又照顾细节；Wan2.1 T2V-14B shift=5.0，Wan2.2 MoE可能使用不同的shift值\n- 推理仅需20-50步即可收敛（对比DDPM的1000步）\n\n## 6. `distributed/util.py`分布式推理\n```python\ndef init_distributed_group(args):\n    \"\"\"初始化分布式进程组\"\"\"\n    if args.ulysses_size > 1:\n        # Ulysses序列并行：沿注意力头分片\n        setup_ulysses(args.ulysses_size)\n\n    if args.dit_fsdp:\n        # DiT模块使用FSDP参数分片\n        wrap_dit_with_fsdp()\n\n    if args.t5_fsdp:\n        # T5编码器使用FSDP参数分片\n        wrap_t5_with_fsdp()\n```\n## 7. 架构\n```bash\n\n7.1 架构上的并行策略映射\n┌──────────────────────────────────────────────────────────┐\n│                    多GPU推理并行策略                      │\n├──────────────┬───────────────────────────────────────────┤\n│ VAE          │ DP（数据并行）— 显存小，无需分片             │\n│ T5 Encoder   │ FSDP（全分片数据并行）— >20GB显存需分片      │\n│ DiT (单专家)  │ FSDP + 2D-CP (Ulysses×RingAttention) + DP │\n│ DiT (MoE)    │ 同上 + 专家卸载（CPU↔GPU切换）              │\n└──────────────┴───────────────────────────────────────────┘\n\n\n7.2 流程图\n用户输入: prompt + (可选) image/audio\n         │\n         ▼\n┌─────────────────────────────────────────────────────────┐\n│  generate.py — 推理入口                                  │\n│  ├── 解析CLI参数                                         │\n│  ├── 初始化分布式 (FSDP / Ulysses / DP)                   │\n│  ├── 选择Pipeline (WanT2V / WanI2V / WanTI2V / WanS2V)  │\n│  └── Prompt扩展 (可选, DashScope/Qwen)                   │\n└─────────────────────┬───────────────────────────────────┘\n                      │\n                      ▼\n┌─────────────────────────────────────────────────────────┐\n│  Pipeline.generate()                                      │\n│                                                           │\n│  ┌─ Step 1: 文本编码 ─────────────────────────────────┐  │\n│  │  umT5-XXL → text_emb [B, L_text, D]                │  │\n│  │  (可选) T5放CPU节省显存                              │  │\n│  └──────────────────────────────────────────────────────┘  │\n│                                                           │\n│  ┌─ Step 2: VAE编码 (仅I2V/TI2V/S2V) ───────────────┐  │\n│  │  Wan2.1 VAE: x → z [B,16,T/4,H/8,W/8]  (128×)    │  │\n│  │  Wan2.2 VAE: x → z [B,48,T/4,H/16,W/16] (1024×)  │  │\n│  └──────────────────────────────────────────────────────┘  │\n│                                                           │\n│  ┌─ Step 3: 初始化噪声 ───────────────────────────────┐  │\n│  │  z_T ~ N(0, I)  [B, C, F, H', W']                │  │\n│  │  (I2V: 首帧替换为image_latent)                      │  │\n│  └──────────────────────────────────────────────────────┘  │\n│                                                           │\n│  ┌─ Step 4: Flow Matching去噪循环 ────────────────────┐  │\n│  │  for t in timesteps:                               │  │\n│  │    ┌─ MoE专家选择 (Wan2.2 A14B) ──────────────┐    │  │\n│  │    │  if t > t_moe → high_noise_model (14B)   │    │  │\n│  │    │  else        → low_noise_model  (14B)    │    │  │\n│  │    │  (非活跃专家卸载到CPU)                      │    │  │\n│  │    └────────────────────────────────────────────┘    │  │\n│  │                                                      │  │\n│  │    v_pred = DiT(z_t, t, text_emb)                  │  │\n│  │                                                      │  │\n│  │    ┌─ CFG (guidance_scale > 1) ────────────────┐    │  │\n│  │    │  v = v_uncond + s * (v_cond - v_uncond)   │    │  │\n│  │    └────────────────────────────────────────────┘    │  │\n│  │                                                      │  │\n│  │    z_{t-dt} = z_t + v * dt  (Rectified Flow ODE)   │  │\n│  └──────────────────────────────────────────────────────┘  │\n│                                                           │\n│  ┌─ Step 5: VAE解码 ──────────────────────────────────┐  │\n│  │  z_0 → VAE Decoder → video [B, 3, T, H, W]       │  │\n│  │  (分块解码，O(1)显存，支持无限长)                     │  │\n│  └──────────────────────────────────────────────────────┘  │\n└─────────────────────┬───────────────────────────────────┘\n                      │\n                      ▼\n┌─────────────────────────────────────────────────────────┐\n│  save_video() / merge_video_audio()                      │\n│  → MP4输出                                               │\n└─────────────────────────────────────────────────────────┘\n```",
    "tags": [],
    "status": "confirmed",
    "date": "2026-10-01"
  }
];

export const edges = [
  {
    "id": "edge-mvfs27c0-k887i",
    "source": "model-training",
    "target": "node-mvf9rvkx-gfr84",
    "label": "",
    "type": "extends"
  },
  {
    "id": "e14",
    "source": "model",
    "target": "model-training",
    "label": "细化",
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
  },
  {
    "id": "ref-node-mvf9rvkx-gfr84-diffusion-forcing",
    "source": "node-mvf9rvkx-gfr84",
    "target": "diffusion-forcing",
    "label": "eg.",
    "type": "reference"
  },
  {
    "id": "ref-node-mvf9rvkx-gfr84-node-mvfs29zw-6gn26",
    "source": "node-mvf9rvkx-gfr84",
    "target": "node-mvfs29zw-6gn26",
    "label": "eg.",
    "type": "reference"
  }
];
