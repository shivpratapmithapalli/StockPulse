export type Category = 'ELECTRONICS' | 'APPAREL' | 'HOME';
export type ProductStatus = 'ACTIVE' | 'PRICE_REVIEW_PENDING' | 'OUT_OF_STOCK';

export interface Product {
  id: string;                      // e.g. "PRD-003"
  sku: string;                     // e.g. "SKU-APP-001"
  name: string;                    // e.g. "Organic Cotton T-Shirt"
  category: Category;
  currentPrice: number;            // e.g. 24.99
  stockLevel: number;              // e.g. 8
  reorderThreshold: number;        // e.g. 15
  demandVelocity: number;          // e.g. 12
  status: ProductStatus;
  costPrice?: number | null;       // Sprint 2 placeholder
  marginFloor?: number | null;     // Sprint 2 placeholder
  supplierId?: string | null;      // Sprint 2 placeholder
  createdAt?: string;
  updatedAt?: string;
}
