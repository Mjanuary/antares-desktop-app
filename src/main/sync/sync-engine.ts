// src/main/syncEngine.ts
import Database from "better-sqlite3";
import axios, { AxiosInstance } from "axios";
import { EventEmitter } from "events";

type LastSyncRow = {
  table_name: string;
  last_cursor: string | null;
  last_timestamp: string | null;
  has_error: number; // 0 | 1
  error_message: string | null;
};

type ApiResponse<T = any> = {
  data: T[];
  has_more: boolean;
  next_cursor: string | null;
  server_timestamp: string | null;
};

type SyncOptions = {
  dbPath: string;
  apiBaseUrl: string;
  deviceId: string;
  branchId: string;
  tables: string[]; // ordered list
  pageLimit?: number;
  axiosInstance?: AxiosInstance;
  maxRetries?: number;
  retryBackoffMs?: number;
};

export type SyncStatus =
  | { type: "started" }
  | { type: "table:start"; table: string }
  | {
      type: "table:page";
      table: string;
      pageCursor: string | null;
      rows: number;
    }
  | { type: "table:done"; table: string }
  | { type: "error"; table: string; error: string }
  | { type: "finished" };

export class SyncEngine extends EventEmitter {
  private db: Database.Database;
  private api: AxiosInstance;
  private deviceId: string;
  private branchId: string;
  private tables: string[];
  private pageLimit: number;
  private maxRetries: number;
  private retryBackoffMs: number;

  constructor(opts: SyncOptions) {
    super();
    this.db = new Database(opts.dbPath);
    this.api =
      opts.axiosInstance ??
      axios.create({ baseURL: opts.apiBaseUrl, timeout: 30000 });
    this.deviceId = opts.deviceId;
    this.branchId = opts.branchId;
    this.tables = opts.tables;
    this.pageLimit = opts.pageLimit ?? 100;
    this.maxRetries = opts.maxRetries ?? 3;
    this.retryBackoffMs = opts.retryBackoffMs ?? 500;
    this.prepareLastSyncTable();
  }

