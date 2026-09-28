import { useState, useEffect, useCallback, useRef } from 'react';
import type { PendingProductItem } from '../types/suggestion';
import { suggestionService } from '../services/suggestionService';

interface UsePendingSuggestionsOptions {
  pollingIntervalMs?: number;
  onPriceAccepted?: (productId: string, newPrice: number) => void;
  onReorderAccepted?: (productId: string, reorderQty: number) => void;
  onStatusReset?: (productId: string) => void;
}

export function usePendingSuggestions(options: UsePendingSuggestionsOptions = {}) {
  const {
    pollingIntervalMs = 3000,
    onPriceAccepted,
    onReorderAccepted,
    onStatusReset,
  } = options;

  const [pendingItems, setPendingItems] = useState<PendingProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const timerRef = useRef<number | null>(null);

  const fetchSuggestions = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setIsLoading((prev) => (pendingItems.length === 0 ? true : prev));
    }
    setIsSyncing(true);

    try {
      const data = await suggestionService.getPendingSuggestions();
      if (isMountedRef.current) {
        setPendingItems(data);
        setLastSyncedAt(new Date());
        setError(null);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        // Do not overwrite existing items if a background sync fails
        const message = err instanceof Error ? err.message : 'Failed to fetch suggestions';
        setError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsSyncing(false);
      }
    }
  }, [pendingItems.length]);

  // Polling loop with Page Visibility API awareness
  useEffect(() => {
    isMountedRef.current = true;

    // oxlint-disable-next-line react/set-state-in-effect -- initial async fetch on mount
    fetchSuggestions(false);

    const startPolling = () => {
      stopPolling();
      timerRef.current = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchSuggestions(true);
        }
      }, pollingIntervalMs);
    };

    const stopPolling = () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSuggestions(true);
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchSuggestions, pollingIntervalMs]);

  /**
   * Optimistically responds to a pricing suggestion and dispatches backend PATCH.
   */
  const respondPricing = useCallback(
    async (suggestionId: number, action: 'ACCEPT' | 'REJECT', productId: string, recommendedPrice: number) => {
      // Optimistically update local state
      setPendingItems((prev) => {
        return prev
          .map((item) => {
            if (item.product.id !== productId) return item;
            return {
              ...item,
              pricingSuggestion: null,
            };
          })
          .filter((item) => Boolean(item.pricingSuggestion || item.reorderSuggestion));
      });

      if (action === 'ACCEPT') {
        onPriceAccepted?.(productId, recommendedPrice);
        onStatusReset?.(productId);
      }

      try {
        await suggestionService.respondToPricing(suggestionId, action);
      } catch (err) {
        // Trigger refetch to synchronize if optimistic update failed
        fetchSuggestions(true);
        throw err;
      }
    },
    [fetchSuggestions, onPriceAccepted, onStatusReset]
  );

  /**
   * Optimistically responds to a reorder suggestion and dispatches backend PATCH.
   */
  const respondReorder = useCallback(
    async (suggestionId: number, action: 'ACCEPT' | 'REJECT', productId: string, quantity: number) => {
      // Optimistically update local state
      setPendingItems((prev) => {
        return prev
          .map((item) => {
            if (item.product.id !== productId) return item;
            return {
              ...item,
              reorderSuggestion: null,
            };
          })
          .filter((item) => Boolean(item.pricingSuggestion || item.reorderSuggestion));
      });

      if (action === 'ACCEPT') {
        onReorderAccepted?.(productId, quantity);
        onStatusReset?.(productId);
      }

      try {
        await suggestionService.respondToReorder(suggestionId, action);
      } catch (err) {
        fetchSuggestions(true);
        throw err;
      }
    },
    [fetchSuggestions, onReorderAccepted, onStatusReset]
  );

  return {
    pendingItems,
    isLoading,
    isSyncing,
    lastSyncedAt,
    error,
    refresh: () => fetchSuggestions(false),
    respondPricing,
    respondReorder,
  };
}
