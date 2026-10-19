---
title: Π3
stage: oct
level: 3
type: detail
status: confirmed
position:
  x: 245.37266317715137
  'y': 1213.7613903428537
summary: 排列等变视觉几何学习
tags:
  - 排列等变
  - 前馈神经网络
id: node-mvf73pft-3ilq2
schemaVersion: 1
date: '2026-10-01'
---




![架构图](./picture/Π3.png)

- register_token：nn.Parameter(torch.randn(1, 1, 5, self.dec_embed_dim))
- 位姿信息通过对所有的patch做avgpool回归得到
- reshape 同构异注意力计算方式
(B×N, hw) 帧内
(B, N×hw) 帧间

> - π³: Scalable Permutation-Equivariant Visual Geometry Learning
> - 团队：上海 AI Lab / 上海交大 / 浙大
> - 年份：ICLR 2026
> - 代码：https://github.com/yyfz/Pi3 
> - 论文：arXiv 2507.13347
