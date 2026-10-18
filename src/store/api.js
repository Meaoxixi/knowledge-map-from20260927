// 统一数据接口：探测运行模式，前端只通过这里访问知识数据，
// 不直接依赖本地文件或浏览器存储的具体实现。
import { localAdapter } from "./localAdapter.js";
import { indexedDbAdapter } from "./indexedDbAdapter.js";

let adapter = null;

// 带超时的 fetch，避免本地服务探测卡住
function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

// 探测：本地文件服务可用 -> localAdapter；否则 -> indexedDbAdapter（在线体验模式）
export async function initStore() {
  if (adapter) return adapter;
  try {
    const res = await fetchWithTimeout("http://localhost:8787/api/health", 1500);
    if (res.ok) {
      const data = await res.json();
      if (data.mode === "local") {
        adapter = localAdapter;
        return adapter;
      }
    }
  } catch {
    // 本地服务不可用，走浏览器存储
  }
  adapter = indexedDbAdapter;
  return adapter;
}

export function getMode() {
  return adapter?.mode || "detecting";
}

// 统一接口（App 组件只调用这一层）
export const api = {
  getNodes: () => adapter.getNodes(),
  getNode: id => adapter.getNode(id),
  createNode: data => adapter.createNode(data),
  updateNode: (id, patch) => adapter.updateNode(id, patch),
  deleteNode: id => adapter.deleteNode(id),
  moveNode: (id, to) => adapter.moveNode(id, to),
  getEdges: () => adapter.getEdges(),
  createEdge: data => adapter.createEdge(data),
  updateEdge: (id, patch) => adapter.updateEdge(id, patch),
  deleteEdge: id => adapter.deleteEdge(id),
  getLayout: () => adapter.getLayout(),
  saveLayout: layout => adapter.saveLayout(layout),
  exportGraph: () => adapter.exportGraph(),
  importGraph: data => adapter.importGraph(data),
};
