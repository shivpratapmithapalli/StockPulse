import React, { useState, useEffect } from 'react';
import { X, Edit3, ArrowRight } from 'lucide-react';
import type { Product } from '../../types/product';
import { Button } from '../common/Button';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdateStock,
}) => {
  const [stockLevel, setStockLevel] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- initializing modal state from props when modal opens
  useEffect(() => {
    if (product) {
      setStockLevel(product.stockLevel);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent submission if value hasn't changed or is invalid
    if (stockLevel < 0 || stockLevel === product.stockLevel) return;

    setIsSubmitting(true);
    try {
      await onUpdateStock(product.id, stockLevel);
      onClose();
    } catch {
      // Toast handles error in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="adjust-modal-title">
      <div className="modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <h3 id="adjust-modal-title" className="modal-title">
              Adjust Stock Level
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="product-summary-box">
            <div className="mono text-xs text-ink3">{product.sku}</div>
            <div className="font-semibold text-ink">{product.name}</div>
            <div className="mono text-xs text-ink2 mt-1">
              Reorder Threshold: {product.reorderThreshold} units
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adjust-stock-input" className="form-label mono">
              New Inventory Count
            </label>
            <input
              id="adjust-stock-input"
              type="number"
              min="0"
              max="99999"
              value={stockLevel}
              onChange={(e) => setStockLevel(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="form-input mono"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Impact preview */}
          <div className="sim-preview-box">
            <div className="sim-preview-title mono">Stock Change:</div>
            <div className="sim-preview-nodes">
              <div className="sim-node">
                <span className="node-label mono">From:</span>
                <span className="node-val mono">{product.stockLevel} units</span>
              </div>
              <ArrowRight size={16} className="text-ink3" />
              <div className="sim-node">
                <span className="node-label mono">To:</span>
                <span className="node-val mono font-bold text-accent">
                  {stockLevel} units
                </span>
              </div>
            </div>
            {stockLevel < product.reorderThreshold && (
              <p className="text-xs text-amber mt-2 mono">
                ⚠️ Will trip the [INVENTORY_LOW] trigger in the agentic loop.
              </p>
            )}
          </div>

          <div className="modal-footer-actions">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting || stockLevel === product.stockLevel}
              icon={<Edit3 size={14} />}
            >
              Update Stock Level
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
