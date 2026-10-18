// 此文件由 scripts/sync-graphdata.mjs 自动生成，请勿手改。
// 数据源：confirmed/nodes/*.md + workspace/nodes/*.md + */relations.json + confirmed/layout.json
// 重新生成：node scripts/sync-graphdata.mjs

export const stages = [
  {
    "id": "aug",
    "date": "08.21",
    "month": "AUG",
    "title": "基础调研",
    "subtitle": "建立技术地图",
    "description": "识别世界模型的主要范式、能力边界与评测难点。"
  },
  {
    "id": "sep",
    "date": "09.12",
    "month": "SEP",
    "title": "技术路线梳理",
    "subtitle": "从认知到问题",
    "description": "把调研结论组织为模型、数据、评测三个分析维度。"
  },
  {
    "id": "oct",
    "date": "10.18",
    "month": "OCT",
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
    "status": "confirmed"
  },
  {
    "id": "synthesis",
    "title": "技术路线、能力边界与关键挑战",
    "short": "关键挑战",
    "type": "summary",
    "stage": "aug",
    "x": 470.69759756079503,
    "y": 785.0345294696332,
    "level": 1,
    "summary": "将分散调研汇总为后续分析框架。",
    "detail": "这是一个阶段性归纳节点。请在真实研究中为每个判断补充来源、反例与置信度，避免将示例关系误当作已证实结论。",
    "tags": [
      "阶段总结"
    ],
    "status": "confirmed"
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
    "status": "confirmed"
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
    "status": "workspace"
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
    "status": "workspace"
  },
  {
    "id": "model-consistency",
    "title": "生成一致性与稳定性",
    "short": "一致性",
    "type": "detail",
    "stage": "oct",
    "x": 150,
    "y": 1110,
    "level": 3,
    "summary": "从单帧质量扩展到跨帧、跨动作的稳定性。",
    "detail": "可建立场景身份、几何结构、运动轨迹和物理规律等维度，并明确每个维度的可计算定义与失败案例。",
    "tags": [
      "模型"
    ],
    "status": "confirmed"
  },
  {
    "id": "model-training",
    "title": "训练与推理关键问题",
    "short": "训练 / 推理",
    "type": "detail",
    "stage": "oct",
    "x": 350,
    "y": 1110,
    "level": 3,
    "summary": "定位训练目标、采样策略和推理效率的权衡。",
    "detail": "记录训练目标、推理延迟、显存占用、可控性与质量的权衡。具体问题应由实验或可靠来源支持。\n训练范式也很多",
    "tags": [
      "模型"
    ],
    "status": "confirmed"
  }
];

export const edges = [
  {
    "id": "edge-mvdpum5j-en72d",
    "source": "synthesis",
    "target": "model",
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
    "id": "e14",
    "source": "model",
    "target": "model-training",
    "label": "细化",
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
    "id": "edge-mvdpyd50-zmu09",
    "source": "synthesis",
    "target": "evaluation",
    "label": "",
    "type": "extends"
  }
];
