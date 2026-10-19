// 同步脚本：从 confirmed/ + workspace/ 的真实数据生成 src/data/graphData.js。
// 用途：GitHub Pages 等静态托管没有后端，前端 fallback 到 IndexedDB 模式，
//       其初始数据来自 graphData.js。本地改完知识后跑一次本脚本 + push，线上即同步。
// 运行：node scripts/sync-graphdata.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// 读取某目录下所有 .md，解析 frontmatter + 正文
function listNodes(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(raw);
      // fallback id：文件名去掉 __标题 部分（与 server/store.js 一致）
      const fallbackId = f.replace(/\.md$/, "").split("__")[0];
      return { ...data, id: data.id || fallbackId, body: content };
    });
}

// 1) 节点：confirmed + workspace 两区合并
const confirmedNodes = listNodes(path.join(ROOT, "confirmed", "nodes"));
const workspaceNodes = listNodes(path.join(ROOT, "workspace", "nodes"));
const allNodes = [...confirmedNodes, ...workspaceNodes];

// 2) 关系：两区合并
const confirmedEdges = readJson(path.join(ROOT, "confirmed", "relations.json")) || [];
const workspaceEdges = readJson(path.join(ROOT, "workspace", "relations.json")) || [];
const allEdges = [...confirmedEdges, ...workspaceEdges];

// 2b) 引用边：从正文 [[引用]] 合成（与 server/store.js 的 referenceEdges 同逻辑，保证在线模式一致）
// 引用目标支持三种写法：标题、id、完整文件名(id__标题)
const byTitle = new Map();
const idSet = new Set();
allNodes.forEach((n) => {
  const t = (n.title || "").trim();
  if (t && !byTitle.has(t)) byTitle.set(t, n.id);
  idSet.add(n.id);
});
const extractRefs = (body) => {
  if (!body) return [];
  const seen = new Set();
  const re = /\[\[([^\]]+)\]\]/g;
  const out = [];
  let m;
  while ((m = re.exec(body))) {
    const raw = m[1].trim();
    if (!raw) continue;
    const pipe = raw.indexOf("|");
    const target = (pipe === -1 ? raw : raw.slice(0, pipe)).trim();
    const label = pipe === -1 ? "" : raw.slice(pipe + 1).trim();
    if (target && !seen.has(target)) {
      seen.add(target);
      out.push({ target, label });
    }
  }
  return out;
};
const resolveRef = (ref) => {
  if (!ref) return null;
  if (byTitle.has(ref)) return byTitle.get(ref);
  if (idSet.has(ref)) return ref;
  const base = ref.split("__")[0];
  if (idSet.has(base)) return base;
  return null;
};
const existing = new Set(allEdges.map((e) => `${e.source}->${e.target}`));
const refSeen = new Set();
for (const n of allNodes) {
  for (const ref of extractRefs(n.body)) {
    const targetId = resolveRef(ref.target);
    if (!targetId || targetId === n.id) continue;
    const key = `${n.id}->${targetId}`;
    if (existing.has(key) || refSeen.has(key)) continue;
    refSeen.add(key);
    allEdges.push({
      id: `ref-${n.id}-${targetId}`,
      source: n.id,
      target: targetId,
      type: "reference",
      label: ref.label || "引用",
    });
  }
}

// 3) 阶段：从 layout.json
const layout = readJson(path.join(ROOT, "confirmed", "layout.json")) || {};
const stages = layout.stages || [];

// 按阶段顺序 + level 排序，保证生成文件可读、稳定
const stageOrder = stages.map((s) => s.id);
allNodes.sort(
  (a, b) =>
    stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage) ||
    (a.level ?? 0) - (b.level ?? 0)
);

// 映射到 graphData.js 的节点结构（position.x/y -> 顶层 x/y，body -> detail）
const nodes = allNodes.map((n) => ({
  id: n.id,
  title: n.title || n.id,
  short: n.short || n.title || n.id,
  type: n.type || "detail",
  stage: n.stage || "research",
  x: n.position?.x ?? 600,
  y: n.position?.y ?? 400,
  level: n.level ?? 3,
  summary: n.summary || "",
  detail: (n.body || "").trim(),
  tags: n.tags || [],
  status: n.status || "confirmed",
  date: n.date || "",
}));

const edges = allEdges.map((e) => ({
  id: e.id,
  source: e.source,
  target: e.target,
  label: e.label || "",
  type: e.type || "",
}));

const header = `// 此文件由 scripts/sync-graphdata.mjs 自动生成，请勿手改。
// 数据源：confirmed/nodes/*.md + workspace/nodes/*.md + */relations.json + confirmed/layout.json
// 重新生成：node scripts/sync-graphdata.mjs

`;

const out =
  header +
  `export const stages = ${JSON.stringify(stages, null, 2)};\n\n` +
  `export const nodes = ${JSON.stringify(nodes, null, 2)};\n\n` +
  `export const edges = ${JSON.stringify(edges, null, 2)};\n`;

const target = path.join(ROOT, "src", "data", "graphData.js");
fs.writeFileSync(target, out, "utf8");

console.log(`[sync-graphdata] 生成 ${target}`);
console.log(`  节点：${nodes.length}（confirmed ${confirmedNodes.length} + workspace ${workspaceNodes.length}）`);
console.log(`  关系：${edges.length}`);
console.log(`  阶段：${stages.length}`);
