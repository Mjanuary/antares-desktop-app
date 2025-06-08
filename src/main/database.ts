import { Database } from "sqlite3";
import { Todo } from "../types/Todo";
import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import isDev from "electron-is-dev";

export class TodoDatabase {
  private db!: Database;
  private dbPath: string;

  constructor() {
    // Use the app's user data directory for the database file
    this.dbPath = path.join(app.getPath("userData"), "antares_app.db");
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Check if the database file exists
    if (!fs.existsSync(this.dbPath)) {
      // Get the path to the default database
      const defaultDbPath = isDev
        ? path.join(__dirname, "../../src/assets/default-db/antares_app.db")
        : path.join(process.resourcesPath, "default-db/antares_app.db");

      // If default database exists, copy it
      if (fs.existsSync(defaultDbPath)) {
        fs.copyFileSync(defaultDbPath, this.dbPath);
      }
    }

    // Initialize the database connection
    this.db = new Database(this.dbPath);

    // Create tables if they don't exist
    this.db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

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
