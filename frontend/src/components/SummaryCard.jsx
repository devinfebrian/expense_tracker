export default function SummaryCard({ label, value, valueClass = '', icon, iconBg, iconColor, trend, trendIcon, trendColor, trendDirection, trendText, subtext, children }) {
  // Support new icon API
  const hasIcon = icon && iconBg && iconColor;

  // Support old trend API and new trend API
  const finalTrendIcon = trendIcon || (trendDirection === 'up' ? 'trending_up' : trendDirection === 'down' ? 'trending_down' : '');
  const finalTrendColor = trendColor || (trendDirection === 'up' ? 'var(--secondary)' : trendDirection === 'down' ? 'var(--danger)' : 'var(--text-secondary)');
  const finalTrendText = trendText || trend;

  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <span className="summary-label">{label}</span>
        {hasIcon && (
          <div className="summary-icon" style={{ background: iconBg, color: iconColor }}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        )}
      </div>
      <h3 className={`summary-value ${valueClass}`}>{value}</h3>
      {children}
      {(finalTrendText || subtext) && (
        <div className="summary-trend" style={{ marginTop: children ? 4 : 0 }}>
          {finalTrendIcon && (
            <span className="material-symbols-outlined" style={{ color: finalTrendColor, marginRight: 4 }}>
              {finalTrendIcon}
            </span>
          )}
          {finalTrendText && (
            <span className="summary-trend-text" style={{ color: finalTrendColor, marginRight: 4 }}>
              {finalTrendText}
            </span>
          )}
          {subtext && (
            <span className="summary-trend-text" style={{ color: 'var(--text-secondary)' }}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
