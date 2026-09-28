import type { Category, ProductStatus } from './product';
import type { StrategyType } from './strategy';

export interface OrderSimulationRequest {
  quantity: number;
}

export interface StockUpdateRequest {
  stockLevel: number;
}

export interface SuggestionActionRequest {
  action: 'ACCEPT' | 'REJECT';
}

export interface StrategySwitchRequest {
  strategy: StrategyType;
}

export interface ApiErrorResponse {
  code?: string;
  message?: string;
  details?: Record<string, string>;
  timestamp?: string;
}

export interface ProductFiltersState {
  category: 'ALL' | Category;
  status: 'ALL' | ProductStatus;
  searchQuery: string;
}
