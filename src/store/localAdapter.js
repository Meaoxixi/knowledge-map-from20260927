// 本地文件适配器：通过 HTTP 调用本地知识库文件服务（server/index.js）。
// 仅当本地服务可用时使用；部署到静态托管时改走 indexedDbAdapter。
import { genId } from "./types.js";

const BASE = "http://localhost:8787";

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `请求失败：${res.status}`);
  return data;
}

export const localAdapter = {
  mode: "local",

  async getNodes() {
    const { nodes } = await req("GET", "/api/nodes?zone=all");
    return nodes;
  },
  async getNode(id) {
    const { node } = await req("GET", `/api/nodes/${id}`);
    return node;
  },
  async createNode(data) {
    const { node } = await req("POST", "/api/nodes", { ...data, id: data.id || genId() });
    return node;
  },
  async updateNode(id, patch) {
    const { node } = await req("PUT", `/api/nodes/${id}`, patch);
    return node;
  },
  async deleteNode(id) {
    await req("DELETE", `/api/nodes/${id}`);
  },
  async moveNode(id, to) {
    const { node } = await req("POST", `/api/nodes/${id}/move`, { to });
    return node;
  },
  async getEdges() {
    const { edges } = await req("GET", "/api/edges");
    return edges;
  },
  async createEdge(data) {
    const { edge } = await req("POST", "/api/edges", { ...data, id: data.id || genId("edge") });
    return edge;
  },
  async updateEdge(id, patch) {
    const { edge } = await req("PUT", `/api/edges/${id}`, patch);
    return edge;
  },
  async deleteEdge(id) {
    await req("DELETE", `/api/edges/${id}`);
  },
  async getLayout() {
    return await req("GET", "/api/layout");
  },
  async saveLayout(layout) {
    return await req("PUT", "/api/layout", layout);
  },
  async exportGraph() {
    return await req("GET", "/api/export");
  },
  async importGraph(data) {
    return await req("POST", "/api/import", data);
  },
};
