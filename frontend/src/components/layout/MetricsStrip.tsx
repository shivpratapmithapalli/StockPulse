import React, { useMemo } from 'react';
import { Package, AlertTriangle, Eye, Flame } from 'lucide-react';
import type { Product } from '../../types/product';
import type { PendingProductItem } from '../../types/suggestion';
import { StatCard } from '../common/StatCard';

interface MetricsStripProps {
  products: Product[];
  pendingItems: PendingProductItem[];
  onNavigateToFloor: () => void;
  onNavigateToCeiling: () => void;
}

export const MetricsStrip: React.FC<MetricsStripProps> = ({
  products,
  pendingItems,
  onNavigateToFloor,
  onNavigateToCeiling,
}) => {
  // 1. Total Active SKUs
  const totalSkus = products.length;

  // 2. Low Stock Alerts (stockLevel < reorderThreshold or stockLevel === 0)
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stockLevel < p.reorderThreshold).length;
  }, [products]);

  // 3. Pending Review count
  const pendingCount = pendingItems.length;

  // 4. Demand Velocity Leader
  const velocityLeader = useMemo(() => {
    if (products.length === 0) return null;
    return [...products].sort((a, b) => b.demandVelocity - a.demandVelocity)[0];
  }, [products]);

  return (
    <div className="metrics-strip-grid" role="region" aria-label="Key Performance Indicators">
      {/* 1. Total Active SKUs */}
      <StatCard
        label="Catalog Monitored"
        value={`${totalSkus} SKUs`}
        subtext="Live reactive inventory feed"
        icon={<Package size={16} />}
        variant="default"
        onClick={onNavigateToCeiling}
      />

      {/* 2. Low Stock Items */}
      <StatCard
        label="Low Stock Alerts"
        value={lowStockCount}
        subtext={
          lowStockCount > 0
            ? `${lowStockCount} item${lowStockCount > 1 ? 's' : ''} below reorder line`
            : 'All stock levels healthy'
        }
        icon={<AlertTriangle size={16} />}
        variant={lowStockCount > 0 ? 'amber' : 'default'}
        onClick={onNavigateToCeiling}
      />

      {/* 3. Pending Suggestions */}
      <StatCard
        label="Pending AI Reviews"
        value={pendingCount}
        subtext={
          pendingCount > 0
            ? 'Awaiting merchandiser decision'
            : 'Floor cleared · No reviews pending'
        }
        icon={<Eye size={16} />}
        variant={pendingCount > 0 ? 'accent' : 'default'}
        onClick={onNavigateToFloor}
      />

      {/* 4. Demand Velocity Leader */}
      <StatCard
        label="Velocity Leader (24h)"
        value={velocityLeader ? `${velocityLeader.demandVelocity} /24h` : '—'}
        subtext={velocityLeader ? `${velocityLeader.sku} · ${velocityLeader.name}` : 'No sales velocity data'}
        icon={<Flame size={16} />}
        variant="teal"
      />
    </div>
  );
};
