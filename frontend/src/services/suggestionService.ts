import { api } from './api';
import type { Product } from '../types/product';
import type { PendingProductItem, SuggestionsBundle } from '../types/suggestion';
import type { SuggestionActionRequest } from '../types/api';

export const suggestionService = {
  /**
   * Fetches all pending merchandising review items.
   * Gracefully reconciles both backend structures:
   * 1. Direct PendingProductItem[] if backend returns bundled items.
   * 2. Product[] from /merchandising/pending, then dynamically fetching /products/{id}/suggestions in parallel.
   */
  async getPendingSuggestions(): Promise<PendingProductItem[]> {
    const rawData = await api.get<unknown[]>('/merchandising/pending');

    if (!Array.isArray(rawData)) {
      return [];
    }

    if (rawData.length === 0) {
      return [];
    }

    // Check if the endpoint already returned bundled PendingProductItem objects
    const firstItem = rawData[0] as Record<string, unknown>;
    if (firstItem && 'product' in firstItem) {
      return rawData as PendingProductItem[];
    }

    // Otherwise, rawData is Product[]. Fetch suggestions for each pending product in parallel.
    const products = rawData as Product[];
    const settledResults = await Promise.allSettled(
      products.map(async (product): Promise<PendingProductItem> => {
        try {
          const bundle = await api.get<SuggestionsBundle>(`/products/${product.id}/suggestions`);
          
          // Find the latest pending pricing suggestion
          const pendingPricing = bundle.pricingSuggestions
            ?.filter((s) => s.status === 'PENDING')
            ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

          // Find the latest pending reorder suggestion
          const pendingReorder = bundle.reorderSuggestions
            ?.filter((s) => s.status === 'PENDING')
            ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

          return {
            product,
            pricingSuggestion: pendingPricing,
            reorderSuggestion: pendingReorder,
          };
        } catch {
          // If fetching specific suggestions fails, return the product with null suggestions
          return {
            product,
            pricingSuggestion: null,
            reorderSuggestion: null,
          };
        }
      })
    );

    return settledResults
      .filter((res): res is PromiseFulfilledResult<PendingProductItem> => res.status === 'fulfilled')
      .map((res) => res.value)
      .filter((item) => Boolean(item.pricingSuggestion || item.reorderSuggestion));
  },

  /**
   * Responds to a pricing suggestion (ACCEPT or REJECT).
   */
  async respondToPricing(id: number, action: 'ACCEPT' | 'REJECT'): Promise<void> {
    const payload: SuggestionActionRequest = { action };
    try {
      await api.patch<void>(`/merchandising/pricing-suggestions/${id}`, payload);
    } catch (err: unknown) {
      // Fallback endpoint if controller route is mapped at root /pricing-suggestions/{id}
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
        await api.patch<void>(`/pricing-suggestions/${id}`, payload);
      } else {
        throw err;
      }
    }
  },

  /**
   * Responds to a reorder suggestion (ACCEPT or REJECT).
   */
  async respondToReorder(id: number, action: 'ACCEPT' | 'REJECT'): Promise<void> {
    const payload: SuggestionActionRequest = { action };
    try {
      await api.patch<void>(`/merchandising/reorder-suggestions/${id}`, payload);
    } catch (err: unknown) {
      // Fallback endpoint if controller route is mapped at root /reorder-suggestions/{id}
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
        await api.patch<void>(`/reorder-suggestions/${id}`, payload);
      } else {
        throw err;
      }
    }
  },
};
