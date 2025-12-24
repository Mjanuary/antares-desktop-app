import sqlite3 from "sqlite3";

export class AsyncDB {
  private db: sqlite3.Database;

  constructor(path: string) {
    this.db = new sqlite3.Database(path);
  }

  run(sql: string, params: any[] = []) {
    return new Promise<void>((res, rej) => {
      this.db.run(sql, params, (err) => (err ? rej(err) : res()));
    });
  }

  get<T>(sql: string, params: any[] = []) {
    return new Promise<T>((res, rej) => {
      this.db.get(sql, params, (err, row: any) => (err ? rej(err) : res(row)));
    });
  }

  all<T>(sql: string, params: any[] = []) {
    return new Promise<T[]>((res, rej) => {
      this.db.all(sql, params, (err, rows: any) =>
        err ? rej(err) : res(rows)
      );
    });
  }
}
