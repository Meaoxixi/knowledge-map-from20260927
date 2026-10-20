// 3D 放射球布局（Radial Sphere / Ball Tree Layout）
// 输入：nodes / edges + 配置，输出每个节点的三维坐标 + 深度 + 子节点计数。
// 深度来源：复用现有数据的 level 字段（研究体系层级）——plan.md 说"层级深度=球壳半径"，
//   这里 level 最小的一批 = 根(最内层)，level 越大越靠外。
// 父子树边：extends 类边（source.level < target.level）。
// 确定性随机（固定 seed），一次性计算，不做力导向模拟。

import { mulberry32 } from "./random.js";

// ---- 配置（对应 plan.md「可调参数速查表」，v2 收紧的层间距/锥角）----
const CONFIG = {
  layerGap: 5,             // 相邻深度球壳半径间距（plan P0-4: 4~6）
  base: 0.15,              // 节点半径公式 size = base + k·sqrt(count)
  k: 0.6,
  sizeBy: "descendantCount", // descendantCount | childrenCount
  seed: 20260927,
  coneMin: 0.44,           // 25° 子节点锥角下界（rad）
  coneMax: 0.70,           // 40° 锥角上界（rad）
};

// 父 -> 子映射（extends 边且低 level 指向高 level）
function buildTree(nodes, edges) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const parentOf = new Map();
  const childrenOf = new Map();
  for (const e of (edges || [])) {
    const s = byId[e.source], t = byId[e.target];
    if (!s || !t) continue;
    const isExtends = e.type === "extends" || e.label === "细化";
    // extends 边本身即父->子（不复用 level 判定，避免同 level 父子/分类层级漏配）
    if (isExtends && !parentOf.has(t.id)) {
      parentOf.set(t.id, s.id);
      if (!childrenOf.has(s.id)) childrenOf.set(s.id, []);
      childrenOf.get(s.id).push(t.id);
    }
  }
  // 兜底：孤儿节点(reference 边)也挂到 source，让整棵连通（reference 语义弱于 extends）
  for (const e of (edges || [])) {
    const s = byId[e.source], t = byId[e.target];
    if (!s || !t) continue;
    if (!parentOf.has(t.id) && !parentOf.has(s.id) || (parentOf.has(s.id) && !parentOf.has(t.id))) {
      parentOf.set(t.id, s.id);
      if (!childrenOf.has(s.id)) childrenOf.set(s.id, []);
      childrenOf.get(s.id).push(t.id);
    }
  }
  return { parentOf, childrenOf };
}

function computeCounts(nodes, childrenOf) {
  const childrenCount = Object.fromEntries(nodes.map(n => [n.id, (childrenOf.get(n.id) || []).length]));
  const descendantCount = {};
  function visit(id) {
    let total = 1;
    for (const c of (childrenOf.get(id) || [])) total += visit(c);
    descendantCount[id] = total;
    return total;
  }
  for (const n of nodes) if (descendantCount[n.id] === undefined) visit(n.id);
  return { childrenCount, descendantCount };
}

// 主入口
export function radialSphereLayout(nodes, edges, opts = {}) {
  const cfg = { ...CONFIG, ...opts };
  const rand = mulberry32(cfg.seed);
  const { parentOf, childrenOf } = buildTree(nodes, edges);
  const { childrenCount, descendantCount } = computeCounts(nodes, childrenOf);
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  // 深度 = level 归一化：最小 level = 0 根层
  const minLevel = Math.min(...nodes.map(n => n.level ?? 2));
  const maxLevel = Math.max(...nodes.map(n => n.level ?? 2));
  const maxDepth = maxLevel - minLevel;
  const depthOf = n => (n.level ?? 2) - minLevel;

  // ---- 放射树布局：方向沿父子路径向外展，子节点在父方向圆锥内小幅偏转 ----
  // 根层节点均匀铺在球面；子节点继承父方向 + 锥角/方位角随机偏转（25~40°），
  // 形成"树状放射"的三维结构。
  const dir = new Map();
  const pos = new Map();

  function place(id, parentDir) {
    const node = byId[id];
    const d = depthOf(node);
    dir.set(id, parentDir);
    const R = d * cfg.layerGap;
    pos.set(id, { x: parentDir.x * R, y: parentDir.y * R, z: parentDir.z * R });

    const cids = childrenOf.get(id) || [];
    cids.forEach(cid => {
      const cone = Math.min(cfg.coneMax, (rand() * 0.5 + 0.25) * (cfg.coneMax - cfg.coneMin) + cfg.coneMin);
      const azim = rand() * Math.PI * 2;
      const { x: px, y: py, z: pz } = parentDir;
      // 与父方向正交的单位基 u
      let ux, uy, uz;
      if (Math.abs(px) < 0.95) { const n = Math.hypot(px, py, pz) || 1; ux = -py / n; uy = px / n; uz = 0; }
      else { ux = 0; uy = -pz; uz = py; }
      // 第二正交基 v = cross(父, u)
      const vx = py * uz - pz * uy, vy = pz * ux - px * uz, vz = px * uy - py * ux;
      const cosA = Math.cos(azim), sinA = Math.sin(azim);
      const wi = { x: ux * cosA + vx * sinA, y: uy * cosA + vy * sinA, z: uz * cosA + vz * sinA };
      const cd = Math.cos(cone), sd = Math.sin(cone);
      const tmp = {
        x: px * cd + wi.x * sd,
        y: py * cd + wi.y * sd,
        z: pz * cd + wi.z * sd,
      };
      const len = Math.hypot(tmp.x, tmp.y, tmp.z) || 1;
      const childDir = { x: tmp.x / len, y: tmp.y / len, z: tmp.z / len };
      place(cid, childDir);
    });
  }

  // 根层节点方向：均匀分布在球上的确定性伪随机
  const rootIds = nodes.filter(n => (n.level ?? 2) === minLevel).map(n => n.id);
  rootIds.forEach(id => {
    const u = rand() * 2 - 1;
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    place(id, { x: s * Math.cos(phi), y: s * Math.sin(phi), z: u });
  });

  // 连线（供组件使用）父边映射 —— 复用 buildTree 的 parentOf
  const parentEdgeOf = Object.fromEntries(parentOf);

  const cntFn = cfg.sizeBy === "childrenCount" ? childrenCount : descendantCount;

  return nodes.map(n => {
    const p = pos.get(n.id) || { x: 0, y: 0, z: 0 };
    const count = cntFn[n.id] ?? 0;
    return {
      ...n,
      x: p.x, y: p.y, z: p.z,
      _depth: depthOf(n),
      _maxDepth: maxDepth,
      _childrenCount: childrenCount[n.id] || 0,
      _descendantCount: descendantCount[n.id] || 0,
      _size: cfg.base + cfg.k * Math.sqrt(count),
      _color: "#ffffff",
      _parent: parentEdgeOf[n.id] || null,
    };
  });
}

export const layoutConfig = { ...CONFIG, maxDepth: 0 };
