// 3D 放射球知识星图（"Tree of Life" 风格 · Canvas2D 引擎）
// 纯 CPU 渲染：不依赖 WebGL/GPU，GitHub Pages 等纯前端 CPU 环境可稳定显示。
// 视觉目标（plan.md v2）：黑底 + 白色发光星点 + 放射连线 + 伪3D球壳 + 中心亮核。
// 数据源：真实后端 nodes/edges 与 300+ mock 树可切换。
import React, { useEffect, useMemo, useRef, useState } from "react";
import { radialSphereLayout } from "../utils/radialSphereLayout";
import { genMockTree } from "../utils/genMockTree";
import { api } from "../store/api";

// 布局世界坐标缩放：把抽象的 [x,y,z] 放大到便于投影观察的尺度
const SCALE = 10;

// 发光点屏幕尺寸：size = clamp(base + k·sqrt(desc), min, max)（plan P0-1，按像素）
function nodePx(size, desc) {
  const raw = (size || 0.75) * 2.2 + 0.35 * Math.sqrt(desc || 0);
  return Math.max(2.0, Math.min(18, raw)); // 叶子 ≤2~4px，根 ≤18px
}

// 顶部数量最多的 top-N 节点标签（plan P1-7：只挂大节点）
function pickTop(laidOut, n = 15) {
  return [...laidOut].sort((a, b) => (b._descendantCount || 0) - (a._descendantCount || 0)).slice(0, n);
}

