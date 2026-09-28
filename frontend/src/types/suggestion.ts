import type { Product } from './product';

export type ChangeDirection = 'INCREASE' | 'DECREASE' | 'HOLD';
export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type TriggerReason = 'INITIAL' | 'INVENTORY_LOW' | 'DEMAND_SPIKE' | 'MANUAL';

export interface PricingSuggestion {
  id: number;
  productId?: string;
  currentPrice: number;
  recommendedPrice: number;
  changeDirection: ChangeDirection;
  confidence: number;              // 0.0 - 1.0
  reasoning: string;
  status: SuggestionStatus;
  triggerReason: TriggerReason;
  createdAt: string;
  actionedAt?: string | null;
}

export interface ReorderSuggestion {
  id: number;
  productId?: string;
  currentStock: number;
  recommendedQuantity: number;
  suggestedLeadTimeDays: number;
  confidence: number;              // 0.0 - 1.0
  reasoning: string;
  status: SuggestionStatus;
  triggerReason: TriggerReason;
  createdAt: string;
  actionedAt?: string | null;
}

export interface SuggestionsBundle {
  pricingSuggestions: PricingSuggestion[];
  reorderSuggestions: ReorderSuggestion[];
}

export interface PendingProductItem {
  product: Product;
  pricingSuggestion?: PricingSuggestion | null;
  reorderSuggestion?: ReorderSuggestion | null;
}
