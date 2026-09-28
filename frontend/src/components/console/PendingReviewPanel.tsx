import React from 'react';
import type { PendingProductItem } from '../../types/suggestion';
import { SuggestionCard } from './SuggestionCard';
import { Sparkles, CheckCircle2, ShoppingCart, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

interface PendingReviewPanelProps {
  pendingItems: PendingProductItem[];
  isLoading: boolean;
  onRespondPricing: (
    suggestionId: number,
    action: 'ACCEPT' | 'REJECT',
    productId: string,
    recommendedPrice: number
  ) => Promise<void>;
  onRespondReorder: (
    suggestionId: number,
    action: 'ACCEPT' | 'REJECT',
    productId: string,
    quantity: number
  ) => Promise<void>;
  onOpenSimModal: () => void;
  onQuickSimulatePrd003: () => Promise<void>;
  isQuickSimulating: boolean;
  onRefresh: () => void;
}

export const PendingReviewPanel: React.FC<PendingReviewPanelProps> = ({
  pendingItems,
  isLoading,
  onRespondPricing,
  onRespondReorder,
  onOpenSimModal,
  onQuickSimulatePrd003,
  isQuickSimulating,
  onRefresh,
}) => {
  return (
    <section className="review-panel-container" aria-label="Merchandising Review Floor">
      {/* Section Header */}
      <div className="section-rule">
        <span className="section-rule-label mono">
          Human-in-the-Loop Floor · {pendingItems.length} Active {pendingItems.length === 1 ? 'Check' : 'Checks'}
        </span>
        <div className="section-rule-line" />
      </div>

      {/* Demo Walkthrough Helper Banner */}
      <div className="demo-helper-banner">
        <div className="banner-left">
          <div className="banner-badge mono">
            <Sparkles size={12} />
            <span>Interactive Zero-Curl Demo</span>
          </div>
          <p className="banner-text">
            Evaluate the agentic loop in real time: Decrement stock below threshold or spike demand to see automated recommendations surface here in 2–3 seconds.
          </p>
        </div>
        <div className="banner-actions">
          <Button
            variant="primary"
            size="sm"
            loading={isQuickSimulating}
            onClick={onQuickSimulatePrd003}
            icon={<ShoppingCart size={13} />}
          >
            Simulate 2x Sale on PRD-003
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSimModal}
          >
            Custom Simulation...
          </Button>
        </div>
      </div>

      {/* Loading Skeleton / Initial Loading State */}
      {isLoading && pendingItems.length === 0 ? (
        <div className="loading-state-card mono">
          <RefreshCw size={24} className="animate-spin text-accent" />
          <p>Scanning reactive commerce signals from backend...</p>
        </div>
      ) : pendingItems.length === 0 ? (
        /* Zero-state: Floor is clear */
        <div className="empty-state-card animate-fade-in">
          <div className="empty-state-icon text-teal">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="empty-state-title">The Review Floor is Clear</h3>
          <p className="empty-state-prose">
            All automated commerce signals have been reviewed and applied. No products currently require pricing adjustments or reorder authorizations.
          </p>
          <div className="empty-state-actions">
            <Button
              variant="primary"
              onClick={onQuickSimulatePrd003}
              loading={isQuickSimulating}
              icon={<Sparkles size={14} />}
            >
              Simulate Order on PRD-003 to Trigger Loop
            </Button>
            <Button
              variant="ghost"
              onClick={onRefresh}
              icon={<RefreshCw size={14} />}
            >
              Re-check Signals
            </Button>
          </div>
        </div>
      ) : (
        /* List of Pending Suggestion Cards */
        <div className="suggestion-cards-list">
          {pendingItems.map((item) => (
            <SuggestionCard
              key={item.product.id}
              item={item}
              onRespondPricing={onRespondPricing}
              onRespondReorder={onRespondReorder}
            />
          ))}
        </div>
      )}
    </section>
  );
};
