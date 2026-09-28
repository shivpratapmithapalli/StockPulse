import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingBag, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Product } from '../../types/product';
import { Button } from '../common/Button';

interface OrderSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct: Product | null;
  onPlaceSimulatedOrder: (productId: string, quantity: number) => Promise<void>;
  onNavigateToFloor: () => void;
}

export const OrderSimModal: React.FC<OrderSimModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProduct,
  onPlaceSimulatedOrder,
  onNavigateToFloor,
}) => {
  const [targetProductId, setTargetProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState<boolean>(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- initializing modal state from props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedProduct) {
        setTargetProductId(selectedProduct.id);
      } else if (products.length > 0) {
        // Default to PRD-003 if available, or first product
        const defaultProduct = products.find(p => p.id === 'PRD-003') ?? products[0];
        if (defaultProduct) {
          setTargetProductId(defaultProduct.id);
        }
      }
      setOrderPlacedSuccess(false);
      // Reset quantity when modal opens
      setQuantity(2);
    }
  }, [isOpen, selectedProduct, products]);

  if (!isOpen) return null;

  // Handle case where there are no products
  if (products.length === 0) {
    return (
      <div className="modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="sim-modal-title">
        <div className="modal-card">
          <div className="modal-header">
            <div className="modal-title-box">
              <h3 id="sim-modal-title" className="modal-title">
                Simulate Customer Sales Order
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
          <div className="modal-body-empty">
            <p>No products available for simulation.</p>
            <div className="modal-footer-actions">
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentProduct = products.find((p) => p.id === targetProductId) || 
                     products.find(p => p.id === 'PRD-003') || 
                     products[0] || 
                     null;
                     
  const currentStock = currentProduct ? currentProduct.stockLevel : 0;
  const threshold = currentProduct ? currentProduct.reorderThreshold : 0;
  const simulatedStock = Math.max(0, currentStock - quantity);
  const willTriggerLowStock = currentProduct && simulatedStock < threshold;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await onPlaceSimulatedOrder(currentProduct.id, quantity);
      setOrderPlacedSuccess(true);
      // Close the modal immediately
      onClose();
    } catch {
      // Handled via toast in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickQtyOptions = [1, 2, 5, 8];

  return (
    <div className="modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="sim-modal-title">
      <div className="modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <h3 id="sim-modal-title" className="modal-title">
              Simulate Customer Sales Order
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

        {/* Modal Body */}
        {orderPlacedSuccess ? (
          <div className="modal-success-body animate-fade-in">
            <div className="success-icon-box text-green">
              <CheckCircle2 size={44} />
            </div>
            <h4 className="success-heading">Simulated Sale Dispatched!</h4>
            <p className="success-text">
              Stock decremented for <strong>{currentProduct.name}</strong> to{' '}
              <strong>{simulatedStock} units</strong>. The backend committed the transaction in &lt;15ms and published an{' '}
              <code className="mono">InventorySignalEvent</code>.
            </p>
            <div className="success-callout mono">
              <span>Agentic Loop Status: Observe ➔ Reason ➔ Act</span>
            </div>
            <div className="modal-footer-actions">
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  onNavigateToFloor();
                }}
                icon={<Sparkles size={14} />}
              >
                Go to Review Pane
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOrderPlacedSuccess(false)}
              >
                Simulate Another
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <p className="modal-intro text-sm text-ink2">
              Select a catalog product and quantity to simulate an immediate customer checkout. This updates database stock and tests the automated pricing and reorder triggers.
            </p>

            {/* Product Selector */}
            <div className="form-group">
              <label htmlFor="sim-product-select" className="form-label mono">
                Target Product
              </label>
              <select
                id="sim-product-select"
                value={targetProductId}
                onChange={(e) => setTargetProductId(e.target.value)}
                className="form-select mono"
                disabled={isSubmitting}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku}) - ${p.currentPrice.toFixed(2)} - Stock: {p.stockLevel}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Selector */}
            <div className="form-group">
              <label htmlFor="sim-qty-input" className="form-label mono">
                Order Quantity (Units)
              </label>
              <div className="qty-input-row">
                <input
                  id="sim-qty-input"
                  type="number"
                  min="1"
                  max={Math.max(1, currentStock)}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0) {
                      setQuantity(Math.min(value, Math.max(1, currentStock)));
                    }
                  }}
                  className="form-input mono"
                  disabled={isSubmitting}
                />
                <div className="qty-quick-chips">
                  {quickQtyOptions.map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(qty)}
                      className={`qty-chip mono ${quantity === qty ? 'active' : ''}`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Impact Preview */}
            {currentProduct && (
              <div className="sim-preview-box">
                <div className="sim-preview-title mono">Projected State Change:</div>
                <div className="sim-preview-nodes">
                  <div className="sim-node">
                    <span className="node-label mono">Current Stock:</span>
                    <span className="node-val mono">{currentStock} units</span>
                  </div>
                  <ArrowRight size={16} className="text-ink3" />
                  <div className="sim-node">
                    <span className="node-label mono">Post-Order Stock:</span>
                    <span className={`node-val mono font-bold ${willTriggerLowStock ? 'text-amber' : ''}`}>
                      {simulatedStock} units
                    </span>
                  </div>
                </div>

                {willTriggerLowStock && (
                  <div className="sim-warning-callout">
                    <AlertTriangle size={14} className="text-amber flex-shrink-0" />
                    <span className="text-xs">
                      Post-order stock ({simulatedStock}) drops below reorder threshold ({threshold}). This will fire an{' '}
                      <strong>[INVENTORY_LOW]</strong> signal into the AI loop!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="modal-footer-actions">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={currentStock <= 0}
                icon={<ShoppingBag size={14} />}
              >
                Place Simulated Order
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
        )}
      </div>
    </div>
  );
};
