// 一次性迁移脚本：把 src/data/graphData.js 的硬编码数据
// 迁移成 confirmed/ 下的真实 Markdown 文件 + relations.json + layout.json。
// 运行：node server/seed.js  （幂等，可重复运行）
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedGraph } from "../src/store/seedData.js";
import { nodeToMarkdown } from "../src/store/markdown.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIRMED = path.resolve(__dirname, "..", "confirmed");
const NODES_DIR = path.join(CONFIRMED, "nodes");

function safeName(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120) || "node";
}

const graph = seedGraph();

fs.mkdirSync(NODES_DIR, { recursive: true });

// 1) 节点 -> Markdown 文件
let count = 0;
for (const n of graph.nodes) {
  const { body, ...meta } = n;
  const md = nodeToMarkdown({ ...meta, body: body || "" });
  fs.writeFileSync(path.join(NODES_DIR, `${safeName(n.id)}.md`), md, "utf8");
  count++;
}

// 2) 关系 -> confirmed/relations.json
fs.writeFileSync(
  path.join(CONFIRMED, "relations.json"),
  JSON.stringify(graph.edges, null, 2),
  "utf8"
);

// 3) 布局 -> confirmed/layout.json
fs.writeFileSync(
  path.join(CONFIRMED, "layout.json"),
  JSON.stringify(graph.layout, null, 2),
  "utf8"
);

console.log(`[seed] 完成：${count} 个节点 -> confirmed/nodes/*.md`);
console.log(`[seed] ${graph.edges.length} 条关系 -> confirmed/relations.json`);
console.log(`[seed] ${graph.layout.stages?.length || 0} 个阶段 -> confirmed/layout.json`);
