// 初始种子数据：把 src/data/graphData.js 的硬编码数据转换成统一数据模型。
// 本地模式由 server/seed.js 用它生成 confirmed/*.md；在线模式由 indexedDbAdapter 用它做初始展示数据。
import { nodes, edges, stages } from "../data/graphData.js";
import { SCHEMA_VERSION, ZONE } from "./types.js";

export function mapEdgeType(label) {
  if (/归纳|综合|总结/.test(label)) return "supports";
  if (/反馈|修正/.test(label)) return "feedback";
  return "extends";
}

export function seedGraph() {
  const nodeList = nodes.map(({ detail, x, y, status, ...meta }) => ({
    ...meta,
    status: status || ZONE.CONFIRMED,
    position: { x, y },
    schemaVersion: SCHEMA_VERSION,
    body: detail || "",
  }));
  const edgeList = edges.map((e, i) => ({
    ...e,
    type: e.type || mapEdgeType(e.label || ""),
  }));
  return {
    schemaVersion: SCHEMA_VERSION,
    nodes: nodeList,
    edges: edgeList,
    layout: { stages, view: { scale: 0.58, pan: { x: -80, y: 10 } } },
  };
}
