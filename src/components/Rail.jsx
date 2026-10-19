// 左侧时间轴栏：按"年份-月份"自动生成时间线（数据来自笔记日期），点击聚焦该月；底部大终点=显示全部。
export default function Rail({ months, focusMonth, onSelectMonth, onFocusAll }) {
  return (
    <aside className="rail">
      <div className="brand-mark">K<span>.</span></div>
      <div className="rail-line" />
      <div className="rail-caption">TIMELINE</div>
      <div className="timeline">
        {months.map((m) => (
          <button
            key={m}
            className={`time-item ${focusMonth === m ? "active" : ""}`}
            onClick={() => onSelectMonth(m)}
            title={m}
          >
            <span className="time-dot" />
            <span className="time-date">{m}</span>
          </button>
        ))}
        <button
          className="rail-endpoint"
          onClick={onFocusAll}
          title="显示全部节点"
        >
          <span className="endpoint-dot" />
          <span className="endpoint-label">ALL</span>
        </button>
      </div>
      <div className="rail-bottom">RESEARCH<br/>LOG / 2026</div>
    </aside>
  );
}
