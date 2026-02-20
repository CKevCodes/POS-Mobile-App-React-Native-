// ─── Inventory Type Definitions ──────────────────────────────────────────────

export interface Variant {
  id: string;
  name: string;
  additionalPrice: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
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