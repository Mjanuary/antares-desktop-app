import { Database } from "sqlite3";
import { Todo } from "../types/Todo";
import { DeviceConnection } from "../types/auth.types";
import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { runMigrations } from "./database/migrations";
import { appTableList, SettingsSeeds, SyncStatus } from "./constants";
import { runSeeds } from "./database/seeds";
import { UpsertManyOptions } from "../types/sync.types";

type DbRole = "initializer" | "consumer" | "worker";

const allowedTables = new Set(appTableList);

let electronApp: typeof import("electron").app | null = null;

try {
  // This works ONLY in Electron main
  // Will fail silently in workers (Node-only)
  electronApp = require("electron").app;
} catch {
  electronApp = null;
}

export class AppDatabase {
  private db!: Database;
  public readonly dbPath: string;

  // 🔒 LIFECYCLE & CONCURRENCY CONTROLS
  private initPromise: Promise<void> | null = null;
  private queue: Promise<void> = Promise.resolve();

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.ensureDir();

    // DB is opened immediately, but NO commands are run until init()
    this.db = new Database(dbPath);
  }

  /* -----------------------------
     LIFECYCLE MANAGEMENT
  ------------------------------ */

  /**
   * Initializes the database.
   * - Sets WAL mode
   * - Sets busy_timeout
   * - Runs migrations
   * - Prevents race conditions by returning a singleton promise
   */
  public async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("PRAGMA journal_mode = WAL");
        this.db.run("PRAGMA busy_timeout = 5000"); // 5s timeout for busy
      });

      // Run migrations strictly after PRAGMA
      runMigrations(this.db)
        .then(() => {
          console.log("[AppDatabase] Initialized & Migrated");

          runSeeds(this.db)
            .then(() => {
              resolve();
            })
            .catch((err) => {
              console.error("[AppDatabase] Fatal Init Error:", err);
              reject(err);
            });
        })
        .catch((err) => {
          console.error("[AppDatabase] Fatal Init Error:", err);
          reject(err);
        });

      //
    });

    return this.initPromise;
  }

  /**
   * SERIALIZATION BARRIER
   * Wraps ALL database operations to ensure:
   * 1. Init is complete
   * 2. Operations run sequentially (mutually exclusive)
   */
  private async perform<T>(action: () => Promise<T>): Promise<T> {
    if (!this.initPromise) {
      throw new Error(
        "❌ Database NOT initialized. Call await db.init() first.",
      );
    }

    // Wait for init to complete (or fail)
    await this.initPromise;

    // Chain to the queue (mutex pattern)
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          const result = await action();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /* -----------------------------
     PATH RESOLUTION
  ------------------------------ */
  private ensureDir() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /* -----------------------------
     CORE METHODS (Wrapped)
  ------------------------------ */

  async getActiveDeviceContext(): Promise<{
    deviceId: string | null;
    branchId: string | null;
    baseUrl: string | null;
  } | null> {
    return this.perform(async () => {
      // 1. Fetch Device Connection Info
      const connection = await new Promise<any>((resolve, reject) => {
        const sql = `SELECT connection_id AS deviceId, branch_id AS branchId FROM app_connect LIMIT 1;`;
        this.db.get(sql, [], (err, row) => {
          if (err) return reject(err);
          resolve(row); // If no row, this resolves as undefined/null
        });
      });

      // 2. Fetch Base URL Setting (Runs even if connection is null)
      const setting = await new Promise<any>((resolve, reject) => {
        const sql = `SELECT value FROM settings WHERE key = ? LIMIT 1;`;
        this.db.get(sql, [SettingsSeeds.BASE_URL.key], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });

      // 3. Return combined results with null fallbacks
      return {
        deviceId: connection?.deviceId ?? null,
        branchId: connection?.branchId ?? null,
        baseUrl: setting?.value ?? null,
      };
    });
  }

  /* =====================================================
     =============== SYNC – PUSH HELPERS =================
     ===================================================== */

  async countUnsyncedRows(table: string): Promise<number> {
    if (!allowedTables.has(table))
      throw new Error("Invalid table name: " + table);

    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(*) AS c FROM ${table} WHERE sync_status != '${SyncStatus.Synced}'`;
        this.db.get(sql, [], (err, row: { c: number } | undefined) => {
          if (err) reject(err);
          else resolve(row?.c ?? 0);
        });
      });
    });
  }

  async getUnsyncedRows(
    table: string,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    if (!allowedTables.has(table))
      throw new Error("Invalid table name: " + table);

    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `
          SELECT * FROM ${table}
          WHERE sync_status != '${SyncStatus.Synced}'
          LIMIT ? OFFSET ?
        `;
        this.db.all(sql, [limit, offset], (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        });
      });
    });
  }

  async markTableAsSynced(table: string): Promise<number> {
    if (!allowedTables.has(table))
      throw new Error("Invalid table name: " + table);

    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `
          UPDATE ${table}
          SET sync_status = '${SyncStatus.Synced}'
          WHERE sync_status != '${SyncStatus.Synced}'
        `;
        this.db.run(sql, function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    });
  }

  async markRowsAsSynced(table: string, ids: string[]): Promise<number> {
    if (!allowedTables.has(table))
      throw new Error("Invalid table name: " + table);
    if (!ids.length) return 0;

    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const placeholders = ids.map(() => "?").join(", ");
        const sql = `
          UPDATE ${table}
          SET sync_status = '${SyncStatus.Synced}'
          WHERE id IN (${placeholders})
            AND sync_status != '${SyncStatus.Synced}'
        `;
        this.db.run(sql, ids, function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    });
  }

  async getLastSync(
    table: string,
  ): Promise<{ last_sync: string; next_id: string } | null> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT last_sync, next_id FROM updated_at_sync WHERE table_name = ?`;
        this.db.get(
          sql,
          [table],
          (err, row: { last_sync: string; next_id: string } | undefined) => {
            if (err) reject(err);
            else resolve(row ?? null);
          },
        );
      });
    });
  }

  /* =====================================================
     =============== UPSERT (PUSH & PULL) =================
     ===================================================== */

  async upsertMany(opts: UpsertManyOptions): Promise<number> {
    const { table, rows, last_sync, next_id } = opts;

    if (!allowedTables.has(table))
      throw new Error("Invalid table name: " + table);
    if (!rows.length) return 0;

    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const keys = Object.keys(rows[0]);
        if (!keys.length) return resolve(0);

        const columns = keys.join(", ");
        const placeholders = keys.map(() => "?").join(", ");

        const sql = `
          INSERT OR REPLACE INTO ${table} (${columns})
          VALUES (${placeholders})
        `;

        let totalChanges = 0;

        this.db.serialize(() => {
          this.db.run("BEGIN TRANSACTION");
          const stmt = this.db.prepare(sql);

          for (const row of rows) {
            const values = keys.map((k) => row[k]);
            stmt.run(values, function (err) {
              if (err) {
                // We'll catch this in finalize
                // or just log it, but transaction will rollback on error below?
                // Actually stmt errors don't auto-rollback.
              } else {
                totalChanges += this.changes;
              }
            });
          }

          stmt.finalize((err) => {
            if (err) {
              this.db.run("ROLLBACK");
              reject(err);
              return;
            }

            const commit = () => {
              this.db.run("COMMIT", (err) => {
                if (err) reject(err);
                else resolve(totalChanges);
              });
            };

            if (last_sync) {
              const db = this.db;
              // Check if a record exists for this table
              db.get(
                "SELECT id FROM updated_at_sync WHERE table_name = ?",
                [table],
                (err, row: any) => {
                  if (err) {
                    db.run("ROLLBACK");
                    reject(err);
                    return;
                  }

                  if (row) {
                    // Update existing record
                    db.run(
                      "UPDATE updated_at_sync SET last_sync = ?, next_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                      [last_sync, next_id, row.id],
                      (err) => {
                        if (err) {
                          db.run("ROLLBACK");
                          reject(err);
                        } else {
                          commit();
                        }
                      },
                    );
                  } else {
                    // Insert new record
                    db.run(
                      "INSERT INTO updated_at_sync (table_name, last_sync, next_id) VALUES (?, ?, ?)",
                      [table, last_sync, next_id],
                      (err) => {
                        if (err) {
                          db.run("ROLLBACK");
                          reject(err);
                        } else {
                          commit();
                        }
                      },
                    );
                  }
                },
              );
            } else {
              commit();
            }
          });
        });
      });
    });
  }

  async upsert(table: string, row: Record<string, any>): Promise<number> {
    if (!allowedTables.has(table))
      throw new Error("Invalid table name: " + table);

    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const keys = Object.keys(row);
        if (keys.length === 0) return resolve(0);

        const columns = keys.join(", ");
        const placeholders = keys.map(() => "?").join(", ");
        const values = keys.map((k) => row[k]);

        const sql = `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`;

        this.db.run(sql, values, function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    });
  }

  /* =====================================================
     ================= RETRY QUEUE =======================
     ===================================================== */

  async addRetry(
    table: string,
    payload: any,
    error: string,
    type: SyncStatus,
  ): Promise<number> {
    if (!allowedTables.has(table))
      throw new Error("Invalid table name: " + table);

    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO sync_retry_queue (table_name, payload, last_error, operation_type)
          VALUES (?, ?, ?, ?)
        `;
        this.db.run(
          sql,
          [table, JSON.stringify(payload), error, type],
          function (err) {
            if (err) reject(err);
            else resolve(this.changes);
          },
        );
      });
    });
  }

  async getRetries(table: string, limit = 5): Promise<any[]> {
    if (!allowedTables.has(table))
      throw new Error("Invalid table name: " + table);

    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `
          SELECT * FROM sync_retry_queue
          WHERE table_name = ?
          ORDER BY created_at ASC
          LIMIT ?
        `;
        this.db.all(sql, [table, limit], (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        });
      });
    });
  }

  async removeRetry(id: number): Promise<number> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `DELETE FROM sync_retry_queue WHERE id = ?`;
        this.db.run(sql, [id], function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    });
  }

  async incrementRetry(id: number): Promise<number> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `
          UPDATE sync_retry_queue
          SET retry_count = retry_count + 1
          WHERE id = ?
        `;
        this.db.run(sql, [id], function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    });
  }

  /* =====================================================
     =============== IMAGE SYNC ==========================
     ===================================================== */

  async getProductsForImageSync(): Promise<
    { productId: string; url: string; existingFilename: string | null }[]
  > {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `
          SELECT product_id as productId, cover_image_url as url, local_image_filename as existingFilename
          FROM products
          WHERE cover_image_url IS NOT NULL AND cover_image_url != ''
        `;
        this.db.all(sql, [], (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        });
      });
    });
  }

  async updateProductLocalImage(
    productId: string,
    filename: string,
  ): Promise<void> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `UPDATE products SET local_image_filename = ? WHERE product_id = ?`;
        this.db.run(sql, [filename, productId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  /* =====================================================
     =============== EXISTING METHODS ====================
     ===================================================== */

  async createDeviceConnection(
    connection: Omit<DeviceConnection, "created_time" | "updated_time">,
  ): Promise<DeviceConnection> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        this.db.run(
          `INSERT INTO app_connect (
          id, user_id, device_name, app_type, device_info, user_info, user_name, email,
          verification_code, approval_code, device_connected, connection_date, connection_id,
          blocked, blocked_time, branch_id, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            connection.id,
            connection.user_id,
            connection.device_name,
            connection.app_type,
            JSON.stringify(connection.device_info ?? []),
            JSON.stringify(connection.user_info),
            connection.user_name,
            connection.email,
            connection.verification_code,
            connection.approval_code,
            connection.device_connected ? 1 : 0,
            connection.connection_date ?? null,
            connection.connection_id,
            connection.blocked ? 1 : 0,
            connection.blocked_time ?? null,
            connection.branch_id ?? null,
            connection.created_by ?? null,
          ],
          function (err) {
            if (err) reject(err);
            else {
              resolve({
                ...connection,
                created_time: new Date().toISOString(),
                updated_time: new Date().toISOString(),
              });
            }
          },
        );
      });
    });
  }

  async getLatestDeviceConnection(): Promise<DeviceConnection | null> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        this.db.get(
          "SELECT * FROM app_connect ORDER BY created_time DESC LIMIT 1",
          (err, row: any) => {
            if (err) reject(err);
            else if (!row) resolve(null);
            else {
              const connection: DeviceConnection = {
                id: row.id,
                user_id: row.user_id,
                device_name: row.device_name,
                app_type: row.app_type,
                device_info: JSON.parse(row.device_info ?? "[]"),
                user_info: JSON.parse(row.user_info ?? "{}"),
                user_name: row.user_name,
                email: row.email,
                verification_code: row.verification_code,
                approval_code: row.approval_code,
                device_connected: Boolean(row.device_connected),
                connection_date: row.connection_date ?? null,
                connection_id: row.connection_id,
                blocked: Boolean(row.blocked),
                blocked_time: row.blocked_time ?? null,
                branch_id: row.branch_id,
                created_by: row.created_by,
                created_time: row.created_time,
                updated_time: row.updated_time ?? null,
              };
              resolve(connection);
            }
          },
        );
      });
    });
  }

  async deleteAllDeviceConnections(): Promise<void> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        this.db.run("DELETE FROM app_connect", (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // ********************************************
  // CLIENTS
  // ********************************************

  async createClient(client: any): Promise<any> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO clients (
            id, names, phone_number, gender, address, email,
            other_phone_numbers, recorded_by, recorded_branch,
            app_connection, sync_status, row_deleted
          ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 'PENDING', NULL)
        `;

        this.db.run(
          sql,
          [
            client.id,
            client.names,
            client.phone_number,
            client.gender,
            client.address,
            client.email,
            client.recorded_by,
            client.recorded_branch,
            client.app_connection,
          ],
          function (err) {
            if (err) reject(err);
            else resolve(client);
          },
        );
      });
    });
  }

  async getClients(
    page: number = 1,
    pageSize: number = 40,
    search: string = "",
    filters: {
      dateFrom?: string;
      dateTo?: string;
      sortBy?: string; // e.g. "names ASC"
    } = {},
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const offset = (page - 1) * pageSize;
        const validSorts = [
          "names ASC",
          "names DESC",
          "created_date DESC",
          "created_date ASC",
        ];
        const sortBy = validSorts.includes(filters.sortBy || "")
          ? filters.sortBy
          : "created_date DESC";

        let whereClause = "WHERE row_deleted IS NULL";
        const params: any[] = [];

        if (search) {
          whereClause += " AND (names LIKE ? OR phone_number LIKE ?)";
          params.push(`%${search}%`, `%${search}%`);
        }

        if (filters.dateFrom) {
          whereClause += " AND created_date >= ?";
          params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
          whereClause += " AND created_date <= ?";
          params.push(filters.dateTo);
        }

        // Count Query
        const countSql = `SELECT COUNT(*) as total FROM clients ${whereClause}`;

        // Data Query
        const dataSql = `
          SELECT * FROM clients 
          ${whereClause} 
          ORDER BY ${sortBy} 
          LIMIT ? OFFSET ?
        `;

        this.db.get(countSql, params, (err, countRow: any) => {
          if (err) return reject(err);
          const total = countRow?.total || 0;

          this.db.all(dataSql, [...params, pageSize, offset], (err, rows) => {
            if (err) return reject(err);
            resolve({
              data: rows ?? [],
              total,
              page,
              pageSize,
            });
          });
        });
      });
    });
  }

  // ********************************************

  async createTodo(
    todo: Omit<Todo, "id" | "createdAt" | "updatedAt">,
  ): Promise<Todo> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        this.db.run(
          "INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)",
          [todo.title, todo.description, todo.completed ? 1 : 0],
          function (err) {
            if (err) reject(err);
            else
              resolve({
                id: this.lastID,
                ...todo,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
          },
        );
      });
    });
  }

  async getTodos(): Promise<Todo[]> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        this.db.all(
          "SELECT * FROM todos ORDER BY createdAt DESC",
          (err, rows) => {
            if (err) reject(err);
            else {
              const todos = rows.map((row: any) => ({
                ...row,
                completed: Boolean(row.completed),
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
              }));
              resolve(todos as Todo[]);
            }
          },
        );
      });
    });
  }

  async updateTodo(id: number, todo: Partial<Todo>): Promise<void> {
    return this.perform(async () => {
      const updates: string[] = [];
      const values: any[] = [];

      if (todo.title !== undefined) {
        updates.push("title = ?");
        values.push(todo.title);
      }
      if (todo.description !== undefined) {
        updates.push("description = ?");
        values.push(todo.description);
      }
      if (todo.completed !== undefined) {
        updates.push("completed = ?");
        values.push(todo.completed ? 1 : 0);
      }

      updates.push("updatedAt = CURRENT_TIMESTAMP");
      values.push(id);

      return new Promise((resolve, reject) => {
        this.db.run(
          `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`,
          values,
          (err) => {
            if (err) reject(err);
            else resolve();
          },
        );
      });
    });
  }

  async deleteTodo(id: number): Promise<void> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        this.db.run("DELETE FROM todos WHERE id = ?", [id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }
}
