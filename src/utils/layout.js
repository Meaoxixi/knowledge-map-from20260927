// Layout is explicit and stable by design. Add coordinates to graphData.js when adding nodes.
export const VIEWBOX = { width: 1200, height: 1440 };
export const stageOrder = { aug: 0, sep: 1, oct: 2 };

export function isVisibleAtStage(node, stageId) {
  return stageOrder[node.stage] <= stageOrder[stageId];
}

export function semanticLevel(scale) {
  if (scale < 0.48) return "overview";
  if (scale < 0.88) return "themes";
  return "details";
}

export function visibleNodeAtZoom(node, scale, expandedIds) {
  const semantic = semanticLevel(scale);
  if (semantic === "overview") return node.level <= 1;
  if (semantic === "themes") return node.level <= 2 || expandedIds.has(node.id);
  return node.level <= 3 || expandedIds.has(node.id);
}
