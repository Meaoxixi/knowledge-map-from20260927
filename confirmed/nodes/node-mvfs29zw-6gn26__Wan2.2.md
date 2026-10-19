---
title: Wan2.2
stage: oct
level: 3
type: detail
status: confirmed
position:
  x: 726.4261899518007
  'y': 1371.394969657099
summary: ''
tags: []
id: node-mvfs29zw-6gn26
schemaVersion: 1
date: '2026-10-01'
---

key: 原生Dit，MoE，Flowmatching

![架构](./picture/wan2.2.png)

> 代码：[仓库地址](https://github.com/Wan-Video/Wan2.2)
> 团队：阿里巴巴通义实验室
```python
Wan2.2/
├── ...                      
└── wan/                        # 核心代码包 ★
    ├── __init__.py             # 包初始化，导出4个Pipeline类
    ├── configs/                # 模型配置（分辨率/参数/路径）
    │   └── __init__.py           ## WAN_CONFIGS, SIZE_CONFIGS, MAX_AREA_CONFIGS
    │
    ├── distributed/            # 分布式推理工具 —— 6
    │   └── util.py               ## init_distributed_group, FSDP, Ulysses
    │
    ├── modules/                # 核心模块 ★★
    │   ├── vae2_1.py             ## Wan2.1 VAE（128×压缩，16通道）—— 1
    │   ├── vae2_2.py             ## Wan2.2 VAE（1024×压缩，48通道）—— 2
    │   ├── dit/                # DiT模型定义
    │   │   ├── wan2_1.py         ## Wan2.1 DiT（单一14B Dense模型）—— 3
    │   │   └── wan2_2.py         ## Wan2.2 DiT（MoE双专家）—— 4
    │   └── animate/            # Animate模块
    │       └── preprocess/       ## 姿态预处理
    │
    ├── utils/                  # 工具函数
    │   ├── prompt_extend.py      ## Prompt扩展（DashScope/Qwen）
    │   └── utils.py              ## save_video, merge_video_audio等
    │
    ├── text2video.py           # WanT2V Pipeline ★
    ├── image2video.py          # WanI2V Pipeline ★
    ├── textimage2video.py      # WanTI2V Pipeline ★
    └── speech2video.py         # WanS2V Pipeline ★
```

## 1. `modules/vae2_1.py`（128×压缩）
```python
class Wan2_1_VAE(nn.Module):
    """3D因果VAE — 时间4×压缩, 空间8×压缩, 16通道, 总128倍"""

    def __init__(self, vae_pth, device='cuda'):
        super().__init__()
        self.encoder = Encoder3D(
            dim=128,                    # 基础通道数
            z_dim=4,                    # 单组件潜变量通道(实际×2=8→最终16)
            dim_mult=[1, 2, 4, 4],      # 4级下采样通道变化: 128→256→512→512
            num_res_blocks=2,
            attn_scales=[],             # 注意力注入尺度(空=不注入)
            temperal_downsample=[True, True, False],  # ★ 第1,2级做时间下采样
            dropout=0.0,
        )
        self.decoder = Decoder3D(...)
        # GroupNorm → RMSNorm (关键：保证因果性)
        # 空间上采样层通道减半：推理内存再降33%

#####################################################
""" 编码流程
输入: x ∈ R^{B×3×(1+T)×H×W}   (像素空间)
  ↓ patchify(1,2,2) — 无patchify，直接3D卷积
  ↓ Encoder3D:
  │─ Level 1: dim 128→256, 时间下采样2×, 空间下采样2×
  │─ Level 2: dim 256→512, 时间下采样2×, 空间下采样2×
  │─ Level 3: dim 512→512, 无时间下采样, 空间下采样2×
  │─ Level 4: dim 512→512, 无下采样(残差块)
  ↓ Conv3D(z_dim*2)  → mu, log_var
  ↓ 重参数化: z = mu + sigma * noise
  ↓ 归一化: z = (z - scale[0]) * scale[1]
输出: z ∈ R^{B×16×(1+T/4)×H/8×W/8}   (潜变量空间)
"""
#####################################################
```


## 2. `modules/vae2_2.py`（1024×压缩）
```python
class Wan2_2_VAE(nn.Module):
    """高压缩VAE — 时间4×, 空间16×(含patchify 2×), 48通道, 总1024倍"""

    def __init__(self, vae_pth, device='cuda'):
        super().__init__()
        self.patch_size = (1, 2, 2)  # ★ 时间1, 空间2×2

        self.encoder = Encoder3D(
            dim=128,
            z_dim=4,
            dim_mult=[1, 2, 4, 4],
            num_res_blocks=2,
            temperal_downsample=[True, True, False],  # 同Wan2.1
            # 但多了patchify预压缩！
        )
        # 通道数: 16 → 48（补偿高压缩信息损失）


# Patchify额外压缩：
def patchify(x, patch_size=(1, 2, 2)):
    """空间2×2打patch → 空间额外4倍压缩"""
    if x.dim() == 5:  # [B, C, F, H, W]
        x = rearrange(x, "b c f (hq wq) w -> b (c hq wq) f h w",
                       hq=patch_size[1], wq=patch_size[2])
    return x

```

|            | Wan2.1 VAE | Wan2.2 VAE |
| ---------- | ---------- | ---------- |
| 时间下采样 | 4×         |     4×        |
| 空间卷积下采样           |   8×         |      8×      |
| Patchify           |    \        |    4x        |
| 总空间           |      8x      |     16x       |
| 总压缩           |    4*8=32× (×通道)	       | 4×16=64× (×通道)           |
| 通道数           |    16        |     48       |
| 最终压缩比           |  128x          |   1024x         |


## 3. `modules/dit/wan2_1.py`: 单一Dense模型
```python
class Wan2_1_DiT(nn.Module):
    """Wan2.1 DiT: 单一14B参数的Dense DiT模型"""

    def __init__(self, config):
        super().__init__()
        self.patch_size = (1, 2, 2)
        self.in_channels = 16          # VAE潜变量通道
        self.out_channels = 16
        self.hidden_size = 5120        # 隐藏维度
        self.num_heads = 40            # 注意力头数
        self.num_layers = 40           # Transformer层数

        # Patchify：3D Conv (1,2,2)
        self.patch_embedding = nn.Conv3d(
            in_channels, hidden_size, kernel_size=(1,2,2), stride=(1,2,2))

        # Transformer Blocks
        self.blocks = nn.ModuleList([
            WanTransformerBlock(hidden_size, num_heads, ...)
            for _ in range(num_layers)
        ])

        # Un-patchify
        self.unpatch = nn.Linear(hidden_size, patch_size[1]*patch_size[2]*out_channels)

        # 共享时间步MLP（★关键设计：参数减少25%）
        self.shared_mlp = nn.Sequential(
            nn.Linear(hidden_size, hidden_size * 6),
            nn.SiLU(),
            nn.Linear(hidden_size * 6, hidden_size * 6),
        )

########################################
# Transformer Block结构
########################################
class WanTransformerBlock(nn.Module):
    def __init__(self, hidden_size, num_heads, ...):
        # 1. Cross-Attention：注入文本条件
        self.cross_attn = Attention(hidden_size, num_heads)

        # 2. Full Self-Attention：全局时空建模（非因果！）
        self.self_attn = Attention(hidden_size, num_heads)

        # 3. FFN/MLP
        self.ffn = FeedForward(hidden_size)

        # 4. 时间步调制（共享MLP + 块专属偏置）
        self.shift_bias = nn.Parameter(torch.zeros(hidden_size * 6))

    def forward(self, x, text_emb, timestep_emb):
        # 时间步调制：6个参数（scale, shift, gate各×2）
        mod_params = self.shared_mlp(timestep_emb) + self.shift_bias
        shift_msa, scale_msa, gate_msa, shift_mlp, scale_mlp, gate_mlp = \
            mod_params.chunk(6, dim=-1)

        # Cross-Attention ← 文本
        x = x + gate_msa * self.cross_attn(
            norm(x) * (1 + scale_msa) + shift_msa, text_emb)

        # Self-Attention ← 全局
        x = x + gate_msa * self.self_attn(norm(x))

        # FFN
        x = x + gate_mlp * self.ffn(norm(x) * (1 + scale_mlp) + shift_mlp)
        return x
```

## 4. `modules/dit/wan2_2.py`: MoE(时间步路由)专家
```python
class Wan2_2_DiT(nn.Module):
    """Wan2.2 MoE DiT: 高噪声专家 + 低噪声专家"""

    def __init__(self, config):
        super().__init__()
        # ★ 两个独立的Dense DiT！
        self.high_noise_model = Wan2_1_DiT(config)  # 高噪声专家 ~14B
        self.low_noise_model = Wan2_1_DiT(config)   # 低噪声专家 ~14B
        # 总参数 ~27B，但推理时仅14B活跃

        self.t_moe = None  # ★ MoE切换阈值时间步（加载权重时设置）

    def select_expert(self, t):
        """根据当前时间步选择专家"""
        if t > self.t_moe:
            return self.high_noise_model   # 高噪声阶段 → 布局专家
        else:
            return self.low_noise_model    # 低噪声阶段 → 细节专家

    def forward(self, x, timestep, text_emb, **kwargs):
        t = timestep.item() if isinstance(timestep, torch.Tensor) else timestep

        # ★ 选择并加载对应专家
        if t > self.t_moe:
            model = self._load_expert('high_noise')
        else:
            model = self._load_expert('low_noise')

        return model(x, timestep, text_emb, **kwargs)

    def _load_expert(self, required_name):
        """显存管理：激活所需专家，卸载另一个"""
        offload_name = 'low_noise_model' if required_name == 'high_noise_model' \
                        else 'high_noise_model'

        if self.offload_model:
            # 将非活跃专家卸载到CPU
            if next(getattr(self, offload_name).parameters()).device.type == 'cuda':
                getattr(self, offload_name).to('cpu')
            # 将活跃专家加载到GPU
            if next(getattr(self, required_name).parameters()).device.type == 'cpu':
                getattr(self, required_name).to(self.device)

        return getattr(self, required_name)
```
MoE切换点：SNR(t_moe) = SNR_min / 2
- t_moe 通常设置在 ~800步（总1000步的前80%）, 推理时GPU上始终只有一个14B模型，显存占用不变
- 去噪初期(t大, SNR低) → 高噪声专家
- 去噪后期(t小, SNR高) → 低噪声专家


## 5. Flow Matching调度器
```python
class FlowMatchScheduler:
    """Rectified Flow调度器 — 线性插值噪声路径"""

    def __init__(self, shift=5.0, num_train_timesteps=1000):
        self.num_train_timesteps = num_train_timesteps
        self.shift = shift  # ★ 时间步偏移，控制采样密度

    def set_timesteps(self, num_inference_steps):
        """设置推理时间步 — 应用shift采样"""
        timesteps = torch.linspace(
            1.0, 0.0, num_inference_steps + 1)  # [1.0 → 0.0]
        # ★ Shift采样：偏向中间时间步
        timesteps = self._shift_schedule(timesteps)
        self.timesteps = timesteps[:-1]

    def _shift_schedule(self, timesteps):
        """Shift Schedule：对数正态偏移
        使采样密度偏向中间时间步，同时关注粗布局和细细节"""
        return 1.0 / (1.0 + (1.0 - timesteps) / timesteps * self.shift)

    def step(self, model_output, timestep, sample):
        """ODE步进：x_{t-1} = x_t + v_pred * dt"""
        dt = timestep - self.prev_timestep  # 时间步差
        prev_sample = sample + model_output * dt
        return prev_sample
```
- Rectified Flow使用线性路径（而非DDPM的弯曲路径），ODE采样更高效
- shift参数控制时间步采样密度：偏向中间步既关注全局布局又照顾细节；Wan2.1 T2V-14B shift=5.0，Wan2.2 MoE可能使用不同的shift值
- 推理仅需20-50步即可收敛（对比DDPM的1000步）

## 6. `distributed/util.py`分布式推理
```python
def init_distributed_group(args):
    """初始化分布式进程组"""
    if args.ulysses_size > 1:
        # Ulysses序列并行：沿注意力头分片
        setup_ulysses(args.ulysses_size)

    if args.dit_fsdp:
        # DiT模块使用FSDP参数分片
        wrap_dit_with_fsdp()

    if args.t5_fsdp:
        # T5编码器使用FSDP参数分片
        wrap_t5_with_fsdp()
```
## 7. 架构
```bash

7.1 架构上的并行策略映射
┌──────────────────────────────────────────────────────────┐
│                    多GPU推理并行策略                      │
├──────────────┬───────────────────────────────────────────┤
│ VAE          │ DP（数据并行）— 显存小，无需分片             │
│ T5 Encoder   │ FSDP（全分片数据并行）— >20GB显存需分片      │
│ DiT (单专家)  │ FSDP + 2D-CP (Ulysses×RingAttention) + DP │
│ DiT (MoE)    │ 同上 + 专家卸载（CPU↔GPU切换）              │
└──────────────┴───────────────────────────────────────────┘


7.2 流程图
用户输入: prompt + (可选) image/audio
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  generate.py — 推理入口                                  │
│  ├── 解析CLI参数                                         │
│  ├── 初始化分布式 (FSDP / Ulysses / DP)                   │
│  ├── 选择Pipeline (WanT2V / WanI2V / WanTI2V / WanS2V)  │
│  └── Prompt扩展 (可选, DashScope/Qwen)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Pipeline.generate()                                      │
│                                                           │
│  ┌─ Step 1: 文本编码 ─────────────────────────────────┐  │
│  │  umT5-XXL → text_emb [B, L_text, D]                │  │
│  │  (可选) T5放CPU节省显存                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─ Step 2: VAE编码 (仅I2V/TI2V/S2V) ───────────────┐  │
│  │  Wan2.1 VAE: x → z [B,16,T/4,H/8,W/8]  (128×)    │  │
│  │  Wan2.2 VAE: x → z [B,48,T/4,H/16,W/16] (1024×)  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─ Step 3: 初始化噪声 ───────────────────────────────┐  │
│  │  z_T ~ N(0, I)  [B, C, F, H', W']                │  │
│  │  (I2V: 首帧替换为image_latent)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─ Step 4: Flow Matching去噪循环 ────────────────────┐  │
│  │  for t in timesteps:                               │  │
│  │    ┌─ MoE专家选择 (Wan2.2 A14B) ──────────────┐    │  │
│  │    │  if t > t_moe → high_noise_model (14B)   │    │  │
│  │    │  else        → low_noise_model  (14B)    │    │  │
│  │    │  (非活跃专家卸载到CPU)                      │    │  │
│  │    └────────────────────────────────────────────┘    │  │
│  │                                                      │  │
│  │    v_pred = DiT(z_t, t, text_emb)                  │  │
│  │                                                      │  │
│  │    ┌─ CFG (guidance_scale > 1) ────────────────┐    │  │
│  │    │  v = v_uncond + s * (v_cond - v_uncond)   │    │  │
│  │    └────────────────────────────────────────────┘    │  │
│  │                                                      │  │
│  │    z_{t-dt} = z_t + v * dt  (Rectified Flow ODE)   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─ Step 5: VAE解码 ──────────────────────────────────┐  │
│  │  z_0 → VAE Decoder → video [B, 3, T, H, W]       │  │
│  │  (分块解码，O(1)显存，支持无限长)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  save_video() / merge_video_audio()                      │
│  → MP4输出                                               │
└─────────────────────────────────────────────────────────┘
```

