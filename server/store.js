// 本地文件存储：真实读写 Markdown 文件 + relations.json + layout.json。
// 所有路径严格限制在知识库根目录内，不允许逃逸。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { markdownToNode, nodeToMarkdown, extractReferences } from "../src/store/markdown.js";
import { ZONE, genId, SCHEMA_VERSION } from "../src/store/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 知识库根目录 = 项目根目录
export const KB_ROOT = path.resolve(__dirname, "..");

// 安全拼接路径：必须落在 KB_ROOT 内，否则抛错。
function safeJoin(...parts) {
  const target = path.resolve(KB_ROOT, ...parts);
  if (target !== KB_ROOT && !target.startsWith(KB_ROOT + path.sep)) {
    throw new Error(`非法路径，超出知识库根目录：${parts.join("/")}`);
  }
  return target;
}

function zoneDir(zone) {
  if (zone !== ZONE.WORKSPACE && zone !== ZONE.CONFIRMED) {
    throw new Error(`非法区域：${zone}`);
  }
  return safeJoin(zone);
}

// 把任意 id 转成安全的文件名片段
function safeName(id) {
  const s = String(id).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120);
  return s || "node";
}

// 把标题转成安全的文件名片段（保留中文与 Unicode，只清洗文件系统非法字符）
function safeTitle(title) {
  const s = String(title || "")
    .replace(/[\\/:*?"<>|\r\n\t]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s;
}

// 节点 -> 文件名：id__标题.md（可读；id 仍是唯一锚点）
function nodeFileName(node) {
  const base = safeName(node.id);
  const title = safeTitle(node.title);
  return title ? `${base}__${title}.md` : `${base}.md`;
}

function nodesDir(zone) {
  return path.join(zoneDir(zone), "nodes");
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// ---------- 节点 ----------

// 清洗节点：给缺失关键字段的节点兜底默认值，避免前端渲染崩溃。
// 手动建的 md 若漏写 position/status/title，不至于让整个画布崩掉。
function sanitizeNode(node, fallbackZone) {
  const pos = node.position;
  if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") {
    node.position = { x: 600, y: 400 };
  }
  if (!node.status) node.status = fallbackZone;
  if (!node.title) node.title = node.id;
  if (node.level === undefined) node.level = 3;
  if (!node.type) node.type = "detail";
  return node;
}

// 扫描某个区域下的所有 .md，返回节点对象数组（含 body）
export function listNodes(zone) {
  const dir = nodesDir(zone);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      // fallback id：优先用 frontmatter 的 id，缺省时用文件名去掉 __标题 部分
      const fallback = f.replace(/\.md$/, "").split("__")[0];
      return sanitizeNode(markdownToNode(raw, fallback), zone);
    });
}

// 按 id 查找节点；返回 { node, zone, file } 或 null。
// 不依赖文件名：扫描目录，按 frontmatter 里的 id 匹配（文件名可任意，方便手动建节点）。
export function findNode(id) {
  for (const zone of [ZONE.WORKSPACE, ZONE.CONFIRMED]) {
    const dir = nodesDir(zone);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".md")) continue;
      const file = path.join(dir, f);
      const raw = fs.readFileSync(file, "utf8");
      const node = sanitizeNode(markdownToNode(raw, f.replace(/\.md$/, "").split("__")[0]), zone);
      if (node.id === id) return { node, zone, file };
    }
  }
  return null;
}

function writeNodeFile(zone, node) {
  const dir = nodesDir(zone);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, nodeFileName(node));
  fs.writeFileSync(file, nodeToMarkdown(node), "utf8");
  return file;
}

export function createNode({ zone, ...data }) {
  const node = { ...data, schemaVersion: SCHEMA_VERSION };
  if (!node.id) node.id = genId();
  if (!node.status) node.status = zone;
  const file = writeNodeFile(zone, node);
  return { node, file };
}

