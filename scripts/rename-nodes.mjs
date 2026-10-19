// 一次性迁移：把 confirmed/nodes、workspace/nodes 下的旧命名文件（id.md）
// 重命名为可读格式 id__标题.md。幂等：已符合新格式的跳过，不改内容。
// 运行：node scripts/rename-nodes.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function safeName(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120) || "node";
}
function safeTitle(title) {
  return String(title || "")
    .replace(/[\\/:*?"<>|\r\n\t]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
function targetName(id, title) {
  const t = safeTitle(title);
  return t ? `${safeName(id)}__${t}.md` : `${safeName(id)}.md`;
}

let renamed = 0;
let skipped = 0;
for (const zone of ["confirmed", "workspace"]) {
  const dir = path.join(ROOT, zone, "nodes");
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const file = path.join(dir, f);
    const { data } = matter(fs.readFileSync(file, "utf8"));
    const id = data.id || f.replace(/\.md$/, "").split("__")[0];
    const title = data.title || "";
    const want = targetName(id, title);
    if (f === want) {
      skipped++;
      continue;
    }
    const dest = path.join(dir, want);
    if (fs.existsSync(dest)) {
      console.log(`  [跳过] ${f} → ${want}（目标已存在）`);
      continue;
    }
    fs.renameSync(file, dest);
    renamed++;
    console.log(`  ${f}  →  ${want}`);
  }
}
console.log(`\n完成：重命名 ${renamed} 个，已符合/跳过 ${skipped} 个`);
