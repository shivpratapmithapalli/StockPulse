import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'teal' | 'amber' | 'red';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  badge,
  icon,
  variant = 'default',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`stat-card stat-${variant} ${onClick ? 'stat-card-clickable' : ''}`}
    >
      <div className="stat-card-top">
        <span className="stat-card-label mono">{label}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <div className="stat-card-main">
        <span className={`stat-card-value mono stat-color-${variant}`}>{value}</span>
        {badge && <div className="stat-card-badge">{badge}</div>}
      </div>
      {subtext && <div className="stat-card-subtext">{subtext}</div>}
    </div>
  );
};