export function updateNode(id, patch) {
  const found = findNode(id);
  if (!found) throw new Error(`节点不存在：${id}`);
  // 保留未知字段 + 合并 patch；body 单独处理，避免被 frontmatter 覆盖
  const next = { ...found.node, ...patch, id: found.node.id };
  if (patch.body !== undefined) next.body = patch.body;
  // status 变更可能意味着跨区，交给 moveNode 处理
  const targetZone = next.status && next.status !== found.zone ? next.status : found.zone;
  const newFile = writeNodeFile(targetZone, next);
  // 标题变化（文件名变化）或跨区（路径变化）时，删除旧文件（先写后删，避免中断丢失）
  if (newFile !== found.file) {
    fs.rmSync(found.file, { force: true });
  }
  return next;
}

export function deleteNode(id) {
  const found = findNode(id);
  if (!found) return false;
  fs.rmSync(found.file, { force: true });
  // 清理引用该节点的关系
  for (const zone of [ZONE.WORKSPACE, ZONE.CONFIRMED]) {
    const relFile = path.join(zoneDir(zone), "relations.json");
    const rels = readJson(relFile);
    if (!rels) continue;
    const kept = rels.filter(e => e.source !== id && e.target !== id);
    if (kept.length !== rels.length) writeJson(relFile, kept);
  }
  return true;
}

// 区域迁移（工作区 <-> 确认区）：真实移动文件
export function moveNode(id, to) {
  if (to !== ZONE.WORKSPACE && to !== ZONE.CONFIRMED) throw new Error(`非法目标区域：${to}`);
  const found = findNode(id);
  if (!found) throw new Error(`节点不存在：${id}`);
  if (found.zone === to) return found.node;
  const node = { ...found.node, status: to };
  const newFile = writeNodeFile(to, node); // 先写新位置
  fs.rmSync(found.file, { force: true }); // 再删旧位置
  rebalanceEdges(); // 节点区域变化后，重新分配关系的归属
  return node;
}

// 按端点当前区域，把所有关系重新分配到正确 zone
export function rebalanceEdges() {
  const all = [];
  for (const zone of [ZONE.WORKSPACE, ZONE.CONFIRMED]) {
    const relFile = path.join(zoneDir(zone), "relations.json");
    all.push(...(readJson(relFile) || []));
  }
  const confirmed = [];
  const workspace = [];
  for (const e of all) {
    const s = findNode(e.source);
    const t = findNode(e.target);
    if (s && t && s.zone === ZONE.CONFIRMED && t.zone === ZONE.CONFIRMED) confirmed.push(e);
    else workspace.push(e);
  }
  writeJson(path.join(zoneDir(ZONE.CONFIRMED), "relations.json"), confirmed);
  writeJson(path.join(zoneDir(ZONE.WORKSPACE), "relations.json"), workspace);
}

// ---------- 关系 ----------
// 规则：两个端点都在 confirmed → 存 confirmed/relations.json；其余 → workspace/relations.json

export function listEdges() {
  const all = [];
  for (const zone of [ZONE.WORKSPACE, ZONE.CONFIRMED]) {
    const rels = readJson(path.join(zoneDir(zone), "relations.json")) || [];
    all.push(...rels);
  }
  // 动态合成 md 正文 [[标题]] 引用边（不落盘，单一数据源在正文），补充 relations.json 里没有的关系
  const existing = new Set(all.map(e => `${e.source}->${e.target}`));
  const refs = referenceEdges().filter(e => !existing.has(`${e.source}->${e.target}`));
  return [...all, ...refs];
}

