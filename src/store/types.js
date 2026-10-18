// 统一知识数据模型：常量、默认值、校验规则。
// 前端与后端（server/）共用此模块，保证字段定义一致。

export const SCHEMA_VERSION = 1;

// 节点所属区域
export const ZONE = {
  WORKSPACE: "workspace",
  CONFIRMED: "confirmed",
};

// 关系类型
export const EDGE_TYPES = {
  supports: "支持/论证",
  extends: "扩展",
  compares: "比较",
  implements: "实现",
  evaluates: "评测",
  feedback: "反馈/修正",
};

// 节点视觉分类（保留原有语义缩放与配色）
export const NODE_TYPES = {
  root: "核心主题",
  topic: "知识主题",
  summary: "阶段总结",
  branch: "研究分支",
  detail: "细化问题",
  final: "综合框架",
};

// 新建节点的默认字段
export function defaultNode({ id, title, status = ZONE.WORKSPACE, x = 600, y = 400 }) {
  return {
    id,
    title,
    status,
    tags: [],
    stage: "research",
    position: { x, y },
    summary: "",
    level: 3,
    type: "detail",
    schemaVersion: SCHEMA_VERSION,
    body: "",
  };
}

// 生成唯一 ID（时间戳 + 随机后缀，保证本地与在线都不重复）
export function genId(prefix = "node") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${t}-${r}`;
}

// 校验节点基本合法性；返回错误数组（空数组 = 通过）
export function validateNode(node, allNodes = []) {
  const errors = [];
  if (!node || typeof node !== "object") return ["节点不是有效对象"];
  if (!node.id) errors.push("缺少 id");
  if (allNodes.some(n => n.id === node.id && n !== node)) errors.push(`id 重复：${node.id}`);
  if (node.status && ![ZONE.WORKSPACE, ZONE.CONFIRMED].includes(node.status)) {
    errors.push(`非法状态：${node.status}`);
  }
  if (node.position && (typeof node.position.x !== "number" || typeof node.position.y !== "number")) {
    errors.push("position.x / position.y 必须是数字");
  }
  return errors;
}

// 校验关系引用是否指向存在的节点；返回错误数组
export function validateEdge(edge, nodeIds) {
  const errors = [];
  if (!edge || typeof edge !== "object") return ["关系不是有效对象"];
  if (!edge.id) errors.push("关系缺少 id");
  if (!nodeIds.has(edge.source)) errors.push(`关系引用了不存在的源节点：${edge.source}`);
  if (!nodeIds.has(edge.target)) errors.push(`关系引用了不存在的目标节点：${edge.target}`);
  return errors;
}
