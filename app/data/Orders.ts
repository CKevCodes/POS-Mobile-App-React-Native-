import { getDb } from "./Database";
import type {
  DbOrder,
  DbOrderItem,
  OrderWithItems,
  CreateOrder,
  UpdateOrder,
  CreateOrderItem,
} from "../types/types";

// ─── Orders Repository ────────────────────────────────────────────────────────

export const ordersRepo = {
  // ── Orders ───────────────────────────────────────────────────────────────────

  async getAll(): Promise<DbOrder[]> {
    const db = await getDb();
    return db.getAllAsync<DbOrder>(
      "SELECT * FROM Orders ORDER BY created_at DESC;"
    );
  },

  async getById(id: number): Promise<DbOrder | null> {
    const db = await getDb();
    return db.getFirstAsync<DbOrder>(
      "SELECT * FROM Orders WHERE id = ?;",
      id
    );
  },

  async getByOrderNumber(orderNumber: string): Promise<DbOrder | null> {
    const db = await getDb();
    return db.getFirstAsync<DbOrder>(
      "SELECT * FROM Orders WHERE order_number = ?;",
      orderNumber
    );
  },

  /** Paginated list, newest first */
  async getPaginated(limit: number, offset: number): Promise<DbOrder[]> {
    const db = await getDb();
    return db.getAllAsync<DbOrder>(
      "SELECT * FROM Orders ORDER BY created_at DESC LIMIT ? OFFSET ?;",
      limit,
      offset
    );
  },

  async count(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<{ n: number }>(
      "SELECT COUNT(*) AS n FROM Orders;"
    );
    return row?.n ?? 0;
  },

  /**
   * Full order with enriched items (includes variant_name, product_name).
   */
  async getWithItems(id: number): Promise<OrderWithItems | null> {
    const db = await getDb();

    const order = await db.getFirstAsync<DbOrder>(
      "SELECT * FROM Orders WHERE id = ?;",
      id
    );
    if (!order) return null;

    const items = await db.getAllAsync<
      DbOrderItem & { variant_name: string; product_name: string }
    >(
      `SELECT
         oi.*,
         pv.variant_name,
         p.name AS product_name
       FROM OrderItems oi
       JOIN ProductVariants pv ON pv.id = oi.product_variant_id
       JOIN Products p         ON p.id  = pv.product_id
       WHERE oi.order_id = ?;`,
      id
    );

    return { ...order, items };
  },

  /** Create order + items in a single transaction. Returns the new order id. */
  async createWithItems(
    orderData: CreateOrder,
    items: Omit<CreateOrderItem, "order_id">[]
  ): Promise<number> {
    const db = await getDb();
    let orderId = 0;

    await db.withTransactionAsync(async () => {
      const orderResult = await db.runAsync(
        `INSERT INTO Orders
           (order_number, order_type, payment_status, payment_method, total_amount)
         VALUES (?, ?, ?, ?, ?);`,
        orderData.order_number,
        orderData.order_type,
        orderData.payment_status,
        orderData.payment_method,
        orderData.total_amount
      );
      orderId = orderResult.lastInsertRowId;

      for (const item of items) {
        await db.runAsync(
          `INSERT INTO OrderItems
             (order_id, product_variant_id, quantity, price,
              money_tendered, change, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          orderId,
          item.product_variant_id,
          item.quantity,
          item.price,
          item.money_tendered,
          item.change,
          item.subtotal
        );
      }
    });

    return orderId;
  },

  async update(id: number, data: UpdateOrder): Promise<void> {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.order_type !== undefined) { fields.push("order_type = ?"); values.push(data.order_type); }
    if (data.payment_status !== undefined) { fields.push("payment_status = ?"); values.push(data.payment_status); }
    if (data.payment_method !== undefined) { fields.push("payment_method = ?"); values.push(data.payment_method); }
    if (data.total_amount !== undefined) { fields.push("total_amount = ?"); values.push(data.total_amount); }

    if (fields.length === 0) return;
    values.push(id);

    await db.runAsync(
      `UPDATE Orders SET ${fields.join(", ")} WHERE id = ?;`,
      ...values
    );
  },

  async delete(id: number): Promise<void> {
    const db = await getDb();
    // Cascades to OrderItems via FK
    await db.runAsync("DELETE FROM Orders WHERE id = ?;", id);
  },

  // ── Filters ──────────────────────────────────────────────────────────────────

  async filterByDate(from: string, to: string): Promise<DbOrder[]> {
    const db = await getDb();
    return db.getAllAsync<DbOrder>(
      `SELECT * FROM Orders
       WHERE date(created_at) BETWEEN date(?) AND date(?)
       ORDER BY created_at DESC;`,
      from,
      to
    );
  },

  async filterByPaymentStatus(
    status: DbOrder["payment_status"]
  ): Promise<DbOrder[]> {
    const db = await getDb();
    return db.getAllAsync<DbOrder>(
      "SELECT * FROM Orders WHERE payment_status = ? ORDER BY created_at DESC;",
      status
    );
  },

  // ── Analytics helpers ─────────────────────────────────────────────────────────

  async totalRevenue(from?: string, to?: string): Promise<number> {
    const db = await getDb();
    let row: { total: number | null };

    if (from && to) {
      row = (await db.getFirstAsync<{ total: number | null }>(
        `SELECT SUM(total_amount) AS total FROM Orders
         WHERE payment_status = 'Paid'
           AND date(created_at) BETWEEN date(?) AND date(?);`,
        from,
        to
      ))!;
    } else {
      row = (await db.getFirstAsync<{ total: number | null }>(
        "SELECT SUM(total_amount) AS total FROM Orders WHERE payment_status = 'Paid';"
      ))!;
    }

    return row?.total ?? 0;
  },

  async topSellingVariants(
    limit = 5,
    from?: string,
    to?: string
  ): Promise<{ variant_name: string; product_name: string; total_qty: number }[]> {
    const db = await getDb();

    const dateFilter =
      from && to
        ? `AND date(o.created_at) BETWEEN date('${from}') AND date('${to}')`
        : "";

    return db.getAllAsync(
      `SELECT
         pv.variant_name,
         p.name AS product_name,
         SUM(oi.quantity) AS total_qty
       FROM OrderItems oi
       JOIN Orders o           ON o.id  = oi.order_id
       JOIN ProductVariants pv ON pv.id = oi.product_variant_id
       JOIN Products p         ON p.id  = pv.product_id
       WHERE o.payment_status = 'Paid'
       ${dateFilter}
       GROUP BY oi.product_variant_id
       ORDER BY total_qty DESC
       LIMIT ?;`,
      limit
    );
  },

  // ── Order Items ──────────────────────────────────────────────────────────────

  items: {
    async getByOrder(orderId: number): Promise<DbOrderItem[]> {
      const db = await getDb();
      return db.getAllAsync<DbOrderItem>(
        "SELECT * FROM OrderItems WHERE order_id = ?;",
        orderId
      );
    },

    async create(data: CreateOrderItem): Promise<DbOrderItem> {
      const db = await getDb();
      const result = await db.runAsync(
        `INSERT INTO OrderItems
           (order_id, product_variant_id, quantity, price,
            money_tendered, change, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        data.order_id,
        data.product_variant_id,
        data.quantity,
        data.price,
        data.money_tendered,
        data.change,
        data.subtotal
      );
      return (await db.getFirstAsync<DbOrderItem>(
        "SELECT * FROM OrderItems WHERE id = ?;",
        result.lastInsertRowId
      ))!;
    },

    async delete(id: number): Promise<void> {
      const db = await getDb();
      await db.runAsync("DELETE FROM OrderItems WHERE id = ?;", id);
    },
  },
};