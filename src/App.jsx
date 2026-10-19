// 顶层状态容器：数据加载、状态管理、业务逻辑，组装子组件。
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { VIEWBOX, semanticLevel, semanticDepth, fitView, MIN_SCALE, MAX_SCALE } from "./utils/layout";
import { initStore, getMode, api } from "./store/api";
import { ZONE } from "./store/types";
import { RAIL_W, MAP_MIN_W } from "./constants";
import Rail from "./components/Rail";
import Topbar from "./components/Topbar";
import Canvas from "./components/Canvas";
import Inspector from "./components/Inspector";
import LinkDialog from "./components/LinkDialog";

export default function App() {
  // ---- 视图状态 ----
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const nodeDragRef = useRef(null);
  const appRef = useRef(null);
  const handleRef = useRef(null);

  const [stageId, setStageId] = useState("oct");
  const [scale, setScale] = useState(0.58);
  const [pan, setPan] = useState({ x: -80, y: 10 });
  const [selectedId, setSelectedId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [focusMonth, setFocusMonth] = useState(null); // 聚焦的"年份-月份"；null = 全部高亮
  const [query, setQuery] = useState("");
  const [light, setLight] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [inspectorWidth, setInspectorWidth] = useState(315);
  const [zoneFilter, setZoneFilter] = useState("all");

  // ---- 数据状态 ----
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stages, setStages] = useState([]);
  const [mode, setMode] = useState("detecting");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle");

  // ---- 编辑状态 ----
  const [draft, setDraft] = useState(null);
  const [previewBody, setPreviewBody] = useState(true);
  const [readOnly, setReadOnly] = useState(false);

  // ---- 连线状态（7.3） ----
  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState(null);
  const [linkDialog, setLinkDialog] = useState(null); // { source, target }

  // ---- 初始化 ----
  const reload = useCallback(async () => {
    const [ns, es, layout] = await Promise.all([api.getNodes(), api.getEdges(), api.getLayout()]);
    setNodes(ns);
    setEdges(es);
    if (layout?.stages?.length) setStages(layout.stages);
    setExpanded(new Set());
    setCollapsed(new Set());
    // 数据就绪后自适应缩放，让所有节点刚好铺满画面
    const fit = fitView(ns);
    setScale(fit.scale);
    setPan(fit.pan);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await initStore();
        setMode(getMode());
        await reload();
      } catch (err) {
        console.error("[init]", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  // ---- 保存状态提示 ----
  const flashSave = useCallback((state) => {
    setSaveState(state);
    clearTimeout(flashSave._t);
    flashSave._t = setTimeout(() => setSaveState("idle"), 2200);
  }, []);

  // ---- 派生数据 ----
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  // 所有节点始终可见（时间维度改为"按月聚焦高亮"，不再按阶段隐藏节点）
  const visibleByTime = useMemo(() => new Set(nodes.map(n => n.id)), [nodes]);

  const visibleNodes = useMemo(() => {
    // 区域过滤：工作区视图显示所有节点（正式节点变暗）；全部/确认区视图只显示正式节点
    const zoneVisible = n => zoneFilter === ZONE.WORKSPACE || n.status === ZONE.CONFIRMED;
    const depth = semanticDepth(scale);

    // 层级父子关系：level 递增的边才算“父子”（归纳/综合等回流的边不算），
    // 收起/展开只沿这条树形主干走，避免把回流边误当成子分支。
    const childrenOf = new Map();
    const parentOf = new Map();
    for (const e of edges) {
      const s = nodeMap[e.source], t = nodeMap[e.target];
      if (!s || !t) continue;
      if ((s.level ?? 0) < (t.level ?? 0)) {
        if (!childrenOf.has(e.source)) childrenOf.set(e.source, []);
        childrenOf.get(e.source).push(e.target);
        if (!parentOf.has(e.target)) parentOf.set(e.target, []);
        parentOf.get(e.target).push(e.source);
      }
    }

    const baseOk = id => {
      const n = nodeMap[id];
      return !!n && visibleByTime.has(id) && zoneVisible(n);
    };

    const visible = new Set();
    // 从所有“层级根”（没有层级父节点的节点）出发做广度优先遍历
    const queue = nodes.filter(n => !parentOf.get(n.id)?.length).map(n => n.id);
    while (queue.length) {
      const id = queue.shift();
      const n = nodeMap[id];
      if (!n || !baseOk(id) || visible.has(id)) continue;
      visible.add(id);
      for (const c of (childrenOf.get(id) || [])) {
        const child = nodeMap[c];
        if (!child || !baseOk(c)) continue;
        const withinDepth = (child.level ?? 0) <= depth;
        const reveal = expanded.has(id);   // 父节点被展开 -> 显示超出深度的子节点
        const hide = collapsed.has(id);    // 父节点被收起 -> 隐藏本应显示的子节点
        if (!hide && (withinDepth || reveal)) queue.push(c);
      }
    }
    return nodes.filter(n => visible.has(n.id));
  }, [visibleByTime, zoneFilter, scale, expanded, collapsed, nodes, edges, nodeMap]);

  const visibleIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);
  const shownEdges = useMemo(() => edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target)), [edges, visibleIds]);
  const selected = nodeMap[selectedId];

  // 阶段 id -> 年份-月份（如 aug -> "2026-08"）
  const stageYm = useMemo(
    () => Object.fromEntries(stages.map(s => [s.id, s.ym || (s.date ? String(s.date).split(".")[0] : "")])),
    [stages]
  );

  // 节点所属的"年份-月份"：优先用节点手动录入的编写日期(YYYY-MM-DD)，否则回退到所属阶段。
  const nodeMonth = useCallback((n) => {
    if (n.date && /^\d{4}-\d{2}/.test(String(n.date))) return String(n.date).slice(0, 7);
    return stageYm[n.stage] || null;
  }, [stageYm]);

  // 聚焦集合：focusMonth 为某"年份-月份"时，高亮属于该月的节点，其余变暗；null = 全部高亮。
  const focusIds = useMemo(() => {
    if (!focusMonth) return null;
    return new Set(nodes.filter(n => nodeMonth(n) === focusMonth).map(n => n.id));
  }, [focusMonth, nodes, nodeMonth]);

  // 时间线月份：从所有节点的"年份-月份"自动聚合（优先手填日期，回退阶段），升序去重。
  const months = useMemo(() => {
    const set = new Set();
    nodes.forEach(n => { const m = nodeMonth(n); if (m) set.add(m); });
    return [...set].sort();
  }, [nodes, nodeMonth]);

  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return nodes
      .filter(n => visibleByTime.has(n.id) && `${n.title} ${n.summary} ${(n.tags || []).join(" ")}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, visibleByTime, nodes]);

  // ---- 视图操作 ----
  const setZoom = useCallback(next => setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, next))), []);
  const resetView = () => { const fit = fitView(nodes); setScale(fit.scale); setPan(fit.pan); };
  const zoomAtCenter = factor => setZoom(scale * factor);

  function onWheel(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * (e.deltaY < 0 ? 1.12 : 0.89)));
    const ratio = next / scale;
    setPan(p => ({ x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio }));
    setScale(next);
  }
  function onPanDown(e) {
    if (e.target.closest?.("[data-node='true']")) return;
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPanMove(e) {
    if (!dragRef.current) return;
    setPan({ x: dragRef.current.panX + e.clientX - dragRef.current.x, y: dragRef.current.panY + e.clientY - dragRef.current.y });
  }
  function onPanUp() { dragRef.current = null; }

  function screenToWorld(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (clientX - rect.left) / rect.width * VIEWBOX.width;
    const svgY = (clientY - rect.top) / rect.height * VIEWBOX.height;
    return {
      x: Math.round((svgX - 600 - pan.x) / scale + 600),
      y: Math.round((svgY - pan.y) / scale),
    };
  }

  // ---- 节点选择与编辑 ----
  function selectNode(id) {
    setSelectedId(id);
    const n = nodeMap[id];
    if (n) {
      setDraft({ title: n.title, summary: n.summary || "", body: n.body || "", tags: (n.tags || []).join(", "), date: n.date || "" });
      setPreviewBody(true);
      setReadOnly(n.status === ZONE.CONFIRMED);
      setFocusMonth(nodeMonth(n)); // 点击节点时聚焦到它所属的年份-月份
    }
  }

  // 点击时间线某个月份：聚焦该月的笔记（高亮，其余变暗）
  function handleSelectMonth(m) {
    setFocusMonth(m);
  }

  // 点击时间线终点：显示全部节点（清除聚焦）
  function handleFocusAll() {
    setFocusMonth(null);
  }

  function focusNode(id) {
    const n = nodeMap[id];
    if (!n) return;
    selectNode(id);
    setScale(Math.max(scale, 0.88));
    setPan({ x: 600 - n.position.x * Math.max(scale, 0.88), y: 390 - n.position.y * Math.max(scale, 0.88) });
    setQuery("");
  }

  // ---- 节点拖动 ----
  function onNodeDragStart(e, id) {
    if (linkMode) return; // 连线模式下不拖动
    e.stopPropagation();
    const n = nodeMap[id];
    if (!n) return;
    nodeDragRef.current = {
      id, startX: e.clientX, startY: e.clientY,
      origX: n.position.x, origY: n.position.y,
      latestX: n.position.x, latestY: n.position.y, moved: false,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onNodeDragMove(e) {
    const d = nodeDragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.startX) > 2 || Math.abs(e.clientY - d.startY) > 2) d.moved = true;
    d.latestX = d.origX + (e.clientX - d.startX) / scale;
    d.latestY = d.origY + (e.clientY - d.startY) / scale;
    setNodes(prev => prev.map(n => n.id === d.id ? { ...n, position: { x: d.latestX, y: d.latestY } } : n));
  }
  function onNodeDragEnd() {
    const d = nodeDragRef.current;
    nodeDragRef.current = null;
    if (!d || !d.moved) return;
    api.updateNode(d.id, { position: { x: d.latestX, y: d.latestY } })
      .then(() => flashSave("saved")).catch(() => flashSave("error"));
  }

  // ---- 保存编辑 ----
  function saveNode() {
    if (!selected || !draft) return;
    setSaveState("saving");
    const patch = {
      title: draft.title,
      summary: draft.summary,
      body: draft.body,
      tags: draft.tags.split(/[,，]/).map(s => s.trim()).filter(Boolean),
      date: draft.date || "",
    };
    api.updateNode(selected.id, patch)
      .then(updated => { setNodes(prev => prev.map(n => n.id === updated.id ? updated : n)); flashSave("saved"); })
      .catch(err => { console.error(err); flashSave("error"); });
  }

  function toggleZone() {
    if (!selected) return;
    const to = selected.status === ZONE.CONFIRMED ? ZONE.WORKSPACE : ZONE.CONFIRMED;
    api.moveNode(selected.id, to)
      .then(updated => {
        setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
        setReadOnly(to === ZONE.CONFIRMED); // 确认 -> 只读；退回 -> 解锁
        flashSave("saved");
      })
      .catch(() => flashSave("error"));
  }

  function removeNode() {
    if (!selected) return;
    if (!window.confirm(`确认删除节点「${selected.title}」？指向它的关系也会一并清理。`)) return;
    api.deleteNode(selected.id)
      .then(() => {
        setNodes(prev => prev.filter(n => n.id !== selected.id));
        setEdges(prev => prev.filter(e => e.source !== selected.id && e.target !== selected.id));
        setSelectedId(null);
        flashSave("saved");
      })
      .catch(() => flashSave("error"));
  }

  function createBranch() {
    if (!selected) return;
    const child = {
      title: "新分支", stage: stageId, level: 3, type: "detail", status: selected.status,
      position: { x: selected.position.x + 170, y: selected.position.y + 120 },
      summary: "", tags: [], body: "",
    };
    api.createNode(child).then(newNode =>
      api.createEdge({ source: selected.id, target: newNode.id, type: "extends", label: "" }).then(edge => {
        setNodes(prev => [...prev, newNode]);
        setEdges(prev => [...prev, edge]);
        selectNode(newNode.id);
        flashSave("saved");
      })
    );
  }

  function onCanvasDoubleClick(e) {
    if (e.target.closest?.("[data-node='true']")) return;
    if (linkMode) return;
    const pos = screenToWorld(e.clientX, e.clientY);
    const node = {
      title: "新节点", stage: stageId, level: 3, type: "detail",
      status: zoneFilter === ZONE.CONFIRMED ? ZONE.CONFIRMED : ZONE.WORKSPACE,
      position: pos, summary: "", tags: [], body: "",
    };
    api.createNode(node).then(newNode => {
      setNodes(prev => [...prev, newNode]);
      selectNode(newNode.id);
      flashSave("saved");
    }).catch(() => flashSave("error"));
  }

  function removeEdge(edgeId) {
    api.deleteEdge(edgeId).then(() => {
      setEdges(prev => prev.filter(e => e.id !== edgeId));
      flashSave("saved");
    }).catch(() => flashSave("error"));
  }

  function updateEdgeLabel(edgeId, label) {
    api.updateEdge(edgeId, { label }).then(updated => {
      setEdges(prev => prev.map(e => e.id === edgeId ? updated : e));
      flashSave("saved");
    }).catch(() => flashSave("error"));
  }

  function toggleExpand(id) {
    const n = nodeMap[id];
    if (!n) return;
    // 判断该节点当前是否有“可见的层级子节点”，据此决定是收起还是展开
    const visibleIds = new Set(visibleNodes.map(x => x.id));
    const childVisible = edges.some(e =>
      e.source === id && visibleIds.has(e.target) && (nodeMap[e.target]?.level ?? 0) > (n.level ?? 0)
    );
    if (childVisible) {
      // 收起：隐藏子节点
      setCollapsed(old => new Set(old).add(id));
      setExpanded(old => { const s = new Set(old); s.delete(id); return s; });
    } else {
      // 展开：显示子节点
      setCollapsed(old => { const s = new Set(old); s.delete(id); return s; });
      setExpanded(old => new Set(old).add(id));
    }
  }

  // ---- 连线模式（7.3） ----
  function toggleLinkMode() {
    setLinkMode(v => !v);
    setLinkSource(null);
    setLinkDialog(null);
  }

  function onLinkNodeClick(id) {
    if (id === null) { setLinkSource(null); return; } // 取消起点
    if (linkSource === null) {
      setLinkSource(id);
    } else if (linkSource === id) {
      setLinkSource(null);
    } else {
      setLinkDialog({ source: linkSource, target: id });
    }
  }

  function confirmLink(type, label) {
    if (!linkDialog) return;
    const { source, target } = linkDialog;
    api.createEdge({ source, target, type, label })
      .then(edge => {
        setEdges(prev => [...prev, edge]);
        setLinkDialog(null);
        setLinkSource(null); // 清空起点，可连续连下一条
        flashSave("saved");
      })
      .catch(() => flashSave("error"));
  }

  function cancelLink() {
    setLinkDialog(null);
    setLinkSource(null);
  }

  // ESC 退出连线
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Escape") return;
      setLinkDialog(null);
      setLinkSource(null);
      setLinkMode(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- 导入 / 导出 ----
  function handleExport() {
    api.exportGraph().then(data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `knowledge-map-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }).catch(err => window.alert("导出失败：" + err.message));
  }

  function handleImportData(data) {
    if (!window.confirm("导入会覆盖当前图谱，确定继续？")) return;
    api.importGraph(data).then(() => reload().then(() => flashSave("saved")))
      .catch(err => window.alert("导入失败：" + err.message));
  }

  // ---- 分栏拖拽 ----
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    const onDown = (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = handle.closest(".inspector").getBoundingClientRect().width;
      let raw = startWidth;
      const onMove = (ev) => {
        raw = Math.max(80, Math.min(window.innerWidth - RAIL_W, startWidth - (ev.clientX - startX)));
        setInspectorWidth(raw);
        if (appRef.current) {
          appRef.current.style.gridTemplateColumns = `${RAIL_W}px minmax(${MAP_MIN_W}px,1fr) ${raw}px`;
          appRef.current.style.setProperty("--inspector-w", raw + "px");
        }
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        if (raw < 120) setInspectorOpen(false);
      };
      document.body.style.cursor = "col-resize";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
    handle.addEventListener("mousedown", onDown);
    return () => handle.removeEventListener("mousedown", onDown);
  }, [inspectorOpen, loading]);

  const levelLabel = semanticLevel(scale) === "overview" ? "全局脉络" : semanticLevel(scale) === "themes" ? "主题层" : "细节层";
  const modeLabel = mode === "local" ? "本地模式 · 文件已落盘" : mode === "browser" ? "在线体验 · 保存在本浏览器" : "连接中...";

  if (loading) {
    return <div className="boot-screen">正在加载知识库...</div>;
  }

  return (
    <main
      ref={appRef}
      className={`app ${light ? "theme-light" : ""}`}
      style={{ gridTemplateColumns: `${RAIL_W}px minmax(${MAP_MIN_W}px,1fr) ${inspectorOpen ? `${inspectorWidth}px` : "0px"}`, "--inspector-w": inspectorOpen ? `${inspectorWidth}px` : "0px" }}
    >
      <Rail months={months} focusMonth={focusMonth} onSelectMonth={handleSelectMonth} onFocusAll={handleFocusAll} />

      <section className="workspace">
        <Topbar
          mode={mode}
          zoneFilter={zoneFilter}
          onZoneFilter={setZoneFilter}
          query={query}
          onQuery={setQuery}
          light={light}
          onToggleLight={() => setLight(v => !v)}
          onExport={handleExport}
          onImportData={handleImportData}
          onShowHelp={() => setShowHelp(v => !v)}
          inspectorOpen={inspectorOpen}
          onToggleInspector={() => setInspectorOpen(v => !v)}
          linkMode={linkMode}
          onToggleLinkMode={toggleLinkMode}
        />

        <div className="stage-banner">
          <div className="stage-index">{focusMonth ? `0${months.indexOf(focusMonth) + 1}` : "ALL"}</div>
          <div className="stage-copy">
            <span className="eyebrow">{focusMonth || "ALL"} / MONTHLY NOTES</span>
            <h2>{focusMonth || "全部节点"}</h2>
            <p>{focusMonth ? `本月 ${focusIds ? focusIds.size : 0} 篇笔记` : `共 ${nodes.length} 篇笔记`}</p>
          </div>
          <div className="stage-progress">
            {months.map(m => <button key={m} className={m === focusMonth ? "current" : ""} onClick={() => setFocusMonth(m)} aria-label={m} />)}
          </div>
        </div>

        {showHelp && (
          <div className="help-pop">
            <button className="close-help" onClick={() => setShowHelp(false)}><X size={14}/></button>
            <b>如何探索这张地图</b>
            <p>滚轮缩放；拖动空白平移；拖动节点调整位置；双击空白新建节点；点击节点在右侧编辑笔记；点击顶部连线按钮可连接任意两个节点。</p>
            <p><kbd>滚轮</kbd> 缩放　<kbd>拖动</kbd> 平移/移动　<kbd>双击</kbd> 新建　<kbd>连线按钮</kbd> 建关系</p>
          </div>
        )}

        <Canvas
          svgRef={svgRef}
          pan={pan}
          scale={scale}
          visibleNodes={visibleNodes}
          shownEdges={shownEdges}
          edges={edges}
          nodeMap={nodeMap}
          focusIds={focusIds}
          selectedId={selectedId}
          linkMode={linkMode}
          linkSource={linkSource}
          levelLabel={levelLabel}
          zoneFilter={zoneFilter}
          filteredNodes={filteredNodes}
          query={query}
          onWheel={onWheel}
          onPanDown={onPanDown}
          onPanMove={onPanMove}
          onPanUp={onPanUp}
          onSelectNode={selectNode}
          onLinkNodeClick={onLinkNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragMove={onNodeDragMove}
          onNodeDragEnd={onNodeDragEnd}
          onCanvasDoubleClick={onCanvasDoubleClick}
          onToggleExpand={toggleExpand}
          onFocusNode={focusNode}
          onZoomIn={() => zoomAtCenter(1.18)}
          onZoomOut={() => zoomAtCenter(.84)}
          onResetView={resetView}
        />
      </section>

      {inspectorOpen && (
        <Inspector
          handleRef={handleRef}
          selected={selected}
          draft={draft}
          previewBody={previewBody}
          edges={edges}
          nodeMap={nodeMap}
          saveState={saveState}
          modeLabel={modeLabel}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          readOnly={readOnly}
          hideZoneToggle={zoneFilter === "all"}
          onUnlock={() => setReadOnly(false)}
          onTitleChange={v => setDraft(d => ({ ...d, title: v }))}
          onSummaryChange={v => setDraft(d => ({ ...d, summary: v }))}
          onBodyChange={v => setDraft(d => ({ ...d, body: v }))}
          onTagsChange={v => setDraft(d => ({ ...d, tags: v }))}
          onDateChange={v => setDraft(d => ({ ...d, date: v }))}
          onTogglePreview={() => setPreviewBody(v => !v)}
          onSave={saveNode}
          onCreateBranch={createBranch}
          onToggleZone={toggleZone}
          onRemoveNode={removeNode}
          onSelectNode={selectNode}
          onRemoveEdge={removeEdge}
          onUpdateEdge={updateEdgeLabel}
          onClose={() => setInspectorOpen(false)}
        />
      )}

      <LinkDialog dialog={linkDialog} nodeMap={nodeMap} onConfirm={confirmLink} onCancel={cancelLink} />
    </main>
  );
}
