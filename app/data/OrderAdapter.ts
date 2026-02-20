/**
 * db/adapters/orderAdapter.ts
 *
 * Converts between the flat DB rows (DbOrder / DbOrderItem) and the richer
 * UI `Order` / `OrderItem` shapes used by OrderRow, OrderDetailModal, etc.
 *
 * This keeps every existing modal/component untouched — only
 * OrderHistoryScreen needs to be aware of the DB layer.
 */

import type { DbOrder, DbOrderItem, StatusLogEntry } from "../types/types";
import type { Order, OrderItem, StatusLog } from "../components/OrderRow";

// ─── DB → UI ─────────────────────────────────────────────────────────────────

export function dbOrderToUi(
  dbOrder: DbOrder,
  dbItems: DbOrderItem[]
): Order {
  const statusLog: StatusLogEntry[] = JSON.parse(dbOrder.status_log || "[]");

  const uiStatusLog: StatusLog[] = statusLog.map((entry) => ({
    from: entry.from as Order["orderStatus"] | null,
    to: entry.to as Order["orderStatus"],
    at: entry.at,
  }));

  const items: OrderItem[] = dbItems.map((i) => ({
    id: String(i.id),
    name: i.item_name,
    quantity: i.quantity,
    unitPrice: i.price,
    modifiers: JSON.parse(i.modifiers || "[]"),
  }));

  return {
    // Use the numeric DB id as a string for the UI's `id` field
    id: `ORD-${String(dbOrder.id).padStart(4, "0")}`,
    receiptNumber: dbOrder.receipt_number,
    tableNumber: dbOrder.table_number ?? undefined,
    orderType: dbOrder.order_type as Order["orderType"],
    items,
    subtotal: dbOrder.subtotal,
    tax: dbOrder.tax,
    discount: dbOrder.discount,
    serviceCharge: dbOrder.service_charge,
    total: dbOrder.total_amount,
    paymentMethod: dbOrder.payment_method as Order["paymentMethod"],
    paymentStatus: dbOrder.payment_status as Order["paymentStatus"],
    orderStatus: dbOrder.order_status as Order["orderStatus"],
    createdAt: dbOrder.created_at,
    completedAt: dbOrder.completed_at ?? undefined,
    cashTendered: dbOrder.cash_tendered ?? undefined,
    statusLog: uiStatusLog,
    // stash the numeric id so we can pass it back to the repo
    _dbId: dbOrder.id,
  } as Order & { _dbId: number };
}

// ─── UI → DB (for updates) ───────────────────────────────────────────────────

export function uiItemsToDb(
  orderId: number,
  items: OrderItem[]
): Omit<import("../types/types").CreateOrderItem, "order_id">[] {
  return items.map((i) => ({
    order_id: orderId,
    product_variant_id: 0, // unknown when editing free-text items from UI
    item_name: i.name,
    quantity: i.quantity,
    price: i.unitPrice,
    modifiers: JSON.stringify(i.modifiers),
    money_tendered: 0,
    change: 0,
    subtotal: i.quantity * i.unitPrice,
  }));
}