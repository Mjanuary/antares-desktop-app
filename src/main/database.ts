import { Database } from "sqlite3";
import { Todo } from "../types/Todo";
import { DeviceConnection } from "../types/auth.types";
import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { runMigrations } from "./database/migrations";

export class TodoDatabase {
  private db!: Database;
  private dbPath: string;

  constructor() {
    // Use the app's user data directory for the database file
    this.dbPath = path.join(app.getPath("userData"), "antares_app.db");
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    // Ensure user data directory exists
    const userDataDir = app.getPath("userData");
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    // Initialize the database connection
    this.db = new Database(this.dbPath);

    // Run migrations
    await runMigrations(this.db);
  }

  // Authentication part
  async createDeviceConnection(
    connection: Omit<DeviceConnection, "created_time" | "updated_time">
  ): Promise<DeviceConnection> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO app_connect (
        id,
        user_id,
        device_name,
        app_type,
        device_info,
        user_info,
        user_name,
        email,
        verification_code,
        approval_code,
        device_connected,
        connection_date,
        connection_id,
        blocked,
        blocked_time,
        branch_id,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          connection.id,
          connection.user_id,
          connection.device_name,
          connection.app_type,
          JSON.stringify(connection.device_info ?? []), // store JSON properly
          JSON.stringify(connection.user_info), // required
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
              created_time: new Date().toISOString(), // DB default is CURRENT_TIMESTAMP
              updated_time: new Date().toISOString(),
            });
          }
        }
      );
    });
  }

  async getLatestDeviceConnection(): Promise<DeviceConnection | null> {
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
              connection_date: row.connection_date ?? null, // string | null
              connection_id: row.connection_id,
              blocked: Boolean(row.blocked),
              blocked_time: row.blocked_time ?? null, // string | null
              branch_id: row.branch_id,
              created_by: row.created_by,
              created_time: row.created_time, // string
              updated_time: row.updated_time ?? null, // string | null
            };
            resolve(connection);
          }
        }
      );
    });
  }

  async deleteAllDeviceConnections(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM app_connect", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // ********************************************

  async createTodo(
    todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ): Promise<Todo> {
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
        }
      );
    });
  }

  async getTodos(): Promise<Todo[]> {
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
        }
      );
    });
  }

  async updateTodo(id: number, todo: Partial<Todo>): Promise<void> {
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
        }
      );
    });
  }

  async deleteTodo(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM todos WHERE id = ?", [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
