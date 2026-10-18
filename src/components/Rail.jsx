// 左侧时间轴栏：展示学习阶段，切换当前阶段。
export default function Rail({ stages, stageId, onSelectStage }) {
  const currentIndex = stages.findIndex(x => x.id === stageId);
  return (
    <aside className="rail">
      <div className="brand-mark">K<span>.</span></div>
      <div className="rail-line" />
      <div className="rail-caption">TIMELINE</div>
      <div className="timeline">
        {stages.map((s, i) => (
          <button
            key={s.id}
            className={`time-item ${stageId === s.id ? "active" : ""} ${i < currentIndex ? "passed" : ""}`}
            onClick={() => onSelectStage(s.id)}
            title={`${s.date} ${s.title}`}
          >
            <span className="time-dot" />
            <span className="time-date">{s.date}</span>
            <span className="time-month">{s.month}</span>
            <span className="time-title">{s.title}</span>
          </button>
        ))}
      </div>
      <div className="rail-bottom">RESEARCH<br/>LOG / 2026</div>
    </aside>
  );
}
