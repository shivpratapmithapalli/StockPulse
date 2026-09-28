import { useState, useCallback } from 'react';
import { ToastProvider } from './components/common/Toast';
import { useToast } from './hooks/useToast';
import { Header } from './components/layout/Header';
import { MetricsStrip } from './components/layout/MetricsStrip';
import { NavigationTabs } from './components/layout/NavigationTabs';
import type { ActiveTab } from './components/layout/NavigationTabs';
import { PendingReviewPanel } from './components/console/PendingReviewPanel';
import { ProductTable } from './components/catalog/ProductTable';
import { ProductFilters } from './components/catalog/ProductFilters';
import { OrderSimModal } from './components/simulation/OrderSimModal';
import { StockAdjustModal } from './components/simulation/StockAdjustModal';
import { AgenticLoopView } from './components/trace/AgenticLoopView';
import { useProducts } from './hooks/useProducts';
import { usePendingSuggestions } from './hooks/usePendingSuggestions';
import { useStrategy } from './hooks/useStrategy';
import type { Product } from './types/product';
import { productService } from './services/productService';
import { WifiOff, RefreshCw } from 'lucide-react';
import './App.css';

function MerchandisingConsole() {
  const { success, error, warning } = useToast();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('FLOOR');

  // Modal states
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [selectedSimProduct, setSelectedSimProduct] = useState<Product | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null);

  // Quick sale loading state
  const [quickSaleLoadingId, setQuickSaleLoadingId] = useState<string | null>(null);
  const [isQuickSimulating, setIsQuickSimulating] = useState<boolean>(false);

  // Hook 1: Product Catalog State
  const {
    products,
    filteredProducts,
    isLoading: isProductsLoading,
    error: productsError,
    filters,
    setFilters,
    refetchProducts,
    updateLocalStock,
    updateLocalPrice,
    updateLocalStatus,
  } = useProducts();

  // Hook 2: Real-time Pending Suggestions Polling
  const {
    pendingItems,
    isLoading: isPendingLoading,
    isSyncing,
    lastSyncedAt,
    error: pendingError,
    refresh: refreshPending,
    respondPricing,
    respondReorder,
  } = usePendingSuggestions({
    pollingIntervalMs: 3000,
    onPriceAccepted: (productId, newPrice) => {
      updateLocalPrice(productId, newPrice);
    },
    onReorderAccepted: (productId, quantity) => {
      const prod = products.find((p) => p.id === productId);
      if (prod) {
        updateLocalStock(productId, prod.stockLevel + quantity);
      }
    },
    onStatusReset: (productId) => {
      updateLocalStatus(productId, 'ACTIVE');
    },
  });

  // Hook 3: Runtime Strategy Config Switcher
  const {
    activeStrategy,
    switchStrategy,
    isSwitching: isStrategySwitching,
  } = useStrategy();

  // Combined refresh
  const handleManualRefresh = useCallback(() => {
    refetchProducts();
    refreshPending();
  }, [refetchProducts, refreshPending]);

  // Action: Open order simulation modal
  const handleOpenSimModal = useCallback((product?: Product) => {
    setSelectedSimProduct(product || null);
    setIsSimModalOpen(true);
  }, []);

  // Action: Open stock adjustment modal
  const handleOpenStockModal = useCallback((product: Product) => {
    setSelectedStockProduct(product);
    setIsStockModalOpen(true);
  }, []);

  // Action: Simulate order for PRD-003 or first available item
  const handleQuickSimulatePrd003 = useCallback(async () => {
    const target =
      products.find((p) => p.id === 'PRD-003') ||
      products.find((p) => p.stockLevel > 0) ||
      products[0];

    if (!target) {
      warning('No products available to simulate order on.', 'Simulation Notice');
      return;
    }

    setIsQuickSimulating(true);
    try {
      const updated = await productService.simulateOrder(target.id, 2);
      updateLocalStock(target.id, updated.stockLevel);
      success(
        `Simulated 2x sale on ${target.name}. Stock decremented to ${updated.stockLevel}. Agentic loop triggered!`,
        'Order Simulated'
      );
      // Refresh pending suggestions after short delay so backend worker commits proposal
      setTimeout(() => {
        refreshPending();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      error(msg, 'Simulation Error');
    } finally {
      setIsQuickSimulating(false);
    }
  }, [products, updateLocalStock, success, refreshPending, warning, error]);

  // Action: Fast 1-unit sale directly from the catalog row
  const handleQuickSale1Unit = useCallback(
    async (product: Product) => {
      if (product.stockLevel <= 0) return;
      setQuickSaleLoadingId(product.id);
      try {
        const updated = await productService.simulateOrder(product.id, 1);
        updateLocalStock(product.id, updated.stockLevel);
        success(
          `1 unit sold for ${product.name}. Stock now ${updated.stockLevel}.`,
          'Sale Recorded'
        );
        setTimeout(() => {
          refreshPending();
        }, 1200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Order simulation failed';
        error(msg, 'Order Failed');
      } finally {
        setQuickSaleLoadingId(null);
      }
    },
    [updateLocalStock, success, refreshPending, error]
  );

  // Action: Dispatch custom order simulation from modal
  const handlePlaceSimulatedOrder = useCallback(
    async (productId: string, quantity: number) => {
      const updated = await productService.simulateOrder(productId, quantity);
      updateLocalStock(productId, updated.stockLevel);
      const target = products.find((p) => p.id === productId);
      success(
        `Simulated order of ${quantity} units for ${target?.name || productId}. Stock now ${updated.stockLevel}.`,
        'Order Placed'
      );
      setTimeout(() => {
        refreshPending();
      }, 1200);
    },
    [products, updateLocalStock, success, refreshPending]
  );

  // Action: Dispatch stock adjustment from modal
  const handleUpdateStock = useCallback(
    async (productId: string, newStock: number) => {
      const updated = await productService.updateStock(productId, newStock);
      updateLocalStock(productId, updated.stockLevel);
      const target = products.find((p) => p.id === productId);
      success(
        `Stock level for ${target?.name || productId} adjusted to ${updated.stockLevel}.`,
        'Inventory Updated'
      );
      setTimeout(() => {
        refreshPending();
      }, 1200);
    },
    [products, updateLocalStock, success, refreshPending]
  );

  // Is backend currently unreachable?
  const isBackendOffline = Boolean(productsError || pendingError);

  return (
    <div className="page-container">
      {/* Editorial Masthead Header */}
      <Header
        activeStrategy={activeStrategy}
        onStrategyChange={switchStrategy}
        isStrategySwitching={isStrategySwitching}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onManualRefresh={handleManualRefresh}
        onOpenSimModal={() => handleOpenSimModal()}
      />

      {/* Backend connection banner if offline or starting up */}
      {isBackendOffline && (
        <div className="offline-banner" role="alert">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="text-amber" />
            <span className="offline-text mono">
              Connecting to Spring Boot backend (http://localhost:8080)... Checking endpoints in background.
            </span>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="btn btn-outline btn-sm mono"
          >
            <RefreshCw size={12} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <MetricsStrip
        products={products}
        pendingItems={pendingItems}
        onNavigateToFloor={() => setActiveTab('FLOOR')}
        onNavigateToCeiling={() => setActiveTab('CEILING')}
      />

      {/* Navigation Tabs (The Floor / The Ceiling / Agentic Trace) */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingCount={pendingItems.length}
        catalogCount={products.length}
      />

      {/* Tab Panels */}
      <main>
        {activeTab === 'FLOOR' && (
          <PendingReviewPanel
            pendingItems={pendingItems}
            isLoading={isPendingLoading}
            onRespondPricing={respondPricing}
            onRespondReorder={respondReorder}
            onOpenSimModal={() => handleOpenSimModal()}
            onQuickSimulatePrd003={handleQuickSimulatePrd003}
            isQuickSimulating={isQuickSimulating}
            onRefresh={handleManualRefresh}
          />
        )}

        {activeTab === 'CEILING' && (
          <section className="catalog-section" aria-label="Product Catalog Floor">
            <div className="section-rule">
              <span className="section-rule-label mono">
                The Ceiling · Master Inventory Grid ({products.length} Items)
              </span>
              <div className="section-rule-line" />
            </div>

            <ProductFilters
              filters={filters}
              onChange={setFilters}
              totalCount={products.length}
              filteredCount={filteredProducts.length}
            />

            <ProductTable
              products={filteredProducts}
              isLoading={isProductsLoading}
              onSimulateSale={(p) => handleOpenSimModal(p)}
              onAdjustStock={handleOpenStockModal}
              onQuickSale1Unit={handleQuickSale1Unit}
              quickSaleLoadingId={quickSaleLoadingId}
            />
          </section>
        )}

        {activeTab === 'TRACE' && (
          <AgenticLoopView
            activeStrategy={activeStrategy}
            pendingCount={pendingItems.length}
            totalProducts={products.length}
          />
        )}
      </main>

      {/* Simulation Modal */}
      <OrderSimModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        products={products}
        selectedProduct={selectedSimProduct}
        onPlaceSimulatedOrder={handlePlaceSimulatedOrder}
        onNavigateToFloor={() => setActiveTab('FLOOR')}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={selectedStockProduct}
        onUpdateStock={handleUpdateStock}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MerchandisingConsole />
    </ToastProvider>
  );
}
