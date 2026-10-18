// All content is illustrative demo data. Replace nodes and edges with your own records.
export const stages = [
  { id: "aug", date: "08.21", month: "AUG", title: "基础调研", subtitle: "建立技术地图", description: "识别世界模型的主要范式、能力边界与评测难点。" },
  { id: "sep", date: "09.12", month: "SEP", title: "技术路线梳理", subtitle: "从认知到问题", description: "把调研结论组织为模型、数据、评测三个分析维度。" },
  { id: "oct", date: "10.18", month: "OCT", title: "研究问题形成", subtitle: "形成可验证方向", description: "探索评测反馈如何进入数据筛选与训练闭环。" }
];

export const nodes = [
  { id:"world-models", title:"世界模型技术地图", short:"世界模型", type:"root", stage:"aug", x:600,y:90, level:0, summary:"从行业调研逐步形成研究问题的总览入口。", detail:"这是一条示例性的学习演化路径。可将此节点替换为自己的阶段性研究主题。", tags:["总览"] },
  { id:"survey", title:"工业界与学术界路线对比", short:"路线对比", type:"topic", stage:"aug", x:600,y:220, level:1, summary:"比较不同团队的目标、训练范式与系统取舍。", detail:"可从建模目标、输入输出、生成/预测能力、交互方式、训练数据、部署形态等维度建立对比表。当前内容仅作为信息组织示例。", tags:["调研","对比"] },
  { id:"paradigm", title:"世界模型建模范式", short:"建模范式", type:"topic", stage:"aug", x:340,y:350, level:2, summary:"不同方法如何表示环境状态与未来演化。", detail:"可进一步记录自回归视频生成、潜空间动力学、动作条件生成、显式/隐式状态建模等范式，并标注各自适用场景与证据来源。", tags:["模型"] },
  { id:"io", title:"输入、输出与生成能力", short:"输入 / 输出", type:"topic", stage:"aug", x:600,y:350, level:2, summary:"梳理条件输入、生成目标与可控能力。", detail:"记录模型接受的图像、视频、文本或动作条件，以及输出视频、状态预测、可交互环境等能力。建议每条能力都链接到论文或官方文档。", tags:["能力"] },
  { id:"data-survey", title:"训练数据与数据构建", short:"训练数据", type:"topic", stage:"aug", x:860,y:350, level:2, summary:"数据来源、清洗策略、覆盖范围和标注方式。", detail:"记录数据采集来源、去重、质量过滤、场景覆盖、动作/状态标注与数据分布。重点区分公开信息与个人推断。", tags:["数据"] },
  { id:"eval-survey", title:"现有评估方式及局限", short:"评估局限", type:"topic", stage:"aug", x:600,y:485, level:2, summary:"评估指标是否能反映生成质量与实际可用性。", detail:"可对比视觉质量、时序一致性、动作可控性、物理合理性、语义对齐与推理效率等指标，并记录评估器的偏差和适用边界。", tags:["评测"] },
  { id:"synthesis", title:"技术路线、能力边界与关键挑战", short:"关键挑战", type:"summary", stage:"aug", x:600,y:625, level:1, summary:"将分散调研汇总为后续分析框架。", detail:"这是一个阶段性归纳节点。请在真实研究中为每个判断补充来源、反例与置信度，避免将示例关系误当作已证实结论。", tags:["阶段总结"] },
  { id:"dimensions", title:"三个分析维度", short:"分析维度", type:"summary", stage:"sep", x:600,y:780, level:1, summary:"从调研总结中组织出模型、数据与评测问题。", detail:"模型、数据与评测是用于拆解问题的分析维度，彼此可能存在反馈关系，不应被简单解释为单向因果链。", tags:["问题归纳"] },
  { id:"model", title:"模型层面", short:"模型", type:"branch", stage:"sep", x:270,y:945, level:2, summary:"架构、时序建模、生成能力与一致性。", detail:"关注模型架构与状态表示、长时序一致性、可控生成、推理成本，以及训练和推理中的关键瓶颈。", tags:["模型开发"] },
  { id:"data", title:"数据层面", short:"数据", type:"branch", stage:"sep", x:600,y:945, level:2, summary:"采集、清洗、质量筛选与覆盖范围。", detail:"关注数据质量与覆盖范围、场景/动作分布、低质量样本识别，以及筛选策略对下游训练效果的影响。", tags:["数据开发"] },
  { id:"evaluation", title:"评测层面", short:"评测", type:"branch", stage:"sep", x:930,y:945, level:2, summary:"质量指标、评测模型、效率与一致性。", detail:"关注评测结果是否与人工判断和下游任务效果一致，以及评测器的成本、泛化能力和反馈可操作性。", tags:["评测体系"] },
  { id:"model-consistency", title:"生成一致性与稳定性", short:"一致性", type:"detail", stage:"oct", x:150,y:1110, level:3, summary:"从单帧质量扩展到跨帧、跨动作的稳定性。", detail:"可建立场景身份、几何结构、运动轨迹和物理规律等维度，并明确每个维度的可计算定义与失败案例。", tags:["模型"] },
  { id:"model-training", title:"训练与推理关键问题", short:"训练 / 推理", type:"detail", stage:"oct", x:350,y:1110, level:3, summary:"定位训练目标、采样策略和推理效率的权衡。", detail:"记录训练目标、推理延迟、显存占用、可控性与质量的权衡。具体问题应由实验或可靠来源支持。", tags:["模型"] },
  { id:"data-quality", title:"数据质量筛选", short:"质量筛选", type:"detail", stage:"oct", x:490,y:1110, level:3, summary:"探索快速、可靠的生成结果质量评价器。", detail:"候选方向包括视觉质量、时序一致性、语义一致性与任务相关指标的组合。需要通过人工偏好、下游训练收益或任务指标验证筛选器价值。", tags:["数据","评测器"] },
  { id:"data-coverage", title:"数据分布与覆盖范围", short:"分布覆盖", type:"detail", stage:"oct", x:700,y:1110, level:3, summary:"检查训练数据是否覆盖关键场景和状态转移。", detail:"可分析场景、运动模式、光照、视角、对象类别和稀有事件的覆盖情况，并将分布缺口与生成失败案例关联。", tags:["数据"] },
  { id:"eval-models", title:"评测指标与模型比较", short:"评测器比较", type:"detail", stage:"oct", x:850,y:1110, level:3, summary:"比较精度、速度、稳定性与反馈可解释性。", detail:"评估协议可包含人工一致性、排序相关性、跨域鲁棒性、吞吐量和单样本延迟。应在固定数据集与统一计算预算下比较。", tags:["评测"] },
  { id:"feedback-loop", title:"评测反馈进入数据与训练闭环", short:"反馈闭环", type:"detail", stage:"oct", x:1050,y:1110, level:3, summary:"让评估结果不仅用于打分，也能指导数据与训练。", detail:"示例闭环：评测器发现问题 → 定位数据子集/失败类型 → 调整筛选或采样策略 → 训练/微调 → 用独立评测集验证收益。需警惕评测器与训练目标同源导致的过拟合。", tags:["闭环"] },
  { id:"research-summary", title:"从模型、数据与评测理解世界模型演化", short:"研究框架", type:"final", stage:"oct", x:600,y:1300, level:1, summary:"综合研究地图：从技术调研走向可验证问题。", detail:"当前综合总结是一个待检验的研究组织框架，而不是研究结论。后续可以为每个分支补充论文、实验、证据强度、待验证假设和下一步行动。", tags:["综合总结"] }
];

export const edges = [
  ["world-models","survey","展开"], ["survey","paradigm","拆解"], ["survey","io","拆解"],
  ["survey","data-survey","拆解"], ["survey","eval-survey","拆解"],
  ["paradigm","synthesis","归纳"], ["io","synthesis","归纳"], ["data-survey","synthesis","归纳"], ["eval-survey","synthesis","归纳"],
  ["synthesis","dimensions","进一步组织"], ["dimensions","model","拆分"], ["dimensions","data","拆分"], ["dimensions","evaluation","拆分"],
  ["model","model-consistency","细化"], ["model","model-training","细化"], ["data","data-quality","细化"],
  ["data","data-coverage","细化"], ["evaluation","eval-models","细化"], ["evaluation","feedback-loop","细化"],
  ["data-quality","feedback-loop","反馈"], ["eval-models","feedback-loop","反馈"],
  ["model-consistency","research-summary","综合"], ["model-training","research-summary","综合"],
  ["data-quality","research-summary","综合"], ["data-coverage","research-summary","综合"],
  ["eval-models","research-summary","综合"], ["feedback-loop","research-summary","综合"]
].map(([source,target,label], i) => ({ id:`e${i}`, source, target, label }));