export default function StarMap({ focusMonth = null, focusIds = null }) {
  const mountRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataMode, setDataMode] = useState("real"); // real | mock
  const [tooltip, setTooltip] = useState(null);
  const hoverIdRef = useRef(null);
  const pausedRef = useRef(true);
  const [paused, setPaused] = useState(true);

  // 加载实时数据（同后端 API）
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [ns, es] = await Promise.all([api.getNodes(), api.getEdges()]);
        if (!alive) return;
        setNodes(ns);
        setEdges(es);
      } catch (e) {
        console.error("[StarMap]", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // mock 树（plan P0-6：350 节点、5层、幂律，固定 seed 形态稳定）
  const mock = useMemo(() => genMockTree({}), []);

  // 当前生效的原始数据
  const srcNodes = dataMode === "mock" ? mock.nodes : nodes;
  const srcEdges = dataMode === "mock" ? mock.edges : edges;

  // 布局（确定性）
  const laidOut = useMemo(() => {
    if (!srcNodes.length) return [];
    return radialSphereLayout(
      srcNodes.map(n => ({ id: n.id, title: n.title, level: n.level ?? 2 })),
      srcEdges,
      { sizeBy: "descendantCount", layerGap: 5 }
    );
  }, [srcNodes, srcEdges, dataMode]);

  const focusRef = useRef({ active: false, ids: null });

  // 时间聚焦(仅真实数据)：同步到 ref，供 draw 实时读取（不触发 canvas 重建）
  useEffect(() => {
    const active = dataMode === "real" && focusMonth !== null && !!focusIds;
    focusRef.current = { active, ids: focusIds || null };
  }, [dataMode, focusMonth, focusIds]);

  // ---- Canvas2D 渲染（纯 CPU，3D 伪投影 + 加法混合辉光）----
  useEffect(() => {
    if (loading || !mountRef.current || !laidOut.length) return;
    const mount = mountRef.current;
    const W = mount.clientWidth || 1100;
    const H = mount.clientHeight || 640;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.cursor = "grab";
    mount.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // --- 背景（plan P0-2：近纯黑 + 极暗中心径向渐变）---
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    bgGrad.addColorStop(0, "#0a0c18");
    bgGrad.addColorStop(1, "#05060f");

    // --- 相机：包围球半径 ×2.2 居中（plan P0-5）---
    const maxDepth = Math.max(...laidOut.map(n => n._depth), 1);
    const boundingR = maxDepth * 8 * SCALE;
    const camDist = Math.max(60, boundingR * 2.2);
    const f = H / (2 * Math.tan((45 * Math.PI / 180) / 2)); // fov 45（plan P0-5）

    // 自转/倾角 + 缩放 + 平移
    let angleX = -0.4, angleY = 0;
    let zoom = 1;                 // 滚轮缩放（0.4~4）
    let panX = 0, panY = 0;       // 平移（像素偏移）
    let raf = 0;

    // 每帧投影所有节点
    function framePoints() {
      const cy = Math.cos(angleY), sy = Math.sin(angleY);
      const cx = Math.cos(angleX), sx = Math.sin(angleX);
      const fz = zoom; // 缩放到 f 上（等效拉近/拉远）
      return laidOut.map(n => {
        const x0 = n.x * SCALE, y0 = n.y * SCALE, z0 = n.z * SCALE;
        // 绕 X 轴（固定倾角）
        const y1 = y0 * cx - z0 * sx;
        const z1 = y0 * sx + z0 * cx;
        // 绕 Y 轴（自转）
        const x2 = x0 * cy + z1 * sy;
        const z2 = -x0 * sy + z1 * cy;
        const zz = z2 + camDist;
        const px = nodePx(n._size, n._descendantCount) * (camDist / zz); // 透视缩放
        const hot = focusRef.current.active && !!focusRef.current.ids && focusRef.current.ids.has(n.id);
        return { n, hot, sx: W / 2 + panX + (x2 / zz) * f * fz, sy: H / 2 + panY - (y1 / zz) * f * fz, dep: zz, px: px * fz };
      });
    }

    // 悬停拾取（2D 距离在近半区命中）
    function pickAt(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let best = null, bestDist = 14;
      for (const ft of framePoints()) {
        if (ft.dep < camDist) continue; // 只看前半区
        const dist = Math.hypot(ft.sx - mx, ft.sy - my);
        if (dist < Math.max(ft.px + 2, 8) && dist < bestDist) { best = ft.n; bestDist = dist; }
      }
      hoverIdRef.current = best ? best.id : null;
      if (best) setTooltip({ node: best, screen: { x: mx, y: my } });
      else setTooltip(null);
      return best;
    }
    function onMove(e) { if (!dragging) pickAt(e); }
    function onLeave() { hoverIdRef.current = null; setTooltip(null); }

    // 交互：左键拖拽旋转；中键/右键拖拽平移画布；滚轮缩放
    let dragging = false, mode = null, lx = 0, ly = 0;
    function onDown(e) {
      dragging = true; lx = e.clientX; ly = e.clientY;
      mode = e.button === 0 ? "rotate" : "pan"; // 左键旋转，中/右键平移（空白处）
      canvas.style.cursor = "grabbing";
    }
    function onUp() { if (dragging) { dragging = false; mode = null; canvas.style.cursor = "grab"; } }
    function onDrag(e) {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      if (mode === "pan") {
        panX += dx;
        panY += dy;
      } else {
        angleY += dx * 0.006;
        angleX = Math.max(-1.2, Math.min(1.2, angleX + dy * 0.005));
      }
      lx = e.clientX; ly = e.clientY;
    }
    function onWheel(e) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      zoom = Math.max(0.3, Math.min(5, zoom * factor));
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointermove", onDrag);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerup", onUp);

    // 绘制一帧
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
      if (!pausedRef.current) angleY += 0.004; // 慢速自转

      const fts = framePoints();
      const projById = new Map(fts.map(ft => [ft.n.id, ft]));

      // 连线先画（plan P0-3：半透明白细线，1px）
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath();
      for (const n of laidOut) {
        const p = n._parent;
        if (!p) continue;
        const a = projById.get(n.id), b = projById.get(p);
        if (!a || !b) continue;
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
      }
      ctx.stroke();

      // 辉光：加法混合模拟 bloom（plan P0-2）
      ctx.globalCompositeOperation = "lighter";
      const ordered = [...fts].sort((a, b) => b.dep - a.dep); // 远到近
      for (const ft of ordered) {
        const px = ft.px > 0.5 ? ft.px : 0.5;
        const col = ft.hot
          ? { r: 255, g: 110, b: 180 }
          : { r: 255, g: 255, b: 255 };
        const grad = ctx.createRadialGradient(ft.sx, ft.sy, 0, ft.sx, ft.sy, px * 3);
        grad.addColorStop(0, `rgba(${col.r},${col.g},${col.b},0.9)`);
        grad.addColorStop(0.3, `rgba(${col.r},${col.g},${col.b},0.35)`);
        grad.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ft.sx, ft.sy, px * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // 中心实心小核（更亮，用节点色）
      for (const ft of fts) {
        const px = ft.px > 0.5 ? ft.px : 0.5;
        const col = ft.hot
          ? { r: 255, g: 110, b: 180 }
          : { r: 255, g: 255, b: 255 };
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},0.95)`;
        ctx.beginPath();
        ctx.arc(ft.sx, ft.sy, Math.max(0.6, px * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // 标签：子节点数 > 3 的节点不显示标题；子节点小的节点显示 + 鼠标悬停的也显示
      ctx.font = "600 10px system-ui, sans-serif";
      ctx.textAlign = "center";
      const hoverId = hoverIdRef.current;
      for (const ft of fts) {
        const isBig = (ft.n._childrenCount || 0) > 3;
        const isHovered = hoverId && hoverId === ft.n.id;
        if (isBig && !isHovered) continue; // 子节点>3 的不显示，除非悬停它
        const t = ft.n.title.length > 14 ? ft.n.title.slice(0, 12) + "…" : ft.n.title;
        ctx.fillStyle = isHovered ? "rgba(255,220,255,0.95)" : "rgba(255,255,255,0.75)";
        ctx.fillText(t, ft.sx, ft.sy - ft.px * 3 - 6);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    function onResize() {}
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onDrag);
      canvas.removeEventListener("wheel", onWheel);
      canvas.remove();
    };
  }, [laidOut, loading]);

  const nodeCount = laidOut.length;
  const maxDepth = laidOut[0]?._maxDepth ?? 0;
  const perDepth = Array.from({ length: maxDepth + 1 }, (_, d) => laidOut.filter(n => n._depth === d).length);
  const edgeCount = laidOut.reduce((s, n) => s + n._childrenCount, 0);
  const currentMonthLabel = dataMode === "real" && focusMonth ? ` · ${focusMonth} 粉色高亮` : "";

  return (
    <div className="starmap-wrap" ref={mountRef}>
      {loading && <div className="boot-screen">正在加载 3D 星图...</div>}

      {!loading && (
        <>
          <div className="starmap-data-switch">
            <button className={dataMode === "real" ? "active" : ""} onClick={() => setDataMode("real")}>真实数据</button>
            <button className={dataMode === "mock" ? "active" : ""} onClick={() => setDataMode("mock")}>Mock 星球树</button>
          </div>

          <div className="starmap-title">
            DOC KNOWLEDGE TREE · RADIAL STAR CLUSTER
            <span className="starmap-title-sub">（N={nodeCount} 节点，E={edgeCount} 边，{dataMode === "mock" ? "MOCK" : "REAL"}{currentMonthLabel}）</span>
          </div>

          <div className="starmap-depth">
            {perDepth.map((cnt, d) => (
              <div key={d} className="star-depth-row">Depth {d} – 层 {d}（n={cnt}）</div>
            ))}
          </div>

          <div className="starmap-status">
            Nodes per depth:{perDepth.join(" - ")}  |  Max depth: {maxDepth}  |  {dataMode === "mock" ? "Mock 星球树" : "真实知识树"}
          </div>

          <button className="starmap-pause" onClick={() => { const np = !paused; setPaused(np); pausedRef.current = np; }}>
            {paused ? "▶ 转动" : "❚❚ 暂停自转"}
          </button>

          <div className="starmap-legend">
            {pickTop(laidOut, 4).map(n => (
              <div key={n.id} className="star-legend-item">
                <span className="star-legend-dot" style={{ width: nodePx(n._size, n._descendantCount) * 0.6 + 3, height: nodePx(n._size, n._descendantCount) * 0.6 + 3 }} />
                {n.title}（{n._descendantCount} 子文档）
              </div>
            ))}
          </div>
        </>
      )}

      {tooltip && (
        <div className="starmap-tooltip" style={{ left: tooltip.screen.x + 14, top: tooltip.screen.y + 14 }}>
          <b>{tooltip.node.title}</b>
          <div>子文档 {tooltip.node._childrenCount} · 深度 {tooltip.node._depth}</div>
        </div>
      )}
    </div>
  );
}
