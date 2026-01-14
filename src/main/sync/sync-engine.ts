import axios, { AxiosInstance } from "axios";
import { EventEmitter } from "events";
// import { AsyncDB } from "../db/asyncDb";
// import { resolveConflict } from "./conflictResolver";
import { AsyncDB } from "./db-wrapper";
import resolveConflict from "./conflite-resolution";
import { validateAndTransformData } from "./sync-validation";
import { AppDatabase } from "../database";
import { axiosInstance } from "../../api-requests/axios-instance";

type ApiPage<T> = {
  data: T[];
  has_more: boolean;
  next_cursor: string | null;
  server_timestamp: string;
};

export type SyncProgress =
  | { type: "start" }
  | { type: "push:table"; table: string }
  | { type: "pull:table"; table: string }
  | { type: "progress"; percent: number; table?: string }
  | { type: "error"; table: string; message: string }
  | { type: "done" };

type PullResponse<T = any> = {
  data: T[];
  has_more: boolean;
  next_cursor: string | null;
  server_timestamp: string;
  next_id: string | null;
};

import { UpsertManyOptions } from "../../types/sync.types";
import { SyncType } from "../constants";

/**
 * SyncEngine
 * ----------
 * Orchestrates sync flow ONLY.
 * No SQL. No database connections.
 */

type SyncDB = {
  countUnsyncedRows(table: string): Promise<number>;
  getUnsyncedRows(table: string, limit: number, offset: number): Promise<any[]>;
  upsertMany(opts: UpsertManyOptions): Promise<number>;
  markTableAsSynced(table: string): Promise<number>;
  markRowsAsSynced(table: string, ids: string[]): Promise<number>;

  // already used in your code ↓
  addRetry(
    table: string,
    payload: any,
    error: string,
    type: SyncType,
  ): Promise<void>;
  getRetries(table: string): Promise<{ id: number; payload: string }[]>;
  removeRetry(id: number): Promise<void>;
  incrementRetry(id: number): Promise<void>;

  // pull path
  upsert(table: string, row: any): Promise<void>;
  getLastSync(
    table: string,
  ): Promise<{ last_sync: string; next_id: string } | null>;
};

export class SyncEngine extends EventEmitter {
  // private db: AppDatabase;
  private db: SyncDB;

  private api: AxiosInstance = axiosInstance;

  private cancelled = false;

  private tables: string[];
  // private pageLimit = 100;
  private pageLimit = 100;
  private deviceId: string;
  private branchId: string;

  private tableProgress = new Map<string, number>();

  constructor(opts: {
    db: SyncDB;
    tables: string[];
    deviceId: string;
    branchId: string;
  }) {
    super();
    this.db = opts.db;
    this.tables = opts.tables;
    this.deviceId = opts.deviceId;
    this.branchId = opts.branchId;
  }

  cancel() {
    this.cancelled = true;
  }

  async run() {
    this.emit("status", { type: "start" });

    for (const table of this.tables) {
      if (this.cancelled) break;

      this.emit("status", { type: "push:table", table });

      // await this.processRetryQueue(table);
      await this.pullTable(table);
      await this.pushTable(table);
    }

    this.emit("status", { type: "done" });
  }

