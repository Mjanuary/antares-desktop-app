import { z } from "zod";

// --- Helpers ---

// Transforms "12.00" -> 12.00, or numbers to numbers. Returns 0 if invalid.
const stringToNumber = (val: string | number | null | undefined): number => {
  if (val === null || val === undefined || val === "") return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Zod helper: Expect string or number from API, transform to number for DB
const apiNumberField = z
  .union([z.string(), z.number()])
  .nullable()
  .optional()
  .transform(stringToNumber);

// Zod helper: Expect boolean or 0/1 from API, transform to 0/1 for SQLite
const apiBooleanField = z
  .union([z.boolean(), z.number(), z.string()])
  .nullable()
  .optional()
  .transform((val) => {
    if (val === true || val === 1 || val === "1" || val === "true") return 1;
    return 0;
  });

// Zod helper: Expect array/object from API, transform to JSON string for DB
const apiJsonField = z
  .any()
  .nullable()
  .optional()
  .transform((val) => {
    if (val === null || val === undefined) return null; // or "[]" / "{}" ? DB defaults usually handle null or generic text
    if (typeof val === "string") return val; // Already stringified?
    return JSON.stringify(val);
  });

// Zod helper: Date field (usually ISO string), preserve as string for SQLite
const apiDateField = z.string().nullable().optional();

// Zod helper: Always force "SYNCED" status for incoming data
const apiSyncStatusField = z.any().transform(() => "SYNCED");

// --- API Schemas with Transforms ---

const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string(),
  emailVerified: apiBooleanField,
  image: z.string().nullable().optional(),
  blocked: apiBooleanField,
  created_at: apiDateField,
  updated_at: apiDateField,
  sync_status: apiSyncStatusField,
});

const spendingSchema = z.object({
  id: z.string(),
  title: z.string(),
  spending_category_id: z.string().nullable().optional(),
  spending_type: z.string().nullable().optional(),
  deposit_id: z.string().nullable().optional(),
  rate_RWF: apiNumberField,
  rate_CDF: apiNumberField,
  branch_currency: z.string().nullable().optional(),
  cash_USD: apiNumberField,
  cash_CDF: apiNumberField,
  cash_RWF: apiNumberField,
  total_bc: apiNumberField,
  branch_id: z.string().nullable().optional(),
  recorded_by: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  approved: apiBooleanField,
  active: apiBooleanField,
  history: apiJsonField,
  created_date: apiDateField,
  updated_date: apiDateField,
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

const spendingCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
  recorded_by: z.string().nullable().optional(),
  status: apiBooleanField,
  repeat: z.string().nullable().optional(),
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  created_date: apiDateField,
  updated_date: apiDateField,
  sync_status: apiSyncStatusField,
});

const houseSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contacts: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  active: apiBooleanField,
  created_date: apiDateField,
  updated_date: apiDateField,
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