// 从所有节点正文提取 [[引用]] 合成"引用边"。
// 引用目标支持三种写法：标题、id、完整文件名(id__标题)。标题重复时取第一个匹配；引用不存在的节点或自身时跳过。
function referenceEdges() {
  const nodes = [...listNodes(ZONE.WORKSPACE), ...listNodes(ZONE.CONFIRMED)];
  const byTitle = new Map();
  const idSet = new Set();
  nodes.forEach(n => {
    const t = (n.title || "").trim();
    if (t && !byTitle.has(t)) byTitle.set(t, n.id);
    idSet.add(n.id);
  });
  // 解析引用 -> 目标节点 id
  const resolveRef = (ref) => {
    if (!ref) return null;
    // 1) 标题
    if (byTitle.has(ref)) return byTitle.get(ref);
    // 2) 直接是 id
    if (idSet.has(ref)) return ref;
    // 3) 完整文件名 id__标题
    const base = ref.split("__")[0];
    if (idSet.has(base)) return base;
    return null;
  };
  const edges = [];
  const seen = new Set();
  for (const n of nodes) {
    for (const ref of extractReferences(n.body)) {
      const targetId = resolveRef(ref.target);
      if (!targetId || targetId === n.id) continue;
      const key = `${n.id}->${targetId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        id: `ref-${n.id}-${targetId}`,
        source: n.id,
        target: targetId,
        type: "reference",
        label: ref.label || "引用",
      });
    }
  }
  return edges;
}

export function createEdge(data) {
  const edge = { id: data.id || genId("edge"), ...data };
  // 按端点所在区域决定关系存放位置：两端都在 confirmed -> confirmed，否则 workspace
  const s = findNode(edge.source);
  const t = findNode(edge.target);
  const zone = (s && t && s.zone === ZONE.CONFIRMED && t.zone === ZONE.CONFIRMED) ? ZONE.CONFIRMED : ZONE.WORKSPACE;
  const relFile = path.join(zoneDir(zone), "relations.json");
  const rels = readJson(relFile) || [];
  rels.push(edge);
  writeJson(relFile, rels);
  return edge;
}

export function updateEdge(id, patch) {
  for (const zone of [ZONE.WORKSPACE, ZONE.CONFIRMED]) {
    const relFile = path.join(zoneDir(zone), "relations.json");
    const rels = readJson(relFile);
    if (!rels) continue;
    const idx = rels.findIndex(e => e.id === id);
    if (idx === -1) continue;
    rels[idx] = { ...rels[idx], ...patch, id };
    writeJson(relFile, rels);
    return rels[idx];
  }
  throw new Error(`关系不存在：${id}`);
}

export function deleteEdge(id) {
  for (const zone of [ZONE.WORKSPACE, ZONE.CONFIRMED]) {
    const relFile = path.join(zoneDir(zone), "relations.json");
    const rels = readJson(relFile);
    if (!rels) continue;
    const kept = rels.filter(e => e.id !== id);
    if (kept.length !== rels.length) {
      writeJson(relFile, kept);
      return true;
    }
  }
  return false;
}

// ---------- 布局 ----------

export function getLayout() {
  return readJson(safeJoin("confirmed", "layout.json")) || {};
}

export function saveLayout(layout) {
  writeJson(safeJoin("confirmed", "layout.json"), layout);
  return layout;
}

// ---------- 导入（覆盖语义：清空后重建，调用方负责先确认） ----------

export function importGraph({ nodes = [], edges = [], layout = {} }) {
  // 清空现有节点与关系
  for (const zone of [ZONE.WORKSPACE, ZONE.CONFIRMED]) {
    const nd = nodesDir(zone);
    if (fs.existsSync(nd)) fs.rmSync(nd, { recursive: true, force: true });
    const relFile = path.join(zoneDir(zone), "relations.json");
    if (fs.existsSync(relFile)) fs.rmSync(relFile, { force: true });
  }
  // 写入节点
  for (const n of nodes) {
    const zone = n.status === ZONE.CONFIRMED ? ZONE.CONFIRMED : ZONE.WORKSPACE;
    writeNodeFile(zone, n);
  }
  // 写入关系：两端都在 confirmed -> confirmed；否则 workspace
  const confirmedEdges = [];
  const workspaceEdges = [];
  const confirmedIds = new Set(nodes.filter(n => n.status === ZONE.CONFIRMED).map(n => n.id));
  for (const e of edges) {
    if (confirmedIds.has(e.source) && confirmedIds.has(e.target)) confirmedEdges.push(e);
    else workspaceEdges.push(e);
  }
  if (confirmedEdges.length) writeJson(path.join(zoneDir(ZONE.CONFIRMED), "relations.json"), confirmedEdges);
  if (workspaceEdges.length) writeJson(path.join(zoneDir(ZONE.WORKSPACE), "relations.json"), workspaceEdges);
  // 布局
  writeJson(safeJoin("confirmed", "layout.json"), layout);
  return { nodes, edges, layout };
}
