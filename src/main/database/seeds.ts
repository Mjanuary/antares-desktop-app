import { Database } from "sqlite3";
import { SettingsKey, SettingsSeeds } from "../constants";

export interface Migration {
  name: string;
  sql: string;
}

export async function runSeeds(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    // First, ensure migrations table exists

    // Check if settings exists
    db.all(
      `SELECT * FROM settings WHERE key = '${SettingsSeeds.BASE_URL.key}'`,
      (err, rows) => {
        if (err) {
          console.error("Error reading settings", err);
          reject(err);
          return;
        }

        console.log({ MIGRATION_SETTINGS: rows });

        if (rows.length <= 0) {
          // Create default settings
          db.run(
            "INSERT INTO settings (key, value) VALUES (?, ?)",
            [SettingsSeeds.BASE_URL.key, SettingsSeeds.BASE_URL.value],

            (err) => {
              if (err) {
                console.error("Error creating settings", err);
                // return;
              } else {
                console.log("Settings created");
              }
              resolve();
            },
          );
        } else {
          console.log("Settings already exists");
          resolve();
        }
      },
    );
  });
}
