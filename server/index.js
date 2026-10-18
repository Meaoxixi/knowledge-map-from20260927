// 本地知识库文件服务：Node 原生 http，零框架。
// 提供真实 Markdown 文件读写 API，所有路径限制在知识库根目录内。
import http from "node:http";
import {
  listNodes, findNode, createNode, updateNode, deleteNode, moveNode,
  listEdges, createEdge, updateEdge, deleteEdge, getLayout, saveLayout, importGraph,
} from "./store.js";
import { ZONE, validateNode, validateEdge, genId } from "../src/store/types.js";

const PORT = Number(process.env.PORT || 8787);

function send(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", c => { raw += c; if (raw.length > 5e6) reject(new Error("请求体过大")); });
    req.on("end", () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error("JSON 解析失败")); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const parts = url.pathname.split("/").filter(Boolean); // e.g. ["api","nodes","abc"]

  if (req.method === "OPTIONS") return send(res, 204, {});

  try {
    // GET /api/health
    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, { ok: true, mode: "local" });
    }

    // 节点集合 / 单个节点
    if (parts[0] === "api" && parts[1] === "nodes") {
      const id = parts[2];

      // GET /api/nodes?zone=workspace|confirmed|all
      if (req.method === "GET" && !id) {
        const zone = url.searchParams.get("zone") || "all";
        if (zone === "all") {
          const all = [...listNodes(ZONE.WORKSPACE), ...listNodes(ZONE.CONFIRMED)];
          return send(res, 200, { nodes: all });
        }
        return send(res, 200, { nodes: listNodes(zone) });
      }

      // GET /api/nodes/:id
      if (req.method === "GET" && id) {
        const found = findNode(id);
        if (!found) return send(res, 404, { error: `节点不存在：${id}` });
        return send(res, 200, { node: found.node, zone: found.zone });
      }

      // POST /api/nodes
      if (req.method === "POST" && !id) {
        const body = await readBody(req);
        const zone = body.zone || body.status || ZONE.WORKSPACE;
        const nodeData = { ...body, id: body.id || genId(), status: body.status || zone };
        const errs = validateNode(nodeData);
        if (errs.length) return send(res, 400, { error: errs.join("；") });
        const { node } = createNode({ zone, ...nodeData });
        return send(res, 201, { node });
      }

      // POST /api/nodes/:id/move
      if (req.method === "POST" && id && parts[3] === "move") {
        const body = await readBody(req);
        const node = moveNode(id, body.to);
        return send(res, 200, { node });
      }

      // PUT /api/nodes/:id
      if (req.method === "PUT" && id) {
        const body = await readBody(req);
        const node = updateNode(id, body);
        return send(res, 200, { node });
      }

      // DELETE /api/nodes/:id
      if (req.method === "DELETE" && id) {
        deleteNode(id);
        return send(res, 200, { ok: true });
      }
    }

    // 关系
    if (parts[0] === "api" && parts[1] === "edges") {
      const id = parts[2];
      if (req.method === "GET" && !id) return send(res, 200, { edges: listEdges() });
      if (req.method === "POST" && !id) {
        const body = await readBody(req);
        const edge = createEdge(body);
        return send(res, 201, { edge });
      }
      if (req.method === "PUT" && id) {
        const body = await readBody(req);
        const edge = updateEdge(id, body);
        return send(res, 200, { edge });
      }
      if (req.method === "DELETE" && id) {
        deleteEdge(id);
        return send(res, 200, { ok: true });
      }
    }

    // 布局
    if (parts[0] === "api" && parts[1] === "layout") {
      if (req.method === "GET") return send(res, 200, getLayout());
      if (req.method === "PUT") {
        const body = await readBody(req);
        return send(res, 200, saveLayout(body));
      }
    }

    // 导出 / 导入
    if (parts[0] === "api" && parts[1] === "export" && req.method === "GET") {
      return send(res, 200, {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        nodes: [...listNodes(ZONE.WORKSPACE), ...listNodes(ZONE.CONFIRMED)],
        edges: listEdges(),
        layout: getLayout(),
      });
    }

    if (parts[0] === "api" && parts[1] === "import" && req.method === "POST") {
      const body = await readBody(req);
      const nodes = body.nodes || [];
      const edges = body.edges || [];
      const nodeIds = new Set(nodes.map(n => n.id));
      const nodeErrs = nodes.flatMap(n => validateNode(n));
      const edgeErrs = edges.flatMap(e => validateEdge(e, nodeIds));
      if (nodeErrs.length || edgeErrs.length) {
        return send(res, 400, { error: [...nodeErrs, ...edgeErrs].join("；") });
      }
      const result = importGraph(body);
      return send(res, 200, result);
    }

    return send(res, 404, { error: `未找到接口：${url.pathname}` });
  } catch (err) {
    console.error("[kb-server]", err.message);
    return send(res, 500, { error: err.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[kb-server] 知识库文件服务已启动：http://localhost:${PORT}`);
});
