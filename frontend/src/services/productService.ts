import { api } from './api';
import type { Category, Product, ProductStatus } from '../types/product';
import type { SuggestionsBundle } from '../types/suggestion';
import type { OrderSimulationRequest, StockUpdateRequest } from '../types/api';

export const productService = {
  /**
   * Fetches all products, optionally filtered by status and category.
   */
  async getProducts(filters?: { status?: ProductStatus | 'ALL'; category?: Category | 'ALL' }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }
    if (filters?.category && filters.category !== 'ALL') {
      params.append('category', filters.category);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return api.get<Product[]>(endpoint);
  },

  /**
   * Fetches a single product by ID.
   */
  async getProductById(id: string): Promise<Product> {
    return api.get<Product>(`/products/${id}`);
  },

  /**
   * Simulates a sales order for a product, decrementing stock and triggering the agentic loop.
   */
  async simulateOrder(productId: string, quantity: number): Promise<Product> {
    const payload: OrderSimulationRequest = { quantity };
    return api.post<Product>(`/products/${productId}/orders`, payload);
  },

  /**
   * Adjusts stock level directly, firing an inventory signal event.
   */
  async updateStock(productId: string, stockLevel: number): Promise<Product> {
    const payload: StockUpdateRequest = { stockLevel };
    return api.patch<Product>(`/products/${productId}/stock`, payload);
  },

  /**
   * Fetches pending AI pricing and reorder suggestions for a specific product.
   */
  async getProductSuggestions(productId: string): Promise<SuggestionsBundle> {
    return api.get<SuggestionsBundle>(`/products/${productId}/suggestions`);
  },
};
