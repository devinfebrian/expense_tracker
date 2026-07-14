export default function SummaryCard({ label, value, valueClass = '', trend, trendIcon, trendColor, subtext, children }) {
  return (
    <div className="summary-card">
      <p className="summary-label">{label}</p>
      <h3 className={`summary-value ${valueClass}`}>{value}</h3>
      {children}
      {(trend || trendIcon || subtext) && (
        <div className="summary-trend" style={{ marginTop: children ? 4 : 0 }}>
          {trendIcon && (
            <span className="material-symbols-outlined" style={{ color: trendColor, marginRight: 4 }}>
              {trendIcon}
            </span>
          )}
          {trend && (
            <span className="summary-trend-text" style={{ color: trendColor, marginRight: 4 }}>
              {trend}
            </span>
          )}
          {subtext && (
            <span className="summary-trend-text" style={{ color: 'var(--on-surface-variant)' }}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
