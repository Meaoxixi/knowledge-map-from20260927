// mock 树生成器：plan P0-6 —— 300~400 节点、4~5 层、幂律分布的随机知识树
// 严格按每层累计目标数生成：层数逐层铺开，"亮核 + 逐层外扩球壳 + 越外越多"。
// 输出与真实数据同构的 nodes/edges，可直接喂给 radialSphereLayout。

import { mulberry32 } from "./random.js";

const SEED = 20260927;

export function genMockTree(opts = {}) {
  const {
    targetNodes = 350,
    maxLevels = 5,
    seed = SEED,
  } = opts;
  const rand = mulberry32(seed);

  const nodes = [];
  const edges = [];

  // 每层节点在总量中的占比（根 1 个，逐层增多，最外层最多）
  const shares = [1, 6, 16, 30, 47]; // 到 maxLevels=5 即 idx0..4 对应 level 1..5
  // 归一化到 targetNodes（根固定1）
  const sumShare = shares.slice(0, maxLevels).reduce((a, b) => a + b, 0);
  const perLevel = shares.slice(0, maxLevels).map(s => Math.max(1, Math.round((s / sumShare) * (targetNodes - 1))));
  // 总节点数 = 1(根) + ΣperLevel；若不足 targetNodes，最后补到最深层
  let planned = 1 + perLevel.reduce((a, b) => a + b, 0);

  function push(parentId, level, tag) {
    if (nodes.length >= targetNodes) return null;
    const id = `${parentId}-${level}-${tag}-${Math.floor(rand() * 1e6)}`;
    const name = { 1: "研究分支", 2: "子领域", 3: "专题", 4: "文献", 5: "条目" }[level] || "条目";
    nodes.push({ id, title: `${name} ${tag}${rand() < 0.2 ? "·综述" : ""}`, level });
    edges.push({ source: parentId, target: id, type: "extends", label: "细化" });
    return id;
  }

  const rootId = "mock-root";
  nodes.push({ id: rootId, title: "知识宇宙", level: 0 });

  let currentParents = [rootId];

  for (let li = 0; li < maxLevels; li++) {
    const lvl = li + 1;
    const wantThisLevel = perLevel[li];
    const nextParents = [];

    // 逐父分配：轮转保证均匀，幂律抖动让部分父多子
    let remaining = wantThisLevel;
    let pi = 0;
    while (remaining > 0 && nodes.length < targetNodes && currentParents.length) {
      const p = currentParents[pi % currentParents.length];
      pi++;
      // 跳过可能已经超量的体会——简单轮转即可
      const batch = Math.max(1, Math.min(remaining, Math.round(wantThisLevel / currentParents.length) + (rand() < 0.2 ? 1 : 0)));
      for (let k = 0; k < batch && remaining > 0 && nodes.length < targetNodes; k++) {
        const cid = push(p, lvl, k);
        if (!cid) break;
        nextParents.push(cid);
        remaining--;
      }
      // 防止死循环：如果轮了一整圈没推进，强制给当前父补一个
      if (pi > currentParents.length * 3 && remaining > 0) {
        const cid = push(p, lvl, "spill-" + nodes.length);
        if (cid) { nextParents.push(cid); remaining--; }
      }
    }

    // 这一层结束后，下一层的父 = 本层节点
    currentParents = nextParents;
    if (!currentParents.length) break;
  }

  // 兜底：还差最后几个就挂到最深层
  if (nodes.length < targetNodes && currentParents.length) {
    while (nodes.length < targetNodes) {
      const p = currentParents[(rand() * currentParents.length) | 0];
      nodes.push({ id: `tail-${nodes.length}`, title: `补充文献 ${nodes.length}`, level: maxLevels });
      edges.push({ source: p.id, target: nodes[nodes.length - 1].id, type: "extends", label: "细化" });
    }
  }

  return { nodes, edges };
}
