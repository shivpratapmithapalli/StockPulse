import React, { useState } from 'react';
import { Check, X, ArrowRight, DollarSign, PackagePlus, Clock } from 'lucide-react';
import type { PendingProductItem } from '../../types/suggestion';
import { TriggerBadge, DirectionBadge } from '../common/Badge';
import { ReasoningQuote } from './ReasoningQuote';
import { Button } from '../common/Button';
import { useToast } from '../../hooks/useToast';

interface SuggestionCardProps {
  item: PendingProductItem;
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
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  item,
  onRespondPricing,
  onRespondReorder,
}) => {
  const { product, pricingSuggestion, reorderSuggestion } = item;
  const { success, error } = useToast();

  const [isPricingLoading, setIsPricingLoading] = useState<boolean>(false);
  const [isReorderLoading, setIsReorderLoading] = useState<boolean>(false);

  // Trigger reason from either suggestion
  const triggerReason =
    pricingSuggestion?.triggerReason || reorderSuggestion?.triggerReason || 'INVENTORY_LOW';

  // Format currency
  const formatCurrency = (val: number) => `$${Number(val).toFixed(2)}`;

  // Handle Pricing Accept/Reject
  const handlePricingAction = async (action: 'ACCEPT' | 'REJECT') => {
    if (!pricingSuggestion) return;
    setIsPricingLoading(true);
    try {
      await onRespondPricing(
        pricingSuggestion.id,
        action,
        product.id,
        pricingSuggestion.recommendedPrice
      );
      if (action === 'ACCEPT') {
        success(
          `Updated price for ${product.name} to ${formatCurrency(pricingSuggestion.recommendedPrice)}`,
          'Pricing Accepted'
        );
      } else {
        success(`Pricing recommendation dismissed for ${product.name}`, 'Pricing Rejected');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      error(msg, 'Pricing Update Error');
    } finally {
      setIsPricingLoading(false);
    }
  };

  // Handle Reorder Accept/Reject
  const handleReorderAction = async (action: 'ACCEPT' | 'REJECT') => {
    if (!reorderSuggestion) return;
    setIsReorderLoading(true);
    try {
      await onRespondReorder(
        reorderSuggestion.id,
        action,
        product.id,
        reorderSuggestion.recommendedQuantity
      );
      if (action === 'ACCEPT') {
        success(
          `Inbound order placed for +${reorderSuggestion.recommendedQuantity} units of ${product.name}`,
          'Reorder Submitted'
        );
      } else {
        success(`Reorder recommendation dismissed for ${product.name}`, 'Reorder Rejected');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      error(msg, 'Reorder Error');
    } finally {
      setIsReorderLoading(false);
    }
  };

  return (
    <article className="suggestion-card animate-fade-in" aria-labelledby={`product-title-${product.id}`}>
      {/* Card Header: Product Identity & Trigger attribution */}
      <header className="suggestion-card-header">
        <div className="product-identity">
          <div className="product-meta-row">
            <span className="sku-pill mono">{product.sku}</span>
            <span className="pill badge-gray mono">{product.category}</span>
            <TriggerBadge trigger={triggerReason} />
          </div>
          <h3 id={`product-title-${product.id}`} className="product-name">
            {product.name}
          </h3>
        </div>

        {/* Quick Baseline Metrics */}
        <div className="product-stats-strip mono">
          <div className="stat-pill">
            <span className="stat-label">Stock</span>
            <strong className={product.stockLevel < product.reorderThreshold ? 'text-amber' : ''}>
              {product.stockLevel} / {product.reorderThreshold} thr
            </strong>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Current</span>
            <strong>{formatCurrency(product.currentPrice)}</strong>
          </div>
          <div className="stat-pill">
            <span className="stat-label">24h Velocity</span>
            <strong>{product.demandVelocity} orders</strong>
          </div>
        </div>
      </header>

      {/* Card Body: Dual Columns (Pricing & Reorder) */}
      <div className="suggestion-columns">
        {/* Left Column: Dynamic Pricing Recommendation */}
        <section className="suggestion-subpanel" aria-label="Dynamic Pricing Recommendation">
          <div className="subpanel-header">
            <div className="subpanel-title mono">
              <DollarSign size={15} className="text-accent" />
              <span>Dynamic Pricing Recommendation</span>
            </div>
            {pricingSuggestion && (
              <DirectionBadge
                direction={pricingSuggestion.changeDirection}
                currentPrice={pricingSuggestion.currentPrice || product.currentPrice}
                recommendedPrice={pricingSuggestion.recommendedPrice}
              />
            )}
          </div>

          {pricingSuggestion ? (
            <div className="subpanel-content">
              {/* Price Delta Visual Display */}
              <div className="price-delta-box">
                <div className="price-node">
                  <span className="price-node-label mono">Current Price</span>
                  <span className="price-node-val mono strike">
                    {formatCurrency(pricingSuggestion.currentPrice || product.currentPrice)}
                  </span>
                </div>
                <ArrowRight size={18} className="price-delta-arrow text-accent" />
                <div className="price-node">
                  <span className="price-node-label mono">AI Recommended</span>
                  <span className="price-node-val mono font-bold text-accent">
                    {formatCurrency(pricingSuggestion.recommendedPrice)}
                  </span>
                </div>
              </div>

              {/* AI Reasoning Quote */}
              <ReasoningQuote
                reasoning={pricingSuggestion.reasoning}
                confidence={pricingSuggestion.confidence}
                type="pricing"
              />

              {/* Action Buttons */}
              <div className="subpanel-actions">
                <Button
                  variant="success"
                  loading={isPricingLoading}
                  onClick={() => handlePricingAction('ACCEPT')}
                  icon={<Check size={14} />}
                >
                  Accept Price Change
                </Button>
                <Button
                  variant="ghost"
                  loading={isPricingLoading}
                  onClick={() => handlePricingAction('REJECT')}
                  icon={<X size={14} />}
                >
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="subpanel-cleared mono">
              <Check size={14} className="text-green" />
              <span>Pricing decision resolved</span>
            </div>
          )}
        </section>

        {/* Right Column: Replenishment Reorder Recommendation */}
        <section className="suggestion-subpanel" aria-label="Replenishment Reorder Recommendation">
          <div className="subpanel-header">
            <div className="subpanel-title mono">
              <PackagePlus size={15} className="text-teal" />
              <span>Replenishment Reorder</span>
            </div>
            {reorderSuggestion && (
              <span className="pill badge-teal mono font-semibold">
                +{reorderSuggestion.recommendedQuantity} Units
              </span>
            )}
          </div>

          {reorderSuggestion ? (
            <div className="subpanel-content">
              {/* Reorder Delta Visual Display */}
              <div className="reorder-delta-box">
                <div className="price-node">
                  <span className="price-node-label mono">Current Inventory</span>
                  <span className="price-node-val mono">
                    {reorderSuggestion.currentStock ?? product.stockLevel} units
                  </span>
                </div>
                <ArrowRight size={18} className="price-delta-arrow text-teal" />
                <div className="price-node">
                  <span className="price-node-label mono">Suggested Replenishment</span>
                  <span className="price-node-val mono font-bold text-teal">
                    Order +{reorderSuggestion.recommendedQuantity} units
                  </span>
                </div>
              </div>

              {/* Lead Time indicator */}
              <div className="lead-time-indicator mono">
                <Clock size={13} className="text-ink3" />
                <span>Estimated Lead Time: {reorderSuggestion.suggestedLeadTimeDays} days</span>
              </div>

              {/* AI Reasoning Quote */}
              <ReasoningQuote
                reasoning={reorderSuggestion.reasoning}
                confidence={reorderSuggestion.confidence}
                type="reorder"
              />

              {/* Action Buttons */}
              <div className="subpanel-actions">
                <Button
                  variant="teal"
                  loading={isReorderLoading}
                  onClick={() => handleReorderAction('ACCEPT')}
                  icon={<Check size={14} />}
                >
                  Accept &amp; Reorder
                </Button>
                <Button
                  variant="ghost"
                  loading={isReorderLoading}
                  onClick={() => handleReorderAction('REJECT')}
                  icon={<X size={14} />}
                >
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="subpanel-cleared mono">
              <Check size={14} className="text-teal" />
              <span>Reorder decision resolved</span>
            </div>
          )}
        </section>
      </div>
    </article>
  );
};
