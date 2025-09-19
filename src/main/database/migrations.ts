import { Database } from "sqlite3";

export interface Migration {
  name: string;
  sql: string;
}

export const migrations: Migration[] = [
  {
    name: "create_migrations_table",
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
  },
  {
    name: "create_todos_table",
    sql: `
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
  },
  {
    name: "app_connect_table",
    sql: `
    CREATE TABLE IF NOT EXISTS app_connect (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      device_name TEXT,
      app_type TEXT,
      device_info JSON DEFAULT '[]',
      user_info JSON NOT NULL,
      user_name TEXT NOT NULL,
      email TEXT NOT NULL,

      -- codes --
      verification_code TEXT NOT NULL,
      approval_code TEXT NOT NULL,

      -- connection-info --
      device_connected BOOLEAN DEFAULT 0,
      connection_date DATETIME,
      connection_id TEXT NOT NULL,
      
      blocked BOOLEAN DEFAULT 1,
      blocked_time DATETIME,

      branch_id TEXT,
      created_by TEXT,
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_time DATETIME,

      -- foreign keys (SQLite is looser, but we can declare them) --
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(branch_id) REFERENCES branch(id),
      FOREIGN KEY(created_by) REFERENCES users(id)
    );
    
    CREATE INDEX IF NOT EXISTS user_id_idx ON app_connect (user_id);
    CREATE INDEX IF NOT EXISTS connection_id_idx ON app_connect (connection_id);
    CREATE INDEX IF NOT EXISTS branch_id_idx ON app_connect (branch_id);
    CREATE INDEX IF NOT EXISTS connect_link_email_idx ON app_connect (email);
    CREATE INDEX IF NOT EXISTS active_idx ON app_connect (blocked);
  `,
  },
];

export async function runMigrations(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    // First, ensure migrations table exists
    db.run(migrations[0].sql, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Get list of applied migrations
      db.all("SELECT name FROM migrations", (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        const appliedMigrations = new Set(rows.map((row: any) => row.name));

        // Run pending migrations
        const pendingMigrations = migrations.filter(
          (migration) => !appliedMigrations.has(migration.name)
        );

        if (pendingMigrations.length === 0) {
          resolve();
          return;
        }

        // Run each pending migration in sequence
        let currentIndex = 0;

        function runNextMigration() {
          if (currentIndex >= pendingMigrations.length) {
            resolve();
            return;
          }

          const migration = pendingMigrations[currentIndex];
          db.run(migration.sql, (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Record that this migration was applied
            db.run(
              "INSERT INTO migrations (name) VALUES (?)",
              [migration.name],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                currentIndex++;
                runNextMigration();
              }
            );
          });
        }

        runNextMigration();
      });
    });
  });
}
