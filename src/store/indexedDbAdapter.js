// 在线浏览器存储适配器：用 IndexedDB 保存访客的运行时修改。
// 部署到 GitHub Pages 等静态托管时使用；访客的修改只保存在自己的浏览器，不写入仓库。
import { seedGraph } from "./seedData.js";
import { genId, SCHEMA_VERSION } from "./types.js";

const DB_NAME = "zoomable-knowledge-map";
const STORE = "kb";
const KEY = "graph";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getGraph() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => {
      if (req.result) return resolve(req.result);
      // 首次访问：用部署快照初始化
      const seed = seedGraph();
      putGraph(seed).then(() => resolve(seed)).catch(reject);
    };
    req.onerror = () => reject(req.error);
  });
}

async function putGraph(graph) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(graph, KEY);
    tx.oncomplete = () => resolve(graph);
    tx.onerror = () => reject(tx.error);
  });
}

export const indexedDbAdapter = {
  mode: "browser",

  async getNodes() {
    return (await getGraph()).nodes;
  },
  async getNode(id) {
    const g = await getGraph();
    return g.nodes.find(n => n.id === id) || null;
  },
  async createNode(data) {
    const g = await getGraph();
    const node = { ...data, id: data.id || genId(), schemaVersion: SCHEMA_VERSION };
    g.nodes.push(node);
    await putGraph(g);
    return node;
  },
  async updateNode(id, patch) {
    const g = await getGraph();
    const idx = g.nodes.findIndex(n => n.id === id);
    if (idx === -1) throw new Error(`节点不存在：${id}`);
    g.nodes[idx] = { ...g.nodes[idx], ...patch, id };
    await putGraph(g);
    return g.nodes[idx];
  },
  async deleteNode(id) {
    const g = await getGraph();
    g.nodes = g.nodes.filter(n => n.id !== id);
    g.edges = g.edges.filter(e => e.source !== id && e.target !== id);
    await putGraph(g);
  },
  async moveNode(id, to) {
    const g = await getGraph();
    const n = g.nodes.find(n => n.id === id);
    if (!n) throw new Error(`节点不存在：${id}`);
    n.status = to;
    await putGraph(g);
    return n;
  },
  async getEdges() {
    return (await getGraph()).edges;
  },
  async createEdge(data) {
    const g = await getGraph();
    const edge = { ...data, id: data.id || genId("edge") };
    g.edges.push(edge);
    await putGraph(g);
    return edge;
  },
  async updateEdge(id, patch) {
    const g = await getGraph();
    const idx = g.edges.findIndex(e => e.id === id);
    if (idx === -1) throw new Error(`关系不存在：${id}`);
    g.edges[idx] = { ...g.edges[idx], ...patch, id };
    await putGraph(g);
    return g.edges[idx];
  },
  async deleteEdge(id) {
    const g = await getGraph();
    g.edges = g.edges.filter(e => e.id !== id);
    await putGraph(g);
  },
  async getLayout() {
    return (await getGraph()).layout || {};
  },
  async saveLayout(layout) {
    const g = await getGraph();
    g.layout = layout;
    await putGraph(g);
    return layout;
  },
  async exportGraph() {
    const g = await getGraph();
    return {
      schemaVersion: g.schemaVersion || SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      nodes: g.nodes,
      edges: g.edges,
      layout: g.layout || {},
    };
  },
  async importGraph(data) {
    await putGraph({
      schemaVersion: data.schemaVersion || SCHEMA_VERSION,
      nodes: data.nodes || [],
      edges: data.edges || [],
      layout: data.layout || {},
    });
  },
};
