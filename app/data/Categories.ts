import { getDb } from "./Database";
import type { DbCategory, CreateCategory, UpdateCategory } from "../types/types";

// ─── Categories Repository ────────────────────────────────────────────────────

export const categoriesRepo = {
  async getAll(): Promise<DbCategory[]> {
    const db = await getDb();
    return db.getAllAsync<DbCategory>(
      "SELECT * FROM Categories ORDER BY name ASC;"
    );
  },

  async getById(id: number): Promise<DbCategory | null> {
    const db = await getDb();
    return db.getFirstAsync<DbCategory>(
      "SELECT * FROM Categories WHERE id = ?;",
      id
    );
  },

  async create(data: CreateCategory): Promise<DbCategory> {
    const db = await getDb();
    const result = await db.runAsync(
      "INSERT INTO Categories (name) VALUES (?);",
      data.name
    );
    return (await db.getFirstAsync<DbCategory>(
      "SELECT * FROM Categories WHERE id = ?;",
      result.lastInsertRowId
    ))!;
  },

  async update(id: number, data: UpdateCategory): Promise<void> {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }

    if (fields.length === 0) return;
    values.push(id);

    await db.runAsync(
      `UPDATE Categories SET ${fields.join(", ")} WHERE id = ?;`,
      ...values
    );
  },

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM Categories WHERE id = ?;", id);
  },
};