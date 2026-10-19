// 中央画布：SVG 节点 + 边 + 网格，缩放/平移/拖动/双击新建/连线模式交互。
import { ZoomIn, ZoomOut, Maximize2, ChevronRight } from "lucide-react";
import { VIEWBOX } from "../utils/layout";
import { COLORS } from "../constants";
import { ZONE } from "../store/types";

export default function Canvas({
  svgRef,
  pan, scale,
  visibleNodes, shownEdges, edges,
  nodeMap, focusIds,
  selectedId,
  linkMode, linkSource,
  levelLabel, zoneFilter,
  filteredNodes, query,
  onWheel, onPanDown, onPanMove, onPanUp,
  onSelectNode, onLinkNodeClick,
  onNodeDragStart, onNodeDragMove, onNodeDragEnd,
  onCanvasDoubleClick, onToggleExpand,
  onFocusNode, onZoomIn, onZoomOut, onResetView,
}) {
  const zoneLabel = zoneFilter === ZONE.WORKSPACE ? "工作区" : "全部";
  const visibleIdSet = new Set(visibleNodes.map(n => n.id));

  return (
    <div className="map-shell">
      <div className="map-meta">
        <span><span className="live-dot"/>{levelLabel} · {zoneLabel}</span>
        <span>{visibleNodes.length} NODES <i>·</i> {shownEdges.length} LINKS</span>
      </div>

      {linkMode && (
        <div className="link-hint">
          {linkSource
            ? `已选起点「${nodeMap[linkSource]?.title || ""}」，点击另一个节点建立连接`
            : "连线模式：点击一个节点作为起点"}
          <button onClick={() => onLinkNodeClick(null)} aria-label="取消">取消</button>
        </div>
      )}

      <svg
        ref={svgRef}
        className={`graph-canvas ${linkMode ? "linking" : ""}`}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        onWheel={onWheel}
        onPointerDown={onPanDown}
        onPointerMove={onPanMove}
        onPointerUp={onPanUp}
        onPointerCancel={onPanUp}
        onDoubleClick={onCanvasDoubleClick}
      >
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
            if (!a || !b) return null;
            const midY = (a.position.y + b.position.y) / 2;
            // 选中后聚焦：两端都在同一时间阶段的边高亮，其余变暗
            const active = focusIds && focusIds.has(e.source) && focusIds.has(e.target);
            const dim = !!selectedId && !active;
            return (
              <g key={e.id} className={`edge ${active ? "edge-active" : ""} ${dim ? "edge-dim" : ""}`}>
                <path d={`M${a.position.x} ${a.position.y + 18} C${a.position.x} ${midY}, ${b.position.x} ${midY}, ${b.position.x} ${b.position.y - 18}`} />
                {scale > .72 && <text x={(a.position.x + b.position.x) / 2} y={midY - 4} className="edge-label">{e.label}</text>}
              </g>
            );
          })}

          {visibleNodes.map(n => {
            const px = n.position.x, py = n.position.y;
            const selectedNow = selectedId === n.id;
            const isLinkSource = linkMode && linkSource === n.id;
            const showText = scale >= .48 || n.level === 0 || n.level === 1;
            const showDetail = scale >= .88;
            const hasChildren = edges.some(e => e.source === n.id && (nodeMap[e.target]?.level ?? 0) > (n.level ?? 0));
            const childrenVisible = edges.some(e => e.source === n.id && (nodeMap[e.target]?.level ?? 0) > (n.level ?? 0) && visibleIdSet.has(e.target));
            const color = COLORS[n.type] || COLORS.detail;
            const overview = scale < .48;
            const baseRadius = n.type === "root" || n.type === "final" ? 10 : n.type === "summary" ? 8 : n.level === 2 ? 6 : 4.5;
            const radius = selectedNow ? baseRadius * 1.45 : baseRadius;
            const titleText = n.title.length > 24 && scale < .88 ? (n.short || n.title) : n.title;
            const summaryText = showDetail ? ((n.summary || "").length > 24 ? n.summary.slice(0, 23) + "…" : (n.summary || "")) : "";
            // 方框宽度按标题(12px/字)与摘要(10px/字)中更长的那个自适应，上限 280
            const labelWidth = Math.min(280, Math.max(118, Math.max(titleText.length * 13, summaryText.length * 10) + 22));
            const labelX = px > 760 ? -labelWidth - 12 : px < 440 ? 12 : -labelWidth / 2;
            const textX = labelX + (px > 760 ? labelWidth - 8 : 8);
            const textAnchor = px > 760 ? "end" : "start";
            const isDraft = n.status === ZONE.WORKSPACE;
            // 工作区视图下，正式节点变暗作为背景参考（与选中交互解耦）
            const isDimmed = zoneFilter === ZONE.WORKSPACE && n.status === ZONE.CONFIRMED;
            // 选中后聚焦：非同一时间阶段的节点变暗
            const isMuted = focusIds && !focusIds.has(n.id);

            return (
              <g
                key={n.id}
                data-node="true"
                className={`node ${selectedNow ? "selected" : ""} ${isDraft ? "draft-node" : ""} ${isDimmed ? "confirmed-dim" : ""} ${isMuted ? "muted" : ""} ${isLinkSource ? "link-source" : ""}`}
                transform={`translate(${px} ${py})`}
                onClick={() => linkMode ? onLinkNodeClick(n.id) : onSelectNode(n.id)}
                onPointerDown={e => onNodeDragStart(e, n.id)}
                onPointerMove={onNodeDragMove}
                onPointerUp={onNodeDragEnd}
                onPointerCancel={onNodeDragEnd}
                role="button"
                tabIndex="0"
                aria-label={n.title}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); linkMode ? onLinkNodeClick(n.id) : onSelectNode(n.id); } }}
              >
                <circle r={radius + 11} className="node-hit"/>
                <circle r={radius + 4} className="node-halo" stroke={color}/>
                <circle r={radius} fill={color} className="node-core"/>
                {isDraft && <circle r={radius + 6} className="node-draft-ring" stroke={color} />}
                {isLinkSource && <circle r={radius + 8} className="node-link-ring" stroke={color} />}
                {showText && !overview && <g className="node-label-group">
                  <rect x={labelX} y="17" width={labelWidth} height={showDetail ? 58 : 39} rx="7" className={`label-bg ${selectedNow ? "label-selected" : ""}`}/>
                  <text x={textX} y="33" textAnchor={textAnchor} className="node-title">{titleText}</text>
                  {showDetail && <text x={textX} y="51" textAnchor={textAnchor} className="node-summary">{summaryText}</text>}
                </g>}
                {showText && hasChildren && !linkMode && (
                  <g
                    className="expand-control"
                    transform={`translate(${px > 760 ? -18 : px < 440 ? 18 : 0},-22)`}
                    onPointerDown={e => e.stopPropagation()}
                    onPointerUp={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); onToggleExpand(n.id); }}
                  >
                    <circle r="9"/><text y="3.5" textAnchor="middle">{childrenVisible ? "−" : "+"}</text>
                  </g>
                )}
                {overview && n.level === 1 && <circle r="2.2" className="overview-dot"/>}
              </g>
            );
          })}
        </g>
      </svg>

      {query && (
        <div className="search-results">
          <div className="result-head">搜索结果 <span>{filteredNodes.length}</span></div>
          {filteredNodes.map(n => (
            <button key={n.id} onClick={() => onFocusNode(n.id)}>
              <span className="result-dot" style={{ background: COLORS[n.type] }}/>
              <span><b>{n.title}</b><small>{n.summary}</small></span>
              <ChevronRight size={14}/>
            </button>
          ))}
          {!filteredNodes.length && <p>当前阶段没有匹配的节点。</p>}
        </div>
      )}

      <div className="zoom-controls">
        <button onClick={onZoomIn} title="放大"><ZoomIn size={17}/></button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={onZoomOut} title="缩小"><ZoomOut size={17}/></button>
        <div className="control-divider"/>
        <button onClick={onResetView} title="回到全局视图"><Maximize2 size={16}/></button>
      </div>
      <div className="map-legend">
        <span><i style={{ background: COLORS.topic }}/>主题</span>
        <span><i style={{ background: COLORS.summary }}/>阶段总结</span>
        <span><i style={{ background: COLORS.branch }}/>研究分支</span>
        <span><i className="draft-dot"/>工作区</span>
      </div>
      <div className="map-footnote">SCROLL TO EXPLORE <span>·</span> DRAG TO PAN <span>·</span> DOUBLE-CLICK TO CREATE</div>
    </div>
  );
}
