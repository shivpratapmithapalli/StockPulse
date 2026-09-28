import React from 'react';

interface StockHealthBarProps {
  stockLevel: number;
  reorderThreshold: number;
}

export const StockHealthBar: React.FC<StockHealthBarProps> = ({
  stockLevel,
  reorderThreshold,
}) => {
  // Cap visual bar at 2x threshold for a sensible 100% fill
  const maxScale = Math.max(reorderThreshold * 2, 20);
  const percentage = Math.min(100, Math.max(0, Math.round((stockLevel / maxScale) * 100)));

  // Color logic
  let barColor = 'var(--green)';
  let statusText = 'Healthy';

  if (stockLevel === 0) {
    barColor = 'var(--red)';
    statusText = 'Out of Stock';
  } else if (stockLevel < reorderThreshold) {
    barColor = 'var(--amber)';
    statusText = 'Low Stock';
  }

  return (
    <div className="stock-health-container">
      <div className="stock-health-labels mono">
        <span className="stock-val font-semibold">
          {stockLevel}{' '}
          <span className="stock-thresh opacity-60">/ {reorderThreshold} thr</span>
        </span>
        <span className="stock-status-tag" style={{ color: barColor }}>
          {statusText}
        </span>
      </div>
      <div className="stock-health-track">
        <div
          className="stock-health-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
};
