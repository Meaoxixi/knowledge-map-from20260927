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
      const fallbackId = f.replace(/\.md$/, "");
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
