import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, ProductStatus } from '../types/product';
import type { ProductFiltersState } from '../types/api';
import { productService } from '../services/productService';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductFiltersState>({
    category: 'ALL',
    status: 'ALL',
    searchQuery: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch catalog';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // oxlint-disable-next-line react/set-state-in-effect -- async data fetch is the intended side-effect here
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side filtering across category, status, and search query
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (filters.category !== 'ALL' && item.category !== filters.category) {
        return false;
      }
      // Status filter
      if (filters.status !== 'ALL' && item.status !== filters.status) {
        return false;
      }
      // Search query filter (matches SKU or Name case-insensitively)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesName = item.name.toLowerCase().includes(query);
        return matchesSku || matchesName;
      }
      return true;
    });
  }, [products, filters]);

  // Optimistic update methods for seamless UI responsiveness
  const updateLocalStock = useCallback((productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newStatus: ProductStatus = newStock === 0 ? 'OUT_OF_STOCK' : p.status;
        return {
          ...p,
          stockLevel: newStock,
          status: newStatus,
        };
      })
    );
  }, []);

  const updateLocalPrice = useCallback((productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentPrice: newPrice } : p))
    );
  }, []);

  const updateLocalStatus = useCallback((productId: string, newStatus: ProductStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
    );
  }, []);

  return {
    products,
    filteredProducts,
    isLoading,
    error,
    filters,
    setFilters,
    refetchProducts: fetchProducts,
    updateLocalStock,
    updateLocalPrice,
    updateLocalStatus,
  };
}