  // Ensure the last_sync table exists
  private prepareLastSyncTable() {
    const create = `
      CREATE TABLE IF NOT EXISTS last_sync (
        table_name TEXT PRIMARY KEY,
        last_cursor TEXT,
        last_timestamp TEXT,
        has_error INTEGER DEFAULT 0,
        error_message TEXT
      );
    `;
    this.db.exec(create);

    // Ensure every tracked table has a row in last_sync
    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO last_sync (table_name, last_cursor, last_timestamp, has_error, error_message)
      VALUES (?, NULL, NULL, 0, NULL)
    `);
    const tx = this.db.transaction((tables: string[]) => {
      for (const t of tables) insert.run(t);
    });
    tx(this.tables);
  }

  // Helper: get last_sync row
  private getLastSync(table: string): LastSyncRow {
    const stmt = this.db.prepare(
      `SELECT * FROM last_sync WHERE table_name = ?`
    );
    const row = stmt.get(table);
    return row as LastSyncRow;
  }

  // Helper: update last_sync after a successful page
  private updateLastSyncSuccess(
    table: string,
    nextCursor: string | null,
    serverTimestamp: string | null
  ) {
    const stmt = this.db.prepare(`
      UPDATE last_sync SET
        last_cursor = ?,
        last_timestamp = ?,
        has_error = 0,
        error_message = NULL
      WHERE table_name = ?
    `);
    stmt.run(nextCursor, serverTimestamp, table);
  }

  // Helper: mark error in last_sync
  private updateLastSyncError(table: string, errorMsg: string) {
    const stmt = this.db.prepare(`
      UPDATE last_sync SET
        has_error = 1,
        error_message = ?
      WHERE table_name = ?
    `);
    stmt.run(errorMsg, table);
  }

  // Public: run sync over all configured tables sequentially
  public async runFullSync() {
    this.emitStatus({ type: "started" });

    for (const table of this.tables) {
      this.emitStatus({ type: "table:start", table });
      try {
        await this.syncTableSequential(table);
        this.emitStatus({ type: "table:done", table });
      } catch (err: any) {
        const errorMessage = err?.message ?? String(err);
        this.updateLastSyncError(table, errorMessage);
        this.emitStatus({ type: "error", table, error: errorMessage });
        // continue to next table (do not stop)
      }
    }

    this.emitStatus({ type: "finished" });
  }

  // Sync a single table, follow pagination until has_more == false
  private async syncTableSequential(table: string) {
    let last = this.getLastSync(table);
    let cursor = last.last_cursor || null; // TODO: add the default date
    let keepGoing = true;

    while (keepGoing) {
      const resp = await this.requestWithRetries<ApiResponse>(table, cursor);
      // Save data into table
      this.savePageDataToDb(table, resp.data);

      // Update last_sync immediately on success
      this.updateLastSyncSuccess(
        table,
        resp.next_cursor,
        resp.server_timestamp
      );

      // Emit page progress
      this.emitStatus({
        type: "table:page",
        table,
        pageCursor: resp.next_cursor,
        rows: resp.data.length,
      });

      if (!resp.has_more) {
        keepGoing = false;
      } else {
        cursor = resp.next_cursor;
        // continue loop
      }
    }
  }

  // HTTP request with retry/backoff
  private async requestWithRetries<T>(
    table: string,
    lastCursor: string | null
  ): Promise<T> {
    let attempt = 0;
    let lastError: any = null;

    while (attempt < this.maxRetries) {
      try {
        const params: any = {
          limit: this.pageLimit,
          deviceId: this.deviceId,
          branchId: this.branchId,
        };
        if (lastCursor) params.lastSync = lastCursor;
        // Use your API path pattern
        const url = `/api/desktop/${encodeURIComponent(table)}`; // TODO: check how this url is generated
        const { data } = await this.api.get<T>(url, { params });
        return data;
      } catch (err) {
        lastError = err;
        attempt += 1;
        const wait = this.retryBackoffMs * Math.pow(2, attempt - 1);
        // small sleep
        await new Promise((res) => setTimeout(res, wait));
      }
    }

    // After retries, persist error and throw
    const message =
      lastError && lastError.message ? lastError.message : String(lastError);
    this.updateLastSyncError(table, message);
    throw new Error(`Failed to fetch table=${table}: ${message}`);
  }

  // Generic: save array-of-rows into the table with basic upsert/delete logic
  // Assumptions:
  // - Each row has a primary key that ends with '_id' (e.g. client_id)
  // - If `row_deleted` exists and is not null, delete the row by PK
  private savePageDataToDb(table: string, rows: any[]) {
    if (!Array.isArray(rows) || rows.length === 0) return;

    const sample = rows[0];

    // // detect pk
    // const pk = Object.keys(sample).find((k) => k.endsWith("_id"));
    // if (!pk) {
    //   throw new Error(
    //     `Cannot detect primary key for table ${table}. Row keys: ${Object.keys(
    //       sample
    //     ).join(",")}`
    //   );
    // }
    const pk = "id"; // TODO: make this dynamic

    // Build columns & statement (INSERT OR REPLACE)
    const allColumns = new Set<string>();
    for (const r of rows) {
      for (const k of Object.keys(r)) allColumns.add(k);
    }
    const columns = Array.from(allColumns);
    const placeholders = columns.map(() => "?").join(",");
    const insertSql = `INSERT OR REPLACE INTO ${table} (${columns.join(
      ","
    )}) VALUES (${placeholders})`;
    const insertStmt = this.db.prepare(insertSql);

    // Start transaction
    const tx = this.db.transaction((rowsToSave: any[]) => {
      for (const row of rowsToSave) {
        // If row_deleted present and truthy -> delete
        if (row.hasOwnProperty("row_deleted") && row.row_deleted != null) {
          const delStmt = this.db.prepare(
            `DELETE FROM ${table} WHERE ${pk} = ?`
          );
          delStmt.run(row[pk]);
          continue;
        }

        // Ensure all columns exist in DB - if not, this will fail.
        // Optionally: you can create missing columns dynamically (not recommended in prod).
        const values = columns.map((c) => {
          // convert boolean to integer for sqlite
          if (typeof row[c] === "boolean") return row[c] ? 1 : 0;
          // keep dates as ISO strings
          return row[c] ?? null;
        });
        insertStmt.run(...values);
      }
    });

    tx(rows);
  }

  // convenience: emit status
  private emitStatus(status: SyncStatus) {
    this.emit("status", status);
  }
}
