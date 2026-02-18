// ─── Inventory Type Definitions ──────────────────────────────────────────────

export type MovementType = "SALE" | "STOCK_IN" | "ADJUSTMENT" | "WASTAGE";

export interface Variant {
  id: string;
  name: string;
  additionalPrice: number;
  quantityOnHand: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  quantityOnHand: number;
  lowStockThreshold: number;
  variants?: Variant[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  variantId?: string;
  type: MovementType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  createdAt: string;
  notes?: string;
}

export interface InventoryMetrics {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  SALE: "Sale",
  STOCK_IN: "Stock In",
  ADJUSTMENT: "Adjustment",
  WASTAGE: "Wastage",
};

export const MOVEMENT_TYPE_COLOR: Record<
  MovementType,
  { bg: string; text: string }
> = {
  SALE: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-300",
  },
  STOCK_IN: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-800 dark:text-green-300",
  },
  ADJUSTMENT: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-800 dark:text-blue-300",
  },
  WASTAGE: {
    bg: "bg-orange-100 dark:bg-orange-900/40",
    text: "text-orange-800 dark:text-orange-300",
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const formatCurrency = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const isLowStock = (product: Product): boolean => {
  return (
    product.quantityOnHand > 0 &&
    product.quantityOnHand <= product.lowStockThreshold
  );
};

export const isOutOfStock = (product: Product): boolean => {
  return product.quantityOnHand === 0;
};

export const calculateInventoryValue = (products: Product[]): number => {
  return products.reduce((acc, p) => {
    if (p.isArchived) return acc;
    return acc + p.costPrice * p.quantityOnHand;
  }, 0);
};

export const getInventoryMetrics = (products: Product[]): InventoryMetrics => {
  const activeProducts = products.filter((p) => !p.isArchived);

  return {
    totalProducts: activeProducts.length,
    totalValue: calculateInventoryValue(activeProducts),
    lowStockItems: activeProducts.filter(isLowStock).length,
    outOfStockItems: activeProducts.filter(isOutOfStock).length,
  };
};