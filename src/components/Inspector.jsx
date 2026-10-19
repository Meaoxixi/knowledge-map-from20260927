// 右侧详情面板：节点编辑、正文预览/编辑、标签、关系列表、操作按钮、分栏把手。
// 做法 B：确认区节点默认只读，点「编辑」临时解锁，改完仍留在确认区。
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GitBranch, ChevronRight, X, Plus, Save, Trash2, FolderInput, PenLine, Eye, Lock, Unlock } from "lucide-react";
import { COLORS } from "../constants";
import { ZONE, NODE_TYPES, EDGE_TYPES } from "../store/types";

export default function Inspector({
  handleRef,
  selected, draft, previewBody,
  edges, nodeMap,
  saveState, modeLabel, nodeCount, edgeCount,
  readOnly, hideZoneToggle, onUnlock,
  onTitleChange, onSummaryChange, onBodyChange, onTagsChange, onDateChange, onTogglePreview,
  onSave, onCreateBranch, onToggleZone, onRemoveNode,
  onSelectNode, onRemoveEdge, onClose,
}) {
  return (
    <aside className="inspector">
      <div className="resize-handle" ref={handleRef} />
      <div className="inspector-head">
        <div><div className="eyebrow">NODE INSPECTOR</div><h3>笔记内容</h3></div>
        <div className="inspector-head-actions"><GitBranch size={17}/><button className="icon-button" onClick={onClose} title="收起笔记内容"><ChevronRight size={16}/></button></div>
      </div>

      {selected && draft ? <>
        <div className="detail-type">
          <span className="type-dot" style={{ background: COLORS[selected.type] }}/>{NODE_TYPES[selected.type] || selected.type}
          <span className={`status-badge ${selected.status}`}>{selected.status === ZONE.CONFIRMED ? "确认区" : "工作区"}</span>
          {draft.date && <span className="date-badge">{draft.date}</span>}
        </div>

        {readOnly && (
          <div className="readonly-banner"><Lock size={12}/> 这是确认区正式内容，当前只读。如需修改，请点「编辑」临时解锁，或「退回」到工作区。</div>
        )}

        {readOnly ? (
          <>
            <h2 className="detail-title">{draft.title}</h2>
            <p className="detail-summary">{draft.summary}</p>

            <div className="detail-section body-section">
              <div className="section-label">正文 / MARKDOWN</div>
              <div className="md-sheet"><Markdown remarkPlugins={[remarkGfm]}>{draft.body || "*（暂无内容）*"}</Markdown></div>
            </div>

            <div className="detail-section">
              <div className="section-label">关键词 / TAGS</div>
              <div className="tags">
                {draft.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean).map(t => <span key={t}>{t}</span>)}
                {!draft.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean).length && <span className="empty">暂无标签</span>}
              </div>
            </div>
          </>
        ) : (
          <>
            <input className="detail-title-input" value={draft.title} onChange={e => onTitleChange(e.target.value)} placeholder="节点标题" />
            <input className="detail-summary-input" value={draft.summary} onChange={e => onSummaryChange(e.target.value)} placeholder="一句话摘要" />

            <div className="detail-section">
              <div className="section-label">编写日期 / DATE</div>
              <input className="tags-input" type="date" value={draft.date} onChange={e => onDateChange(e.target.value)} />
            </div>

            <div className="detail-section body-section">
              <div className="section-label">
                正文 / MARKDOWN
                <button className="mini-toggle" onClick={onTogglePreview}>{previewBody ? <PenLine size={12}/> : <Eye size={12}/>}{previewBody ? "编辑" : "预览"}</button>
              </div>
              {previewBody
                ? <div className="md-sheet"><Markdown remarkPlugins={[remarkGfm]}>{draft.body || "*（暂无内容，点击右上角「编辑」开始书写）*"}</Markdown></div>
                : <textarea className="body-editor" value={draft.body} onChange={e => onBodyChange(e.target.value)} placeholder="在这里写 Markdown 笔记..." />}
            </div>

            <div className="detail-section">
              <div className="section-label">关键词 / TAGS</div>
              <input className="tags-input" value={draft.tags} onChange={e => onTagsChange(e.target.value)} placeholder="用逗号分隔，如：模型, 评测" />
            </div>
          </>
        )}

        <div className="detail-section">
          <div className="section-label">关系节点 / CONNECTIONS</div>
          <div className="connections">
            {edges.filter(e => e.source === selected.id || e.target === selected.id).map(e => {
              const other = nodeMap[e.source === selected.id ? e.target : e.source];
              if (!other) return null;
              const isOut = e.source === selected.id;
              return (
                <div key={e.id} className="connection-row">
                  <button onClick={() => onSelectNode(other.id)}>
                    <span className="connection-line"/>
                    <span className="connection-text">
                      <b>{other.title}</b>
                      <small>{isOut ? "下游 · " : "上游 · "}{e.label}{EDGE_TYPES[e.type] ? `（${EDGE_TYPES[e.type]}）` : ""}</small>
                    </span>
                    <ChevronRight size={14}/>
                  </button>
                  {!readOnly && <button className="conn-del" onClick={() => onRemoveEdge(e.id)} title="删除关系"><X size={13}/></button>}
                </div>
              );
            })}
            {!edges.some(e => e.source === selected.id || e.target === selected.id) && <p className="empty">暂无关系</p>}
          </div>
        </div>

        <div className="detail-actions">
          {readOnly ? (
            <>
              <button className="primary-action" onClick={onUnlock}><Unlock size={14}/>编辑</button>
              {!hideZoneToggle && <button className="secondary-action" onClick={onToggleZone}><FolderInput size={14}/>退回工作区</button>}
              <button className="danger-action" onClick={onRemoveNode}><Trash2 size={14}/>删除</button>
            </>
          ) : (
            <>
              <button className="primary-action" onClick={onSave}><Save size={15}/>保存</button>
              <button className="secondary-action" onClick={onCreateBranch}><Plus size={14}/>分支</button>
              {!hideZoneToggle && <button className="secondary-action" onClick={onToggleZone}><FolderInput size={14}/>{selected.status === ZONE.CONFIRMED ? "退回工作区" : "推送到确认区"}</button>}
              <button className="danger-action" onClick={onRemoveNode}><Trash2 size={14}/>删除</button>
            </>
          )}
        </div>
      </> : <div className="empty-state">双击空白画布新建节点，或点击一个节点查看与编辑。</div>}

      <div className="inspector-bottom">
        <span className={`status-pulse ${saveState}`}/>
        {saveState === "saving" ? "保存中..." : saveState === "saved" ? "已保存" : saveState === "error" ? "保存失败" : modeLabel}
        <span className="bottom-divider"/> {nodeCount} 节点 · {edgeCount} 关系
      </div>
    </aside>
  );
}
