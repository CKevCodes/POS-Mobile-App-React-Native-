// ─── DB Entity Types ──────────────────────────────────────────────────────────

export interface DbCategory {
  id: number;
  name: string;
  created_at: string;
}

export interface DbProduct {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface DbProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  price: number;
  created_at: string;
}

export interface DbOrder {
  id: number;
  order_number: string;
  order_type: "dine-in" | "takeout" | "delivery";
  payment_status: "Paid" | "Unpaid" | "Refunded";
  payment_method: "Cash" | "Card" | "E-wallet";
  total_amount: number;
  created_at: string;
}

export interface DbOrderItem {
  id: number;
  order_id: number;
  product_variant_id: number;
  quantity: number;
  price: number;
  money_tendered: number;
  change: number;
  subtotal: number;
}

// ─── Insert / Update DTOs ─────────────────────────────────────────────────────

export type CreateCategory = Omit<DbCategory, "id" | "created_at">;
export type UpdateCategory = Partial<CreateCategory>;

export type CreateProduct = Omit<DbProduct, "id" | "created_at">;
export type UpdateProduct = Partial<CreateProduct>;

export type CreateProductVariant = Omit<DbProductVariant, "id" | "created_at">;
export type UpdateProductVariant = Partial<CreateProductVariant>;

export type CreateOrder = Omit<DbOrder, "id" | "created_at">;
export type UpdateOrder = Partial<CreateOrder>;

export type CreateOrderItem = Omit<DbOrderItem, "id">;
export type UpdateOrderItem = Partial<CreateOrderItem>;

// ─── Joined / Enriched Types ──────────────────────────────────────────────────

export interface ProductWithVariants extends DbProduct {
  variants: DbProductVariant[];
  category_name: string;
}

export interface OrderWithItems extends DbOrder {
  items: (DbOrderItem & {
    variant_name: string;
    product_name: string;
  })[];
}