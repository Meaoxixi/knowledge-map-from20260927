import React, { useCallback, useMemo, useRef, useState } from "react";
import { Search, ZoomIn, ZoomOut, Maximize2, ChevronDown, ChevronRight, X, GitBranch, CircleHelp, Sun, Moon } from "lucide-react";
import { stages, nodes, edges } from "./data/graphData";
import { VIEWBOX, isVisibleAtStage, semanticLevel, visibleNodeAtZoom } from "./utils/layout";

const COLORS = {
  root: "#e8c98b", topic: "#91b9ff", summary: "#d8b3ff",
  branch: "#7ddac7", detail: "#a8b7c9", final: "#f0b68b"
};
const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

export default function App() {
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const [stageId, setStageId] = useState("oct");
  const [scale, setScale] = useState(0.58);
  const [pan, setPan] = useState({ x: -80, y: 10 });
  const [selectedId, setSelectedId] = useState("dimensions");
  const [expanded, setExpanded] = useState(() => new Set(edges.map(e => e.source)));
  const [query, setQuery] = useState("");
  const [light, setLight] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const currentStage = stages.find(s => s.id === stageId);
  const visibleByTime = useMemo(() => new Set(nodes.filter(n => isVisibleAtStage(n, stageId)).map(n => n.id)), [stageId]);
  const visibleNodes = useMemo(() => {
    const zoomCandidates = nodes.filter(n => visibleByTime.has(n.id) && visibleNodeAtZoom(n, scale, expanded));
    const candidateIds = new Set(zoomCandidates.map(n => n.id));
    return zoomCandidates.filter(n => {
      const parents = edges
        .filter(e => e.target === n.id && nodeMap[e.source] && nodeMap[e.source].level < n.level)
        .map(e => e.source);
      if (!parents.length) return true;
      // A child is shown only while at least one of its visible higher-level parents is expanded.
      return parents.some(parentId => expanded.has(parentId) && candidateIds.has(parentId));
    });
  }, [visibleByTime, scale, expanded]);
  const visibleIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);
  const shownEdges = useMemo(() => edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target)), [visibleIds]);
  const selected = nodeMap[selectedId];
  const adjacent = useMemo(() => {
    const ids = new Set([selectedId]);
    edges.forEach(e => { if (e.source === selectedId) ids.add(e.target); if (e.target === selectedId) ids.add(e.source); });
    return ids;
  }, [selectedId]);
  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return nodes.filter(n => visibleByTime.has(n.id) && `${n.title} ${n.summary} ${n.tags.join(" ")}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query, visibleByTime]);

  const setZoom = useCallback((next) => setScale(Math.max(0.25, Math.min(1.65, next))), []);
  const resetView = () => { setScale(0.58); setPan({ x: -80, y: 10 }); setSelectedId("world-models"); };
  const zoomAtCenter = (factor) => setZoom(scale * factor);

  function onWheel(e) {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    const next = Math.max(0.25, Math.min(1.65, scale * (e.deltaY < 0 ? 1.12 : 0.89)));
    const ratio = next / scale;
    setPan(p => ({ x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio }));
    setScale(next);
  }
  function onPointerDown(e) {
    if (e.target.closest?.("[data-node='true']")) return;
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragRef.current) return;
    setPan({ x: dragRef.current.panX + e.clientX - dragRef.current.x, y: dragRef.current.panY + e.clientY - dragRef.current.y });
  }
  function onPointerUp() { dragRef.current = null; }
  function toggleExpand(id) {
    setExpanded(old => { const next = new Set(old); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function selectNode(id) {
    setSelectedId(id);
    const n = nodeMap[id];
    if (n && n.level > 1) setExpanded(old => new Set([...old, n.id, ...edges.filter(e => e.source === n.id).map(e => e.target)]));
  }
  function focusNode(id) {
    const n = nodeMap[id];
    if (!n) return;
    setSelectedId(id);
    setScale(Math.max(scale, 0.88));
    setPan({ x: 600 - n.x * Math.max(scale, 0.88), y: 390 - n.y * Math.max(scale, 0.88) });
    setQuery("");
  }

  const isLight = light ? "light" : "dark";
  const levelLabel = semanticLevel(scale) === "overview" ? "全局脉络" : semanticLevel(scale) === "themes" ? "主题层" : "细节层";

  return (
    <main className={`app ${isLight ? "theme-light" : ""}`}>
      <aside className="rail">
        <div className="brand-mark">K<span>.</span></div>
        <div className="rail-line" />
        <div className="rail-caption">TIMELINE</div>
        <div className="timeline">
          {stages.map((s, i) => (
            <button key={s.id} className={`time-item ${stageId === s.id ? "active" : ""} ${i < stages.findIndex(x => x.id === stageId) ? "passed" : ""}`} onClick={() => setStageId(s.id)} title={`${s.date} ${s.title}`}>
              <span className="time-dot" />
              <span className="time-date">{s.date}</span>
              <span className="time-month">{s.month}</span>
              <span className="time-title">{s.title}</span>
            </button>
          ))}
        </div>
        <div className="rail-bottom">RESEARCH<br/>LOG / 2026</div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">PERSONAL RESEARCH ATLAS <span className="live-dot" /> INTERACTIVE MAP</div>
            <h1>知识演化<span> / </span>研究地图</h1>
          </div>
          <div className="top-actions">
            <label className="searchbox"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索知识节点..." />{query && <button onClick={() => setQuery("")} aria-label="清空搜索"><X size={14}/></button>}</label>
            <button className="icon-button" onClick={() => setLight(v => !v)} title="切换主题">{light ? <Moon size={17}/> : <Sun size={17}/>}</button>
            <button className="icon-button" onClick={() => setShowHelp(v => !v)} title="交互说明"><CircleHelp size={17}/></button>
          </div>
        </header>

        <div className="stage-banner">
          <div className="stage-index">0{stages.findIndex(s => s.id === stageId) + 1}</div>
          <div className="stage-copy"><span className="eyebrow">{currentStage.month} / LEARNING PHASE</span><h2>{currentStage.title}</h2><p>{currentStage.description}</p></div>
          <div className="stage-progress">{stages.map((s,i)=><button key={s.id} className={s.id===stageId?"current":""} onClick={()=>setStageId(s.id)} aria-label={s.title}/>)}</div>
        </div>

        {showHelp && <div className="help-pop"><button className="close-help" onClick={()=>setShowHelp(false)}><X size={14}/></button><b>如何探索这张地图</b><p>滚轮缩放改变信息粒度；拖动空白区域平移；点击节点查看内容；使用节点上的展开按钮控制分支；左侧日期控制知识演化阶段。</p><p><kbd>滚轮</kbd> 缩放　<kbd>拖动</kbd> 平移　<kbd>点击节点</kbd> 选择</p></div>}

        <div className="map-shell">
          <div className="map-meta"><span><span className="live-dot"/>{levelLabel}</span><span>{visibleNodes.length} NODES <i>·</i> {shownEdges.length} LINKS</span></div>
          <svg ref={svgRef} className="graph-canvas" viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
            <defs>
              <pattern id="dotgrid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" className="grid-dot"/></pattern>
              <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" className="arrow-head"/></marker>
            </defs>
            <rect width="1200" height="1440" fill="url(#dotgrid)" />
            <g transform={`translate(${pan.x} ${pan.y}) translate(600 0) scale(${scale}) translate(-600 0)`}>
              <path d="M600 90 L600 1320" className="trunk-guide"/>
              {shownEdges.map(e => {
                const a = nodeMap[e.source], b = nodeMap[e.target];
                const midY = (a.y + b.y) / 2;
                const active = adjacent.has(e.source) && adjacent.has(e.target);
                const dim = selectedId && !active && (adjacent.has(e.source) || adjacent.has(e.target));
                return <g key={e.id} className={`edge ${active ? "edge-active" : ""} ${dim ? "edge-dim" : ""}`}>
                  <path d={`M${a.x} ${a.y+18} C${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y-18}`} />
                  {scale > .72 && <text x={(a.x+b.x)/2} y={midY-4} className="edge-label">{e.label}</text>}
                </g>;
              })}
              {visibleNodes.map(n => {
                const selectedNow = selectedId === n.id;
                const related = adjacent.has(n.id);
                const showText = scale >= .48 || n.level === 0 || n.level === 1;
                const showDetail = scale >= .88;
                const hasChildren = edges.some(e => e.source === n.id);
                const isExpanded = expanded.has(n.id);
                const color = COLORS[n.type] || COLORS.detail;
                const overview = scale < .48;
                const radius = n.type === "root" || n.type === "final" ? 10 : n.type === "summary" ? 8 : n.level === 2 ? 6 : 4.5;
                const labelWidth = Math.min(245, Math.max(118, n.title.length * 13 + 22));
                const labelX = n.x > 760 ? -labelWidth - 12 : n.x < 440 ? 12 : -labelWidth / 2;
                const textX = labelX + (n.x > 760 ? labelWidth - 8 : 8);
                const textAnchor = n.x > 760 ? "end" : "start";
                return <g key={n.id} data-node="true" className={`node ${selectedNow ? "selected" : ""} ${related ? "related" : ""} ${selectedId && !related ? "muted" : ""}`} transform={`translate(${n.x} ${n.y})`} onClick={() => selectNode(n.id)} role="button" tabIndex="0" aria-label={n.title} onKeyDown={e => {if(e.key==="Enter"||e.key===" "){e.preventDefault();selectNode(n.id);}}}>
                  <circle r={radius+11} className="node-hit"/>
                  <circle r={radius+4} className="node-halo" stroke={color}/>
                  <circle r={radius} fill={color} className="node-core"/>
                  {showText && !overview && <g className="node-label-group">
                    <rect x={labelX} y="17" width={labelWidth} height={showDetail ? 58 : 39} rx="7" className={`label-bg ${selectedNow ? "label-selected" : ""}`}/>
                    <text x={textX} y="33" textAnchor={textAnchor} className="node-title">{n.title.length > 24 && scale < .88 ? n.short : n.title}</text>
                    {showDetail && <text x={textX} y="51" textAnchor={textAnchor} className="node-summary">{n.summary.length > 32 ? n.summary.slice(0,31)+"…" : n.summary}</text>}
                  </g>}
                  {showText && hasChildren && scale > .68 && <g className="expand-control" transform={`translate(${n.x > 760 ? -18 : n.x < 440 ? 18 : 0},-22)`} onClick={e => {e.stopPropagation();toggleExpand(n.id);}}><circle r="9"/><text y="3.5" textAnchor="middle">{isExpanded ? "−" : "+"}</text></g>}
                  {overview && n.level === 1 && <circle r="2.2" className="overview-dot"/>}
                </g>;
              })}
            </g>
          </svg>

          {query && <div className="search-results"><div className="result-head">搜索结果 <span>{filteredNodes.length}</span></div>{filteredNodes.map(n=><button key={n.id} onClick={()=>focusNode(n.id)}><span className="result-dot" style={{background:COLORS[n.type]}}/><span><b>{n.title}</b><small>{n.summary}</small></span><ChevronRight size={14}/></button>)}{!filteredNodes.length && <p>当前阶段没有匹配的节点。</p>}</div>}

          <div className="zoom-controls">
            <button onClick={()=>zoomAtCenter(1.18)} title="放大"><ZoomIn size={17}/></button>
            <span>{Math.round(scale*100)}%</span>
            <button onClick={()=>zoomAtCenter(.84)} title="缩小"><ZoomOut size={17}/></button>
            <div className="control-divider"/>
            <button onClick={resetView} title="回到全局视图"><Maximize2 size={16}/></button>
          </div>
          <div className="map-legend"><span><i style={{background:COLORS.topic}}/>主题</span><span><i style={{background:COLORS.summary}}/>阶段总结</span><span><i style={{background:COLORS.branch}}/>研究分支</span></div>
          <div className="map-footnote">SCROLL TO EXPLORE <span>·</span> DRAG TO PAN <span>·</span> SELECT A NODE</div>
        </div>
      </section>

      <aside className="inspector">
        <div className="inspector-head"><div><div className="eyebrow">NODE INSPECTOR</div><h3>知识详情</h3></div><GitBranch size={17}/></div>
        {selected ? <>
          <div className="detail-type"><span className="type-dot" style={{background:COLORS[selected.type]}}/>{({root:"核心主题",topic:"知识主题",summary:"阶段总结",branch:"研究分支",detail:"细化问题",final:"综合框架"})[selected.type]}</div>
          <h2 className="detail-title">{selected.title}</h2>
          <p className="detail-summary">{selected.summary}</p>
          <div className="detail-section"><div className="section-label">学习记录 / NOTES</div><p>{selected.detail}</p></div>
          <div className="detail-section"><div className="section-label">关键词 / TAGS</div><div className="tags">{selected.tags.map(t=><span key={t}>{t}</span>)}</div></div>
          <div className="detail-section"><div className="section-label">关系节点 / CONNECTIONS</div><div className="connections">{edges.filter(e=>e.source===selected.id||e.target===selected.id).slice(0,8).map(e=>{const other=nodeMap[e.source===selected.id?e.target:e.source];return <button key={e.id} onClick={()=>selectNode(other.id)}><span className="connection-line"/><span className="connection-text"><b>{other.title}</b><small>{e.source===selected.id?"下游 · ":"上游 · "}{e.label}</small></span><ChevronRight size={14}/></button>})}{!edges.some(e=>e.source===selected.id||e.target===selected.id)&&<p className="empty">暂无显式关系</p>}</div></div>
          <div className="detail-actions"><button className="primary-action" onClick={()=>toggleExpand(selected.id)}><ChevronDown size={15}/>{expanded.has(selected.id)?"收起分支":"展开分支"}</button><button className="secondary-action" onClick={()=>focusNode(selected.id)}><Maximize2 size={14}/>定位节点</button></div>
        </> : <div className="empty-state">选择一个节点以查看详细信息。</div>}
        <div className="inspector-bottom"><span className="status-pulse"/> DEMO DATA <span className="bottom-divider"/> EDIT <code>src/data/graphData.js</code></div>
      </aside>
    </main>
  );
}