const clientSchema = z.object({
  id: z.string(),
  names: z.string().optional(),
  phone_number: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  other_phone_numbers: apiJsonField,
  recorded_by: z.string().nullable().optional(),
  recorded_branch: z.string().nullable().optional(),
  created_date: apiDateField,
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  active: apiBooleanField,
  stand_alone: apiBooleanField,
  created_by: z.string().nullable().optional(),
  created_time: apiDateField,
  updated_time: apiDateField,
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

const subCategorySchema = z.object({
  id: z.string(),
  category_id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  active: apiBooleanField,
  created_by: z.string().nullable().optional(),
  created_time: apiDateField,
  updated_time: apiDateField,
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

// PRODUCTS: JSON arrays for colors, paper_size, etc.
const productSchema = z.object({
  product_id: z.string(),
  branch_product_id: z.string().nullable().optional(),
  name: z.string(),
  code: z.string().nullable().optional(),
  qr_code: z.string().nullable().optional(),
  bar_code: z.string().nullable().optional(),
  // API sends arrays, DB wants strings
  colors: apiJsonField,
  paper_colors: apiJsonField,
  paper_size: apiJsonField,
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  cover_image_url: z.string().nullable().optional(),
  diver_category_id: z.string().nullable().optional(),
  diver_sub_category_id: z.string().nullable().optional(),
  custom_diver: apiBooleanField,
  has_papers: apiBooleanField,
  is_printable: apiBooleanField,
  product_active: apiBooleanField,
  branch_active: apiBooleanField,
  price_CDF: apiNumberField,
  price_RWF: apiNumberField,
  price_USD: apiNumberField,
  stock_quantity: apiNumberField,
  app_connection: z.string().nullable().optional(),
  product_row_version: z.number().optional(),
  branch_row_version: z.number().optional(),
  product_row_deleted: apiJsonField,
  branch_row_deleted: apiJsonField,
  created_time: apiDateField,
  product_updated_time: apiDateField,
  branch_updated_time: apiDateField,
  latest_update: apiDateField,
  sync_status: apiSyncStatusField,
});

const saleSchema = z.object({
  id: z.string(),
  parent_sale_id: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
  client_id: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  client_phone: z.string().nullable().optional(),
  house_id: z.string().nullable().optional(),
  transaction_date: apiDateField,
  payment_currency: z.string().nullable().optional(),
  branch_currency: z.string().nullable().optional(),
  price_total: apiNumberField,
  price_total_bc: apiNumberField,
  rate_RWF: apiNumberField,
  rate_CDF: apiNumberField,
  payed_USD: apiNumberField,
  payed_CDF: apiNumberField,
  payed_RWF: apiNumberField,
  total_payed_cash: apiNumberField,
  total_payed_cash_bc: apiNumberField,
  balance: apiNumberField,
  balance_bc: apiNumberField,
  comment: z.string().nullable().optional(),
  deposit_id: z.string().nullable().optional(),
  receipt_id: z.string().nullable().optional(),
  total_products: apiNumberField,
  recorded_by: z.string().nullable().optional(),
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  created_time: apiDateField,
  updated_time: apiDateField,
  sync_status: apiSyncStatusField,
});

const salesItemSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  product_id: z.string(),
  product_to_branch_id: z.string().nullable().optional(),
  recorded_by: z.string().nullable().optional(),
  quantity: apiNumberField,
  bonus: apiNumberField,
  price_unit: apiNumberField,
  price_total: apiNumberField,
  price_total_bc: apiNumberField,
  printed: apiBooleanField,
  designed: apiBooleanField,
  designed_by: z.string().nullable().optional(),
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  created_time: apiDateField,
  updated_time: apiDateField,
  sync_status: apiSyncStatusField,
});

const depositSchema = z.object({
  id: z.string(),
  created_date: apiDateField,
  updated_date: apiDateField,
  branch_id: z.string().nullable().optional(),
  recorded_by: z.string().nullable().optional(),
  approved_by: z.string().nullable().optional(),
  branch_currency: z.string().nullable().optional(),
  decision: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  approved: apiBooleanField,
  rate_RWF: apiNumberField,
  rate_CDF: apiNumberField,
  cash_USD: apiNumberField,
  cash_CDF: apiNumberField,
  cash_RWF: apiNumberField,
  total_bc: apiNumberField,
  history: apiJsonField,
  deposit_summary: apiJsonField,
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

// --- New Schemas ---

const branchSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contacts: z.string().nullable().optional(),
  branch_currency: z.string().nullable().optional(),
  supported_currency: z.string().nullable().optional(),
  rate_in: apiJsonField,
  rate_out: apiJsonField,
  active: apiBooleanField,
  active_store: apiBooleanField,
  show_rate_card: apiBooleanField,
  remember_rate_on_sale: apiBooleanField,
  remember_price_on_re_sale: apiBooleanField,
  show_rate_on_all_forms: apiBooleanField,
  created_date: apiDateField,
  updated_date: apiDateField,
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

const usersToHousesSchema = z.object({
  user_id: z.string(),
  house_id: z.string(),
  role_id: z.string().nullable().optional(),
  created_date: apiDateField,
  update_date: apiDateField,
  active: apiBooleanField,
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

const balanceSchema = z.object({
  id: z.string(),
  balance_parent_id: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  product_id: z.string().nullable().optional(),
  product_type: z.string().nullable().optional(),
  payment_currency: z.string().nullable().optional(),
  branch_currency: z.string().nullable().optional(),
  rate_RWF: apiNumberField,
  rate_CDF: apiNumberField,
  amount: apiNumberField,
  amount_bc: apiNumberField,
  payed_amount: apiNumberField,
  payed_amount_bc: apiNumberField,
  sale_id: z.string().nullable().optional(),
  parent_sale_id: z.string().nullable().optional(),
  recorded_date: apiDateField,
  recorded_by: z.string().nullable().optional(),
  pay_date: apiDateField,
  branch_id: z.string().nullable().optional(),
  house_id: z.string().nullable().optional(),
  active: apiBooleanField,
  balance_status: z.string().nullable().optional(),
  created_date: apiDateField,
  updated_date: apiDateField,
  payment_date_history: apiJsonField,
  balance_contacts: z.string().nullable().optional(),
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

const balancePaymentSchema = z.object({
  id: z.string(),
  balance_id: z.string().nullable().optional(),
  sale_id: z.string().nullable().optional(),
  product_type: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
  house_id: z.string().nullable().optional(),
  recorded_date: apiDateField,
  recorded_by: z.string().nullable().optional(),
  active: apiBooleanField,
  payment_currency: z.string().nullable().optional(),
  branch_currency: z.string().nullable().optional(),
  rate_RWF: apiNumberField,
  rate_CDF: apiNumberField,
  payed_USD: apiNumberField,
  payed_CDF: apiNumberField,
  payed_RWF: apiNumberField,
  total_payed: apiNumberField,
  total_payed_bc: apiNumberField,
  created_date: apiDateField,
  updated_date: apiDateField,
  deposit_id: z.string().nullable().optional(),
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional(),
  row_deleted: apiJsonField,
  sync_status: apiSyncStatusField,
});

// --- Map Table Names to Schemas ---

const schemas: Record<string, z.ZodType<any>> = {
  users: userSchema,
  spendings: spendingSchema,
  spending_categories: spendingCategorySchema,
  houses: houseSchema,
  clients: clientSchema,
  categories: categorySchema,
  sub_categories: subCategorySchema,
  products: productSchema,
  sales: saleSchema,
  sales_items: salesItemSchema,
  deposit: depositSchema,
  branch: branchSchema,
  users_to_houses: usersToHousesSchema,
  balances: balanceSchema,
  balance_payments: balancePaymentSchema,
};

// --- Validation Function ---

export function validateAndTransformData(
  table: string,
  data: any[],
): { isValid: boolean; transformed: any[]; error?: string } {
  const schema = schemas[table];

  if (!schema) {
    return {
      isValid: false,
      transformed: [],
      error: `No schema defined for table: ${table}`,
    };
  }

  // Use strict() if we want to strip unknown fields, or passthrough() to allow them.
  // Given we want to match the table schema, we should probably strip unknown fields
  // so we don't try to insert columns that don't exist.
  // Zod's default behavior is to strip unknown keys.
  const arraySchema = z.array(schema);

  const result = arraySchema.safeParse(data);

  if (!result.success) {
    // .format() is reported deprecated, so we map issues manually
    const formatted = result.error.issues.map(
      (issue: z.ZodError["issues"][number]) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      }),
    );
    const errorMsg = JSON.stringify(formatted, null, 2);

    return {
      isValid: false,
      transformed: [],
      error: `Validation failed for table ${table}: ${errorMsg}`,
    };
  }

  return {
    isValid: true,
    transformed: result.data,
  };
}
