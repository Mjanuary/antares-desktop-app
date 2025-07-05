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
