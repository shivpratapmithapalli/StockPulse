import React from 'react';
import type { ProductStatus } from '../../types/product';
import type { ChangeDirection, TriggerReason } from '../../types/suggestion';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'accent' | 'teal' | 'amber' | 'green' | 'red' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles: Record<string, string> = {
    default: 'badge-default',
    accent: 'badge-accent',
    teal: 'badge-teal',
    amber: 'badge-amber',
    green: 'badge-green',
    red: 'badge-red',
    gray: 'badge-gray',
  };

  const sizeStyles = size === 'sm' ? 'badge-sm' : 'badge-md';

  return (
    <span className={`pill ${variantStyles[variant] || 'badge-default'} ${sizeStyles} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ProductStatus }> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="green">Active</Badge>;
    case 'PRICE_REVIEW_PENDING':
      return <Badge variant="accent">Review Pending</Badge>;
    case 'OUT_OF_STOCK':
      return <Badge variant="red">Out of Stock</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
};

export const TriggerBadge: React.FC<{ trigger: TriggerReason }> = ({ trigger }) => {
  switch (trigger) {
    case 'INVENTORY_LOW':
      return (
        <span className="pill badge-amber mono" title="Triggered because stock fell below reorder threshold">
          [INVENTORY_LOW]
        </span>
      );
    case 'DEMAND_SPIKE':
      return (
        <span className="pill badge-teal mono" title="Triggered by high demand velocity relative to category">
          [DEMAND_SPIKE]
        </span>
      );
    case 'MANUAL':
      return (
        <span className="pill badge-gray mono" title="Triggered on-demand by merchandiser">
          [MANUAL]
        </span>
      );
    case 'INITIAL':
      return (
        <span className="pill badge-gray mono" title="Initial catalog baseline">
          [INITIAL]
        </span>
      );
    default:
      return <span className="pill badge-gray mono">[{trigger}]</span>;
  }
};

export const DirectionBadge: React.FC<{
  direction: ChangeDirection;
  currentPrice: number;
  recommendedPrice: number;
}> = ({ direction, currentPrice, recommendedPrice }) => {
  if (currentPrice <= 0) return null;
  const pct = Math.abs(((recommendedPrice - currentPrice) / currentPrice) * 100).toFixed(1);

  if (direction === 'INCREASE') {
    return (
      <span className="pill badge-green mono font-semibold">
        +{pct}% ▲
      </span>
    );
  }
  if (direction === 'DECREASE') {
    return (
      <span className="pill badge-amber mono font-semibold">
        -{pct}% ▼
      </span>
    );
  }
  return <span className="pill badge-gray mono">HOLD 0%</span>;
};
