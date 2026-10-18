// 布局与可见性规则。坐标由节点 position 决定，语义缩放按 level 过滤。
export const VIEWBOX = { width: 1200, height: 1440 };

// 缩放边界：下限防止缩到看不清，上限留一个很宽松的值（放大 8 倍足够看清单个节点细节，
// 再大只会让浮点坐标开始抖动，没有实际价值）。
export const MIN_SCALE = 0.25;
export const MAX_SCALE = 8;

// 时间阶段过滤：节点最早出现的阶段序号 <= 当前阶段序号时可见。
// stageOrder 由 stages 数组动态生成（{ stageId: 序号 }）。
export function isVisibleAtStage(node, stageId, stageOrder) {
  const idx = stageOrder[node.stage] ?? 0;
  const cur = stageOrder[stageId] ?? 0;
  return idx <= cur;
}

export function semanticLevel(scale) {
  if (scale < 0.48) return "overview";
  if (scale < 0.88) return "themes";
  return "details";
}

// 语义缩放对应的默认显示深度：overview=1（根+里程碑），themes=2（含分支），details=3（含细节）。
export function semanticDepth(scale) {
  const semantic = semanticLevel(scale);
  return semantic === "overview" ? 1 : semantic === "themes" ? 2 : 3;
}

// 自适应视图：计算一个缩放比例 + 平移，让所有节点（按 position 圆心）刚好落进 viewBox，
// 四周留 pad 余量（覆盖节点标签的溢出空间）。返回 { scale, pan }。
// 变换语义：v = pan + (600,0) + scale * (p - (600,0))，即 (600,0) 为缩放锚点。
export function fitView(nodes, opts = {}) {
  const { pad = 30, minScale = MIN_SCALE, maxScale = MAX_SCALE } = opts;
  const fallback = { scale: 0.58, pan: { x: -80, y: 10 } };
  if (!nodes?.length) return fallback;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const { x, y } = n.position || {};
    if (typeof x !== "number" || typeof y !== "number") continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (!isFinite(minX)) return fallback;

  const worldW = Math.max(maxX - minX, 1);
  const worldH = Math.max(maxY - minY, 1);
  const availW = VIEWBOX.width - pad * 2;
  const availH = VIEWBOX.height - pad * 2;
  // cover 语义：取宽/高两个方向里“更大”的比例，保证节点撑满至少一个方向。
  // 代价是另一个方向（通常是最上/最下边缘节点）会轻微溢出画面，平移即可看到。
  // 若某方向溢出过多（>1.5 倍），回退到 contain，避免极端数据下节点飞出太远。
  const scaleContain = Math.min(availW / worldW, availH / worldH);
  const scaleCover = Math.max(availW / worldW, availH / worldH);
  const overflow = scaleCover / Math.max(scaleContain, 1e-6);
  const scale = Math.max(minScale, Math.min(maxScale, overflow > 1.5 ? scaleContain : scaleCover));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  // 让节点中心映射到 viewBox 中心 (600, 720)
  const pan = {
    x: -scale * (centerX - 600),
    y: 720 - scale * centerY,
  };
  return { scale, pan };
}
