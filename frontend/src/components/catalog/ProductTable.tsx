import React from 'react';
import { ShoppingCart, Edit3, Flame, AlertCircle } from 'lucide-react';
import type { Product } from '../../types/product';
import { StatusBadge } from '../common/Badge';
import { StockHealthBar } from './StockHealthBar';
import { Button } from '../common/Button';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onSimulateSale: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onQuickSale1Unit: (product: Product) => Promise<void>;
  quickSaleLoadingId: string | null;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onSimulateSale,
  onAdjustStock,
  onQuickSale1Unit,
  quickSaleLoadingId,
}) => {
  const formatCurrency = (val: number) => `$${Number(val).toFixed(2)}`;

  if (isLoading && products.length === 0) {
    return (
      <div className="table-loading-card mono">
        <span>Loading catalog items...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="table-empty-card">
        <AlertCircle size={28} className="text-ink3 mb-2" />
        <h4 className="font-semibold text-ink">No Products Match Current Filter</h4>
        <p className="text-sm text-ink2 mt-1">
          Try clearing your search query or selecting a different category/status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="product-table-wrapper" role="region" aria-label="Product Catalog Grid">
      <div className="table-responsive-container">
        <table className="catalog-table">
          <thead>
            <tr>
              <th scope="col" className="col-sku mono">SKU</th>
              <th scope="col" className="col-name">Product Name</th>
              <th scope="col" className="col-category mono">Category</th>
              <th scope="col" className="col-price mono text-right">Current Price</th>
              <th scope="col" className="col-stock">Stock Health</th>
              <th scope="col" className="col-velocity mono text-center">Velocity</th>
              <th scope="col" className="col-status">Status</th>
              <th scope="col" className="col-actions text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isBelowThreshold = product.stockLevel < product.reorderThreshold;
              const isHighVelocity = product.demandVelocity >= 10;
              const isQuickSelling = quickSaleLoadingId === product.id;

              return (
                <tr
                  key={product.id}
                  className={`catalog-row ${isBelowThreshold ? 'row-warning' : ''}`}
                >
                  {/* SKU */}
                  <td className="col-sku">
                    <span className="sku-tag mono font-medium">{product.sku}</span>
                    <span className="id-subtag mono text-xs text-ink3 block">{product.id}</span>
                  </td>

                  {/* Name */}
                  <td className="col-name">
                    <div className="product-title-cell font-medium text-ink">
                      {product.name}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="col-category">
                    <span className="pill badge-gray mono">{product.category}</span>
                  </td>

                  {/* Current Price */}
                  <td className="col-price text-right">
                    <span className="price-tag mono font-semibold">
                      {formatCurrency(product.currentPrice)}
                    </span>
                  </td>

                  {/* Stock Level & Progress Bar */}
                  <td className="col-stock">
                    <StockHealthBar
                      stockLevel={product.stockLevel}
                      reorderThreshold={product.reorderThreshold}
                    />
                  </td>

                  {/* Velocity */}
                  <td className="col-velocity text-center">
                    <div className="velocity-readout mono">
                      {isHighVelocity && <Flame size={12} className="text-accent inline mr-1" />}
                      <span className={isHighVelocity ? 'font-semibold text-accent' : ''}>
                        {product.demandVelocity}
                      </span>
                      <span className="text-xs text-ink3 block">/24h</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="col-status">
                    <StatusBadge status={product.status} />
                  </td>

                  {/* Quick Actions */}
                  <td className="col-actions text-right">
                    <div className="row-action-btns">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={product.stockLevel <= 0}
                        loading={isQuickSelling}
                        onClick={() => onQuickSale1Unit(product)}
                        title="Simulate 1 sale instantly"
                        icon={<ShoppingCart size={12} />}
                      >
                        -1 Sale
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSimulateSale(product)}
                        title="Open simulation dialog for this SKU"
                      >
                        Simulate...
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdjustStock(product)}
                        title="Directly edit stock level"
                        icon={<Edit3 size={12} />}
                      >
                        Adjust
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
