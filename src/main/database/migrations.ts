import { Database } from "sqlite3";

export interface Migration {
  name: string;
  sql: string;
}

export const migrations: Migration[] = [
  // updated contents
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
      );
      
      CREATE INDEX IF NOT EXISTS todos_completed_idx ON todos (completed);
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

      verification_code TEXT NOT NULL,
      approval_code TEXT NOT NULL,

      device_connected BOOLEAN DEFAULT 0,
      connection_date DATETIME,
      connection_id TEXT NOT NULL,
      
      blocked BOOLEAN DEFAULT 1,
      blocked_time DATETIME,

      branch_id TEXT,
      created_by TEXT,
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_time DATETIME,

      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY(branch_id) REFERENCES branch(id) ON DELETE SET NULL,
      FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS user_id_idx ON app_connect (user_id);
    CREATE INDEX IF NOT EXISTS connection_id_idx ON app_connect (connection_id);
    CREATE INDEX IF NOT EXISTS branch_id_idx ON app_connect (branch_id);
    CREATE INDEX IF NOT EXISTS connect_link_email_idx ON app_connect (email);
    CREATE INDEX IF NOT EXISTS active_idx ON app_connect (blocked);
    CREATE INDEX IF NOT EXISTS app_connect_created_by_idx ON app_connect (created_by);
  `,
  },
  {
    name: "create_users_table",
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        emailVerified BOOLEAN,
        image TEXT,
        blocked BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'PENDING'
      );
      
      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
      CREATE INDEX IF NOT EXISTS users_blocked_idx ON users (blocked);
      CREATE INDEX IF NOT EXISTS users_sync_status_idx ON users (sync_status);
    `,
  },
  {
    name: "create_spendings_table",
    sql: `
      CREATE TABLE IF NOT EXISTS spendings (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        spending_category_id TEXT,
        spending_type TEXT,
        deposit_id TEXT,
        rate_RWF INTEGER DEFAULT 0,
        rate_CDF INTEGER DEFAULT 0,
        branch_currency TEXT,
        cash_USD INTEGER DEFAULT 0,
        cash_CDF INTEGER DEFAULT 0,
        cash_RWF INTEGER DEFAULT 0,
        total_bc INTEGER DEFAULT 0,
        branch_id TEXT,
        recorded_by TEXT,
        comment TEXT,
        approved BOOLEAN DEFAULT 0,
        active BOOLEAN DEFAULT 1,
        history TEXT DEFAULT '[]',
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        app_connection TEXT,
        row_version INTEGER DEFAULT 1,
        row_deleted TEXT DEFAULT 'null',
        sync_status TEXT DEFAULT 'PENDING',

        FOREIGN KEY(spending_category_id) REFERENCES spending_categories(id) ON DELETE SET NULL,
        FOREIGN KEY(deposit_id) REFERENCES deposit(id) ON DELETE SET NULL,
        FOREIGN KEY(branch_id) REFERENCES branch(id) ON DELETE CASCADE,
        FOREIGN KEY(recorded_by) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS spendings_category_id_idx ON spendings (spending_category_id);
      CREATE INDEX IF NOT EXISTS spendings_deposit_id_idx ON spendings (deposit_id);
      CREATE INDEX IF NOT EXISTS spendings_branch_id_idx ON spendings (branch_id);
      CREATE INDEX IF NOT EXISTS spendings_recorded_by_idx ON spendings (recorded_by);
      CREATE INDEX IF NOT EXISTS spendings_approved_idx ON spendings (approved);
      CREATE INDEX IF NOT EXISTS spendings_active_idx ON spendings (active);
      CREATE INDEX IF NOT EXISTS spendings_created_date_idx ON spendings (created_date);
    `,
  },
  {
    name: "create_spending_categories_table",
    sql: `
      CREATE TABLE IF NOT EXISTS spending_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        branch_id TEXT,
        recorded_by TEXT,
        status BOOLEAN DEFAULT 1,
        repeat TEXT, -- e.g. 'DAILY', 'WEEKLY', etc.
        app_connection TEXT,
        row_version INTEGER DEFAULT 1,
        row_deleted TEXT DEFAULT 'null',
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'PENDING',

        FOREIGN KEY(branch_id) REFERENCES branch(id) ON DELETE CASCADE,
        FOREIGN KEY(recorded_by) REFERENCES users(id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS spending_categories_branch_id_idx ON spending_categories (branch_id);
      CREATE INDEX IF NOT EXISTS spending_categories_recorded_by_idx ON spending_categories (recorded_by);
      CREATE INDEX IF NOT EXISTS spending_categories_status_idx ON spending_categories (status);
      CREATE UNIQUE INDEX IF NOT EXISTS spending_categories_branch_name_unique_idx ON spending_categories (name, branch_id);
    `,
  },
  {
    name: "create_sales_items_table",
    sql: `
    CREATE TABLE IF NOT EXISTS sales_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_to_branch_id TEXT,
      recorded_by TEXT,

      quantity INTEGER DEFAULT 0,
      bonus INTEGER DEFAULT 0,

      price_unit INTEGER DEFAULT 0,
      price_total INTEGER DEFAULT 0,
      price_total_bc INTEGER DEFAULT 0,

      printed BOOLEAN DEFAULT 0,
      designed BOOLEAN DEFAULT 0,
      designed_by TEXT,

      app_connection TEXT,
      row_version INTEGER DEFAULT 1,
      row_deleted TEXT DEFAULT 'null',
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'PENDING',

      FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
      FOREIGN KEY(recorded_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY(designed_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS sales_items_sale_id_idx ON sales_items (sale_id);
    CREATE INDEX IF NOT EXISTS sales_items_product_id_idx ON sales_items (product_id);
    CREATE INDEX IF NOT EXISTS sales_items_recorded_by_idx ON sales_items (recorded_by);
    CREATE INDEX IF NOT EXISTS sales_items_printed_designed_idx ON sales_items (printed, designed);
    CREATE INDEX IF NOT EXISTS sales_items_product_branch_id_idx ON sales_items (product_to_branch_id);
    `,
  },
  {
    name: "create_sales_table",
    sql: `
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        parent_sale_id TEXT,
        branch_id TEXT,
        client_id TEXT,
        client_name TEXT,
        client_phone TEXT,
        house_id TEXT,

        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_currency TEXT,
        branch_currency TEXT,

        price_total INTEGER DEFAULT 0,
        price_total_bc INTEGER DEFAULT 0,
        rate_RWF INTEGER DEFAULT 0,
        rate_CDF INTEGER DEFAULT 0,
        payed_USD INTEGER DEFAULT 0,
        payed_CDF INTEGER DEFAULT 0,
        payed_RWF INTEGER DEFAULT 0,
        total_payed_cash INTEGER DEFAULT 0,
        total_payed_cash_bc INTEGER DEFAULT 0,
        balance INTEGER DEFAULT 0,
        balance_bc INTEGER DEFAULT 0,

        comment TEXT,
        deposit_id TEXT,
        receipt_id TEXT,
        total_products INTEGER DEFAULT 0,
        recorded_by TEXT,

        app_connection TEXT,
        row_version INTEGER DEFAULT 1,
        row_deleted TEXT DEFAULT 'null',
        created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'PENDING',

        FOREIGN KEY(parent_sale_id) REFERENCES sales(id) ON DELETE SET NULL,
        FOREIGN KEY(branch_id) REFERENCES branch(id) ON DELETE CASCADE,
        FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE SET NULL,
        FOREIGN KEY(deposit_id) REFERENCES deposit(id) ON DELETE SET NULL,
        FOREIGN KEY(recorded_by) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS sales_branch_id_idx ON sales (branch_id);
      CREATE INDEX IF NOT EXISTS sales_client_id_idx ON sales (client_id);
      CREATE INDEX IF NOT EXISTS sales_house_id_idx ON sales (house_id);
      CREATE INDEX IF NOT EXISTS sales_deposit_id_idx ON sales (deposit_id);
      CREATE INDEX IF NOT EXISTS sales_recorded_by_idx ON sales (recorded_by);
      CREATE INDEX IF NOT EXISTS sales_transaction_date_idx ON sales (transaction_date);
    `,
  },
  {
    name: "create_products_table",
    sql: `
        CREATE TABLE IF NOT EXISTS products (
          product_id TEXT PRIMARY KEY,
          branch_product_id TEXT,
          name TEXT NOT NULL,
          code TEXT,
          qr_code TEXT,
          bar_code TEXT,
          colors TEXT,               -- stored as JSON string: ["Green,Vert", "White,Blanc"]
          paper_colors TEXT,         -- stored as JSON string
          paper_size TEXT,           -- stored as JSON string: [{"width":1200,"height":1200}]
          description TEXT,
          notes TEXT,
          thumbnail TEXT,
          cover_image_url TEXT,

          diver_category_id TEXT,
          diver_sub_category_id TEXT,

          custom_diver BOOLEAN DEFAULT 0,
          has_papers BOOLEAN DEFAULT 0,
          is_printable BOOLEAN DEFAULT 0,
          product_active BOOLEAN DEFAULT 1,
          branch_active BOOLEAN DEFAULT 1,

          price_CDF INTEGER DEFAULT 0,
          price_RWF INTEGER DEFAULT 0,
          price_USD INTEGER DEFAULT 0,

          stock_quantity INTEGER DEFAULT 0,

          app_connection TEXT,
          product_row_version INTEGER DEFAULT 1,
          branch_row_version INTEGER DEFAULT 1,
          product_row_deleted TEXT DEFAULT 'null',
          branch_row_deleted TEXT DEFAULT 'null',

          created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          product_updated_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          branch_updated_time DATETIME,
          latest_update DATETIME,
          sync_status TEXT DEFAULT 'PENDING',

          FOREIGN KEY(diver_category_id) REFERENCES categories(id) ON DELETE SET NULL,
          FOREIGN KEY(diver_sub_category_id) REFERENCES sub_categories(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (diver_category_id);
        CREATE INDEX IF NOT EXISTS products_sub_category_id_idx ON products (diver_sub_category_id);
        CREATE INDEX IF NOT EXISTS products_branch_product_id_idx ON products (branch_product_id);
        CREATE INDEX IF NOT EXISTS products_active_idx ON products (product_active, branch_active);
        CREATE INDEX IF NOT EXISTS products_code_idx ON products (code);
    `,
  },
  {
    name: "create_product_sub_category_table",
    sql: `
      CREATE TABLE IF NOT EXISTS sub_categories (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,

        active BOOLEAN DEFAULT 1,
        created_by TEXT,

        created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_time DATETIME DEFAULT CURRENT_TIMESTAMP,

        app_connection TEXT,
        row_version INTEGER DEFAULT 1,
        row_deleted TEXT DEFAULT 'null',
        sync_status TEXT DEFAULT 'PENDING',

        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS sub_categories_category_id_idx ON sub_categories (category_id);
      CREATE INDEX IF NOT EXISTS sub_categories_active_idx ON sub_categories (active);
      CREATE INDEX IF NOT EXISTS sub_categories_created_by_idx ON sub_categories (created_by);
      CREATE UNIQUE INDEX IF NOT EXISTS sub_categories_name_category_unique_idx ON sub_categories (name, category_id);
    `,
  },
  {
    name: "create_product_category_table",
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        
        active BOOLEAN DEFAULT 1,
        stand_alone BOOLEAN DEFAULT 0,
        created_by TEXT,

        created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_time DATETIME DEFAULT CURRENT_TIMESTAMP,

        app_connection TEXT,
        row_version INTEGER DEFAULT 1,
        row_deleted TEXT DEFAULT 'null',
        sync_status TEXT DEFAULT 'PENDING',

        FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS categories_active_idx ON categories (active);
      CREATE INDEX IF NOT EXISTS categories_created_by_idx ON categories (created_by);
    `,
  },
  {
    name: "create_houses_table",
    sql: `
      CREATE TABLE IF NOT EXISTS houses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT,
        address TEXT,
        contacts TEXT,
        comment TEXT,

        active BOOLEAN DEFAULT 1,

        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,

        app_connection TEXT,
        row_version INTEGER DEFAULT 1,
        row_deleted TEXT DEFAULT 'null',
        sync_status TEXT DEFAULT 'PENDING'
      );
      
      CREATE INDEX IF NOT EXISTS houses_active_idx ON houses (active);
    `,
  },
  {
    name: "create_deposit_table",
    sql: `
      CREATE TABLE IF NOT EXISTS deposit (
        id TEXT PRIMARY KEY,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        branch_id TEXT,
        recorded_by TEXT,
        approved_by TEXT,
        branch_currency TEXT,
        decision TEXT,
        comment TEXT,
 
        approved BOOLEAN DEFAULT 0,

        rate_RWF INTEGER DEFAULT 0,
        rate_CDF INTEGER DEFAULT 0,
        cash_USD INTEGER DEFAULT 0,
        cash_CDF INTEGER DEFAULT 0,
        cash_RWF INTEGER DEFAULT 0,
        total_bc INTEGER DEFAULT 0,

        history TEXT DEFAULT '[]',
        deposit_summary TEXT DEFAULT 'null',

        app_connection TEXT,
        row_version INTEGER DEFAULT 1,
        row_deleted TEXT DEFAULT 'null',
        sync_status TEXT DEFAULT 'PENDING',

        FOREIGN KEY(branch_id) REFERENCES branch(id) ON DELETE CASCADE,
        FOREIGN KEY(recorded_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY(approved_by) REFERENCES users(id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS deposit_branch_id_idx ON deposit (branch_id);
      CREATE INDEX IF NOT EXISTS deposit_recorded_by_idx ON deposit (recorded_by);
      CREATE INDEX IF NOT EXISTS deposit_approved_idx ON deposit (approved);
      CREATE INDEX IF NOT EXISTS deposit_created_date_idx ON deposit (created_date);
    `,
  },
  {
    name: "create_clients_table",
    sql: `
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT,
        address TEXT,
        contacts TEXT,
        comment TEXT,

        active BOOLEAN DEFAULT 1,

        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,

        app_connection TEXT,
        row_version INTEGER DEFAULT 1,
        row_deleted TEXT DEFAULT 'null',
        sync_status TEXT DEFAULT 'PENDING'
      );
      
      CREATE INDEX IF NOT EXISTS clients_active_idx ON clients (active);
      CREATE INDEX IF NOT EXISTS clients_name_idx ON clients (name);
    `,
  },
  {
    name: "create_sync_retry_queue",
    sql: `CREATE TABLE IF NOT EXISTS sync_retry_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT,
            payload TEXT,
            retry_count INTEGER DEFAULT 0,
            last_error TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
          );
    `,
  },

  {
    name: "create_settings_table",
    sql: `
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT,
        value TEXT,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: "create_updated_at_sync_table",
    sql: `
      CREATE TABLE IF NOT EXISTS updated_at_sync (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT,
        last_sync TEXT,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
  }
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
          console.error("Error reading migrations table", err);
          reject(err);
          return;
        }

        const appliedMigrations = new Set(rows.map((row: any) => row.name));
        console.log(`[Migrations] Found ${appliedMigrations.size} applied migrations.`);

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
          console.log(`[Migrations] Running migration: ${migration.name}`);
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
