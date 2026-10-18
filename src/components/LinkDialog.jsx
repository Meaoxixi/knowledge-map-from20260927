// 关系编辑对话框（7.3）：选择关系类型 + 填写说明，确认后持久化。
import { useState } from "react";
import { X, GitBranch } from "lucide-react";
import { EDGE_TYPES } from "../store/types";

export default function LinkDialog({ dialog, nodeMap, onConfirm, onCancel }) {
  const [type, setType] = useState("extends");
  const [label, setLabel] = useState("");

  if (!dialog) return null;
  const source = nodeMap[dialog.source];
  const target = nodeMap[dialog.target];

  function confirm() {
    onConfirm(type, label.trim());
    setLabel("");
  }

  return (
    <div className="link-dialog-backdrop" onClick={onCancel}>
      <div className="link-dialog" onClick={e => e.stopPropagation()}>
        <div className="link-dialog-head">
          <span><GitBranch size={15}/> 建立关系</span>
          <button onClick={onCancel} aria-label="关闭"><X size={15}/></button>
        </div>
        <div className="link-dialog-path">
          <span className="link-node-name">{source?.title || dialog.source}</span>
          <span className="link-arrow">→</span>
          <span className="link-node-name">{target?.title || dialog.target}</span>
        </div>

        <div className="section-label">关系类型 / TYPE</div>
        <div className="link-types">
          {Object.entries(EDGE_TYPES).map(([value, label]) => (
            <button key={value} className={type === value ? "active" : ""} onClick={() => setType(value)}>{label}</button>
          ))}
        </div>

        <div className="section-label">关系说明 / LABEL（可选）</div>
        <input
          className="link-label-input"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="例如：提供理论基础"
          onKeyDown={e => { if (e.key === "Enter") confirm(); }}
        />

        <div className="link-dialog-actions">
          <button className="secondary-action" onClick={onCancel}>取消</button>
          <button className="primary-action" onClick={confirm}>确认连接</button>
        </div>
      </div>
    </div>
  );
}
