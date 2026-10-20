// 顶部工具条：区域切换、搜索、连线模式开关、主题、导入导出、帮助、分栏开关。
import { useRef } from "react";
import {
  Search, X, Sun, Moon, Download, Upload, CircleHelp, ChevronRight, ChevronLeft, Link2, Orbit,
} from "lucide-react";
import { ZONE } from "../store/types";

export default function Topbar({
  mode, zoneFilter, onZoneFilter, query, onQuery,
  light, onToggleLight, onExport, onImportData, onShowHelp,
  inspectorOpen, onToggleInspector, linkMode, onToggleLinkMode,
  view, onToggleView,
}) {
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        onImportData(data);
      } catch {
        window.alert("文件不是有效的 JSON");
      }
    };
    reader.readAsText(file);
  }

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow"> MAP <span className="live-dot" /> {mode === "local" ? "LOCAL" : "BROWSER"}</div>
        <h1>Progress</h1>
      </div>
      <div className="top-actions">
        <div className="zone-switch">
          {[["all", "全部"], [ZONE.WORKSPACE, "工作区"]].map(([v, label]) => (
            <button key={v} className={zoneFilter === v ? "active" : ""} onClick={() => onZoneFilter(v)}>{label}</button>
          ))}
        </div>
        <label className="searchbox">
          <Search size={15}/>
          <input value={query} onChange={e => onQuery(e.target.value)} placeholder="搜索知识节点..." />
          {query && <button onClick={() => onQuery("")} aria-label="清空搜索"><X size={14}/></button>}
        </label>
        <button className={`icon-button ${view === "star" ? "active" : ""}`} onClick={onToggleView} title={view === "star" ? "切换到 2D 图谱" : "切换到 3D 星图"}><Orbit size={17}/></button>
        <button className={`icon-button ${linkMode ? "active" : ""}`} onClick={onToggleLinkMode} title={linkMode ? "退出连线模式" : "连接两个节点"}><Link2 size={17}/></button>
        <button className="icon-button" onClick={onToggleLight} title="切换主题">{light ? <Moon size={17}/> : <Sun size={17}/>}</button>
        <button className="icon-button" onClick={onExport} title="导出图谱"><Download size={17}/></button>
        <button className="icon-button" onClick={() => fileInputRef.current?.click()} title="导入图谱"><Upload size={17}/></button>
        <button className="icon-button" onClick={onShowHelp} title="交互说明"><CircleHelp size={17}/></button>
        <button className="icon-button" onClick={onToggleInspector} title={inspectorOpen ? "收起知识详情" : "展开知识详情"}>{inspectorOpen ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>}</button>
      </div>
      <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleFile} />
    </header>
  );
}
