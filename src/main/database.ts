import { Database } from "sqlite3";

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

  async getHouses(
    page: number = 1,
    pageSize: number = 40,
    search: string = "",
    filters: {
      sortBy?: string; // e.g. "name ASC"
    } = {},
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const offset = (page - 1) * pageSize;
        const validSorts = [
          "name ASC",
          "name DESC",
          "created_date DESC",
          "created_date ASC",
        ];
        const sortBy = validSorts.includes(filters.sortBy || "")
          ? filters.sortBy
          : "created_date DESC";

        let whereClause = "WHERE row_deleted IS NULL";
        const params: any[] = [];

        if (search) {
          whereClause +=
            " AND (name LIKE ? OR address LIKE ? OR country LIKE ?)";
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Count Query
        const countSql = `SELECT COUNT(*) as total FROM houses ${whereClause}`;

        // Data Query
        const dataSql = `
        SELECT * FROM houses 
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
  // SALES
  // ********************************************

  async getSales(
    page: number = 1,
    pageSize: number = 40,
    search: string = "",
    filters: {
      dateFrom?: string;
      dateTo?: string;
      payment_currency?: string;
      client_id?: string;
      house_id?: string;
      price_total?: { op: string; value: number };
      price_total_bc?: { op: string; value: number };
      total_payed_cash?: { op: string; value: number };
      total_payed_cash_bc?: { op: string; value: number };
      balance?: { op: string; value: number };
      balance_bc?: { op: string; value: number };
      total_products?: { op: string; value: number };
      payed_USD?: { op: string; value: number };
      payed_CDF?: { op: string; value: number };
      payed_RWF?: { op: string; value: number };
      sortBy?: string;
    } = {},
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const offset = (page - 1) * pageSize;
        const validSorts = [
          "s.transaction_date DESC",
          "s.transaction_date ASC",
          "s.price_total DESC",
          "s.price_total ASC",
          "s.client_name ASC",
          "s.client_name DESC",
        ];
        const sortBy = validSorts.includes(filters.sortBy || "")
          ? filters.sortBy
          : "s.transaction_date DESC";

        let whereClause = "WHERE s.row_deleted IS NULL";
        const params: any[] = [];

        // Search
        if (search) {
          whereClause += ` AND (
              s.client_name LIKE ? OR 
              s.client_phone LIKE ? OR 
              h.name LIKE ? OR 
              s.receipt_id LIKE ?
            )`;
          const term = `%${search}%`;
          params.push(term, term, term, term);
        }

        // Date Filters
        if (filters.dateFrom) {
          whereClause += " AND date(s.transaction_date) >= date(?)";
          params.push(filters.dateFrom);
        }
        if (filters.dateTo) {
          whereClause += " AND date(s.transaction_date) <= date(?)";
          params.push(filters.dateTo);
        }

        // Exact Match Filters
        if (filters.payment_currency) {
          whereClause += " AND s.payment_currency = ?";
          params.push(filters.payment_currency);
        }
        if (filters.client_id) {
          whereClause += " AND s.client_id = ?";
          params.push(filters.client_id);
        }
        if (filters.house_id) {
          whereClause += " AND s.house_id = ?";
          params.push(filters.house_id);
        }

        // Comparison Filters
        const addComparison = (
          field: string,
          filter?: { op: string; value: number },
        ) => {
          if (filter && filter.op && filter.value !== undefined) {
            const op = ["=", ">=", "<=", ">", "<"].includes(filter.op)
              ? filter.op
              : "=";
            whereClause += ` AND ${field} ${op} ?`;
            params.push(filter.value);
          }
        };

        addComparison("s.price_total", filters.price_total);
        addComparison("s.price_total_bc", filters.price_total_bc);
        addComparison("s.total_payed_cash", filters.total_payed_cash);
        addComparison("s.total_payed_cash_bc", filters.total_payed_cash_bc);
        addComparison("s.balance", filters.balance);
        addComparison("s.balance_bc", filters.balance_bc);
        addComparison("s.total_products", filters.total_products);
        addComparison("s.payed_USD", filters.payed_USD);
        addComparison("s.payed_CDF", filters.payed_CDF);
        addComparison("s.payed_RWF", filters.payed_RWF);

        // Count Query
        const countSql = `
          SELECT COUNT(*) as total 
          FROM sales s 
          LEFT JOIN houses h ON s.house_id = h.id
          ${whereClause}
        `;

        // Data Query
        const dataSql = `
          SELECT s.*, h.name as house_name
          FROM sales s
          LEFT JOIN houses h ON s.house_id = h.id
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
  // PRODUCTS
  // ********************************************

  async getProducts(
    page: number = 1,
    pageSize: number = 40,
    search: string = "",
    filters: {
      category_id?: string;
      is_printable?: boolean;
      custom_divers?: boolean;
      price_CDF?: { op: string; value: number };
      price_USD?: { op: string; value: number };
      price_RWF?: { op: string; value: number };
      stock_quantity?: { op: string; value: number };
      colors?: string;
      sortBy?: string;
    } = {},
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const offset = (page - 1) * pageSize;
        const validSorts = [
          "p.name ASC",
          "p.name DESC",
          "p.created_time DESC",
          "p.created_time ASC",
          "p.price_USD ASC",
          "p.price_USD DESC",
          "p.stock_quantity ASC",
          "p.stock_quantity DESC",
        ];
        const sortBy = validSorts.includes(filters.sortBy || "")
          ? filters.sortBy
          : "p.created_time DESC";

        let whereClause = "WHERE p.product_row_deleted IS NULL";
        const params: any[] = [];

        // Search
        if (search) {
          whereClause += ` AND (
            p.name LIKE ? OR 
            p.code LIKE ? OR 
            p.qr_code LIKE ? OR 
            p.bar_code LIKE ? OR
            p.colors LIKE ?
          )`;
          const term = `%${search}%`;
          params.push(term, term, term, term, term);
        }

        // Filters
        if (filters.category_id) {
          whereClause += " AND p.diver_category_id = ?";
          params.push(filters.category_id);
        }

        if (filters.is_printable !== undefined) {
          whereClause += " AND p.is_printable = ?";
          params.push(filters.is_printable ? 1 : 0);
        }

        if (filters.custom_divers !== undefined) {
          whereClause += " AND p.custom_diver = ?";
          params.push(filters.custom_divers ? 1 : 0);
        }

        if (filters.colors) {
          whereClause += " AND p.colors LIKE ?";
          params.push(`%${filters.colors}%`);
        }

        // Comparison Filters
        const addComparison = (
          field: string,
          filter?: { op: string; value: number },
        ) => {
          if (filter && filter.op && filter.value !== undefined) {
            const op = ["=", ">=", "<=", ">", "<"].includes(filter.op)
              ? filter.op
              : "=";
            whereClause += ` AND ${field} ${op} ?`;
            params.push(filter.value);
          }
        };

        addComparison("p.stock_quantity", filters.stock_quantity);
        addComparison("p.price_USD", filters.price_USD);
        addComparison("p.price_CDF", filters.price_CDF);
        addComparison("p.price_RWF", filters.price_RWF);

        // Count Query
        const countSql = `
          SELECT COUNT(*) as total 
          FROM products p 
          LEFT JOIN categories c ON p.diver_category_id = c.id
          ${whereClause}
        `;

        // Data Query
        const dataSql = `
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.diver_category_id = c.id
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

  async getCategories(): Promise<any[]> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        this.db.all(
          "SELECT * FROM categories WHERE active = 1 ORDER BY name ASC",
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows ?? []);
          },
        );
      });
    });
  }

  async getSpendingCategories(): Promise<any[]> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        this.db.all(
          "SELECT * FROM spending_categories WHERE status = 1 ORDER BY name ASC",
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows ?? []);
          },
        );
      });
    });
  }

  // ********************************************
  // BALANCES
  // ********************************************

  async getBalances(
    page: number = 1,
    pageSize: number = 40,
    search: string = "",
    filters: {
      dateFrom?: string;
      dateTo?: string;
      balance_status?: string;
      amount?: { op: string; value: number };
      amount_bc?: { op: string; value: number };
      total_payed?: { op: string; value: number };
      total_payed_bc?: { op: string; value: number };
      sortBy?: string;
    } = {},
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const offset = (page - 1) * pageSize;
        const validSorts = [
          "recorded_date DESC",
          "recorded_date ASC",
          "pay_date DESC",
          "pay_date ASC",
          "amount DESC",
          "amount ASC",
          "client_name ASC",
          "client_name DESC",
        ];

        let sortBy = filters.sortBy || "recorded_date DESC";
        // Remove table aliases if present (e.g. 'b.recorded_date' -> 'recorded_date')
        if (sortBy.includes(".")) {
          sortBy = sortBy.split(".").pop()!;
          // Re-append DESC/ASC if it was part of the split, handling simple case
          const parts = filters.sortBy?.split(" ") || [];
          if (parts.length > 1) {
            const dir = parts[1];
            const col = parts[0].split(".").pop();
            sortBy = `${col} ${dir}`;
          }
        }

        // Just enforce valid list strict matching after cleanup
        if (!validSorts.includes(sortBy)) {
          // Fallback if strict match fails (try to match roughly or just default)
          // Let's just default to safe value
          sortBy = "recorded_date DESC";
        }

        const cteParams: any[] = [];
        let cteWhere = "WHERE 1=1";

        if (search) {
          cteWhere += ` AND (
            client_name LIKE ? OR 
            house_name LIKE ? OR 
            recorder_name LIKE ?
          )`;
          const term = `%${search}%`;
          cteParams.push(term, term, term);
        }

        if (filters.dateFrom) {
          cteWhere += " AND date(pay_date) >= date(?)";
          cteParams.push(filters.dateFrom);
        }
        if (filters.dateTo) {
          cteWhere += " AND date(pay_date) <= date(?)";
          cteParams.push(filters.dateTo);
        }

        if (filters.balance_status && filters.balance_status !== "ALL") {
          cteWhere += " AND balance_status = ?";
          cteParams.push(filters.balance_status);
        }

        const addComparison = (
          field: string,
          filter?: { op: string; value: number },
        ) => {
          if (filter && filter.op && filter.value !== undefined) {
            const op = ["=", ">=", "<=", ">", "<"].includes(filter.op)
              ? filter.op
              : "=";
            cteWhere += ` AND ${field} ${op} ?`;
            cteParams.push(filter.value);
          }
        };

        addComparison("amount", filters.amount);
        addComparison("amount_bc", filters.amount_bc);
        addComparison("total_payed", filters.total_payed);
        addComparison("total_payed_bc", filters.total_payed_bc);

        const fullSql = `
          WITH BalanceStats AS (
            SELECT 
              b.*,
              h.name as house_name,
              u.name as recorder_name,
              (SELECT COALESCE(SUM(total_payed), 0) FROM balance_payments bp WHERE bp.balance_id = b.id AND bp.row_deleted IS NULL) as total_payed,
              (SELECT COALESCE(SUM(total_payed_bc), 0) FROM balance_payments bp WHERE bp.balance_id = b.id AND bp.row_deleted IS NULL) as total_payed_bc
            FROM balances b
            LEFT JOIN houses h ON b.house_id = h.id
            LEFT JOIN users u ON b.recorded_by = u.id
            WHERE b.row_deleted IS NULL
          )
          SELECT * FROM BalanceStats
          ${cteWhere}
          ORDER BY ${sortBy}
          LIMIT ? OFFSET ?
        `;

        const countSql = `
          WITH BalanceStats AS (
            SELECT 
              b.*,
              h.name as house_name,
              u.name as recorder_name,
              (SELECT COALESCE(SUM(total_payed), 0) FROM balance_payments bp WHERE bp.balance_id = b.id AND bp.row_deleted IS NULL) as total_payed,
              (SELECT COALESCE(SUM(total_payed_bc), 0) FROM balance_payments bp WHERE bp.balance_id = b.id AND bp.row_deleted IS NULL) as total_payed_bc
            FROM balances b
            LEFT JOIN houses h ON b.house_id = h.id
            LEFT JOIN users u ON b.recorded_by = u.id
            WHERE b.row_deleted IS NULL
          )
          SELECT COUNT(*) as total FROM BalanceStats
          ${cteWhere}
        `;

        this.db.get(countSql, cteParams, (err, countRow: any) => {
          if (err) return reject(err);
          const total = countRow?.total || 0;

          this.db.all(
            fullSql,
            [...cteParams, pageSize, offset],
            (err, rows) => {
              if (err) return reject(err);
              resolve({
                data: rows ?? [],
                total,
                page,
                pageSize,
              });
            },
          );
        });
      });
    });
  }

  // ********************************************

  // ********************************************
  // SPENDINGS
  // ********************************************

  async getSpendings(
    page: number = 1,
    pageSize: number = 40,
    search: string = "",
    filters: {
      dateFrom?: string;
      dateTo?: string;
      status?: string; // approved/pending etc
      amount?: { op: string; value: number };
      spending_category_id?: string;
      sortBy?: string;
    } = {},
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const offset = (page - 1) * pageSize;
        const validSorts = [
          "created_date DESC",
          "created_date ASC",
          "amount DESC", // mapped to total_bc usually or specific cash
          "amount ASC",
          "title ASC",
          "title DESC",
        ];

        let sortBy = filters.sortBy || "created_date DESC";
        if (sortBy.includes(".")) {
          sortBy = sortBy.split(".").pop()!;
          const parts = filters.sortBy?.split(" ") || [];
          if (parts.length > 1) {
            const dir = parts[1];
            const col = parts[0].split(".").pop();
            sortBy = `${col} ${dir}`;
          }
        }

        if (sortBy.includes("amount")) {
          sortBy = sortBy.replace("amount", "total_bc");
        }

        if (!validSorts.includes(sortBy) && !sortBy.includes("total_bc")) {
          sortBy = "created_date DESC";
        }

        const params: any[] = [];
        let whereClause = "WHERE s.row_deleted IS NULL";

        if (search) {
          whereClause += ` AND (
            s.title LIKE ? OR 
            c.name LIKE ? OR 
            s.recorded_by LIKE ?
          )`;
          const term = `%${search}%`;
          params.push(term, term, term);
        }

        if (filters.dateFrom) {
          whereClause += " AND date(s.created_date) >= date(?)";
          params.push(filters.dateFrom);
        }
        if (filters.dateTo) {
          whereClause += " AND date(s.created_date) <= date(?)";
          params.push(filters.dateTo);
        }

        if (filters.status) {
          // Assuming 'status' maps to 'approved' boolean or similar?
          // In schema: approved: boolean.
          // If UI sends "APPROVED", "PENDING"
          if (filters.status === "APPROVED") {
            whereClause += " AND s.approved = 1";
          } else if (filters.status === "PENDING") {
            whereClause += " AND s.approved = 0";
          }
        }

        if (filters.spending_category_id) {
          whereClause += " AND s.spending_category_id = ?";
          params.push(filters.spending_category_id);
        }

        const addComparison = (
          field: string,
          filter?: { op: string; value: number },
        ) => {
          if (filter && filter.op && filter.value !== undefined) {
            const op = ["=", ">=", "<=", ">", "<"].includes(filter.op)
              ? filter.op
              : "=";
            whereClause += ` AND ${field} ${op} ?`;
            params.push(filter.value);
          }
        };

        // Schema has cash_USD, cash_CDF, cash_RWF, total_bc.
        // Let's assume filter 'amount' refers to total_bc (base currency) for simplicity or we might need specific currency filters.
        // For now, mapping 'amount' to 'total_bc' seems most logical for a general filter.
        addComparison("s.total_bc", filters.amount);

        const fullSql = `
          SELECT 
            s.*,
            c.name as category_name,
            u.name as recorder_name,
            b.name as branch_name
          FROM spendings s
          LEFT JOIN spending_categories c ON s.spending_category_id = c.id
          LEFT JOIN users u ON s.recorded_by = u.id
          LEFT JOIN branch b ON s.branch_id = b.id
          ${whereClause}
          ORDER BY ${sortBy}
          LIMIT ? OFFSET ?
        `;

        const countSql = `
          SELECT COUNT(*) as total 
          FROM spendings s
          LEFT JOIN spending_categories c ON s.spending_category_id = c.id
          LEFT JOIN users u ON s.recorded_by = u.id
          ${whereClause}
        `;

        this.db.get(countSql, params, (err, countRow: any) => {
          if (err) return reject(err);
          const total = countRow?.total || 0;

          this.db.all(fullSql, [...params, pageSize, offset], (err, rows) => {
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

  async getDeposits(
    page: number = 1,
    pageSize: number = 40,
    search: string = "",
    filters: {
      dateFrom?: string;
      dateTo?: string;
      decision?: string; // PENDING, APPROVED, REJECTED
      amount?: { op: string; value: number };
      sortBy?: string; // e.g. "created_date DESC"
    } = {},
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    return this.perform(async () => {
      return new Promise((resolve, reject) => {
        const offset = (page - 1) * pageSize;
        const validSorts = [
          "created_date ASC",
          "created_date DESC",
          "amount DESC",
          "amount ASC",
        ];

        let sortBy = "created_date DESC";
        if (filters.sortBy) {
          if (filters.sortBy === "amount DESC") {
            sortBy = "total_bc DESC";
          } else if (filters.sortBy === "amount ASC") {
            sortBy = "total_bc ASC";
          } else if (validSorts.includes(filters.sortBy)) {
            sortBy = filters.sortBy;
          }
        }

        let whereClause = "WHERE d.row_deleted IS NULL";
        const params: any[] = [];

        if (search) {
          // search recorded_by (need join) or just comment?
          // We'll join users to get recorded_by name
          whereClause += " AND (u.name LIKE ? OR d.comment LIKE ?)";
          params.push(`%${search}%`, `%${search}%`);
        }

        if (filters.dateFrom) {
          whereClause += " AND DATE(d.created_date) >= ?";
          params.push(filters.dateFrom);
        }

        if (filters.dateTo) {
          whereClause += " AND DATE(d.created_date) <= ?";
          params.push(filters.dateTo);
        }

        if (filters.decision) {
          whereClause += " AND d.decision = ?";
          params.push(filters.decision);
        }

        if (filters.amount) {
          const { op, value } = filters.amount;
          const validOps = [
            "=",
            ">",
            "<",
            ">=",
            "<=",
            "!=",
            "IS",
            "IS NOT",
            "LIKE",
          ];
          if (validOps.includes(op)) {
            // Check major currency fields
            whereClause += ` AND (d.cash_USD ${op} ? OR d.cash_CDF ${op} ? OR d.cash_RWF ${op} ? OR d.total_bc ${op} ?)`;
            params.push(value, value, value, value);
          }
        }

        const dataSql = `
          SELECT 
            d.*,
            u.name as recorder_name
          FROM deposit d
          LEFT JOIN users u ON d.recorded_by = u.id
          ${whereClause}
          ORDER BY ${sortBy} 
          LIMIT ? OFFSET ?
        `;

        const countSql = `
          SELECT COUNT(*) as total 
          FROM deposit d
          LEFT JOIN users u ON d.recorded_by = u.id
          ${whereClause}
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
}