  /* ================= PUSH ================= */
  private async pushTable(table: string) {
    let offset = 0;

    const total = await this.db.countUnsyncedRows(table);

    if (!total) return;

    const estimatedPages = Math.ceil(total / this.pageLimit);
    const tableWeight = 100 / this.tables.length;
    const pageWeight = estimatedPages > 0 ? tableWeight / estimatedPages : 0; // Avoid NaN

    while (!this.cancelled) {
      const rows = await this.db.getUnsyncedRows(table, this.pageLimit, offset);

      if (!rows.length) break;

      try {
        console.log(`[SyncEngine] PUSH ${table}: Sending ${rows.length} rows`);
        const response = await this.api.post<{
          success: string[];
          failed: { id: string | null; error: any }[];
        }>(`/${table}`, rows);

        const succeededIds = response.data.success;

        console.log(
          `[SyncEngine] PUSH ${table} Response:`,
          Array.isArray(succeededIds)
            ? `Synced ${succeededIds.length} rows`
            : JSON.stringify(succeededIds),
        );

        if (Array.isArray(succeededIds) && succeededIds.length > 0) {
          await this.db.markRowsAsSynced(table, succeededIds);
          this.updateProgress(
            table,
            (succeededIds.length / rows.length) * pageWeight,
          );
        }

        const failedItems = response.data.failed;
        if (Array.isArray(failedItems) && failedItems.length > 0) {
          console.warn(
            `[SyncEngine] PUSH ${table} Partial/Batch Failure: ${failedItems.length} items failed.`,
          );
          // If "one fails, all fail", the API might return current batch rows in 'failed'
          // We add the *original rows* (or the failed ones if specific) to retry queue.
          // Since the user said "if one fails all will fail", we treat the whole batch as failed if there are *any* failures
          // BUT check if succeededIds has anything.
          // If succeededIds is empty and failedItems is not empty, it's a batch failure.

          const errorMsg = failedItems
            .map((f) => `ID ${f.id}: ${JSON.stringify(f.error)}`)
            .join("; ");
          await this.db.addRetry(table, rows, errorMsg, SyncType.Push);
        }

        // Pagination Logic:
        // Succeeded rows are removed from "unsynced" set (offset stays 0 relative to them).
        // Failed rows remain in "unsynced" set.
        // We must increment offset by the number of FAILED rows to skip them in the next fetch
        // so we can reach the next page of unsynced rows.

        const successCount = Array.isArray(succeededIds)
          ? succeededIds.length
          : 0;
        const failCount = rows.length - successCount;

        offset += failCount;
      } catch (err: any) {
        console.error(`[SyncEngine] PUSH ${table} Error:`, err.message);
        await this.db.addRetry(table, rows, err.message, SyncType.Push);
        break;
      }
    }
  }

  /* ================= PULL ================= */

  private async pullTable(table: string) {
    let cursor: string | null = "2024-04-11 09:44:31.219"; // default fetch date
    let lastId: string | null = null;
    let hasMore = true;

    // Get initial sync state from DB
    try {
      const lastSync = await this.db.getLastSync(table);
      if (lastSync) {
        cursor = lastSync.last_sync;
        lastId = lastSync.next_id;
      }
    } catch (err) {
      console.error(`[SyncEngine] Failed to get last sync for ${table}:`, err);
      // If we can't get the last sync, we probably shouldn't proceed with this table
      return;
    }

    while (!this.cancelled && hasMore) {
      try {
        console.log(
          `[SyncEngine] PULL ${table}: Requesting (cursor=${cursor ?? "null"}, lastId=${lastId ?? "null"})`,
        );

        const res = await this.api.get<PullResponse>(`/${table}`, {
          params: {
            lastSync: cursor,
            lastId: lastId,
            limit: this.pageLimit,
            deviceId: this.deviceId,
            branchId: this.branchId,
          },
        });
        console.log(
          `[SyncEngine] PULL ${table} Response:`,
          JSON.stringify(res.data, null, 2),
        );

        const data = res.data as PullResponse<any>;

        if (data.data.length > 0) {
          const validation = validateAndTransformData(table, data.data);

          if (!validation.isValid) {
            console.error(
              `[SyncEngine] ----------)))))))------- Validation failed for ${table}:`,
              validation.error,
            );
            // Skip this table for this run
            break;
          }

          await this.db.upsertMany({
            table,
            rows: validation.transformed,
            last_sync: data.next_cursor,
            next_id: data.next_id,
          });
        }

        // Update verify state for next iteration
        cursor = data.next_cursor;
        lastId = data.next_id;
        hasMore = data.has_more;

        this.updateProgress(table, 1);
      } catch (err: any) {
        console.error(`[SyncEngine] Error pulling ${table}:`, err);
        // "If fetching data fails, you should skip the whole process or that table"
        // We add retry record for visibility (optional per existing logic) but MUST break loop for this table.
        await this.db.addRetry(table, { cursor }, err.message, SyncType.Pull);
        break; // Stop processing this table, proceed to next in run()
      }
    }
  }

  /* ================= RETRIES ================= */

  private async processRetryQueue(table: string) {
    const retries = await this.db.getRetries(table);
    console.log("[SyncEngine] RETRIES", retries);
    for (const r of retries) {
      try {
        await this.api.post(`/${table}`, JSON.parse(r.payload));
        await this.db.removeRetry(r.id);
      } catch {
        await this.db.incrementRetry(r.id);
      }
    }
  }

  /* ================= PROGRESS ================= */

  private updateProgress(table: string, inc: number) {
    const prev = this.tableProgress.get(table) ?? 0;
    this.tableProgress.set(table, prev + inc);

    const total = [...this.tableProgress.values()].reduce((a, b) => a + b, 0);

    this.emit("status", {
      type: "progress",
      percent: Math.min(100, Math.round(total)),
    });
  }
}
