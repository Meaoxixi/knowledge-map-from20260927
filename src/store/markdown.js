// Markdown <-> 节点对象 的转换。前后端共用（导出/导入、在线模式、文件读写）。
// 使用 gray-matter 解析与序列化 YAML frontmatter，正文为 Markdown 内容。
import matter from "gray-matter";
import { SCHEMA_VERSION } from "./types.js";

// 节点对象 -> 带 frontmatter 的 Markdown 字符串。
// node.body 之外的字段全部写入 frontmatter，保留未知字段。
export function nodeToMarkdown(node) {
  const { body = "", ...meta } = node;
  return matter.stringify(body, meta);
}

// Markdown 字符串 -> 节点对象。frontmatter 合并进返回对象，正文挂到 body。
// fallbackId 用于文件里缺少 id 时兜底（用文件名）。
export function markdownToNode(md, fallbackId) {
  const { data, content } = matter(md);
  const node = { ...data, body: content };
  if (!node.id) node.id = fallbackId;
  if (node.schemaVersion === undefined) node.schemaVersion = SCHEMA_VERSION;
  return node;
}
