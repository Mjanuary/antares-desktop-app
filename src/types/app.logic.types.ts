import { z } from "zod";

// ==========================================
// 1. CENTRALIZED ENUMS
// ==========================================

export enum RoleLevel {
  USER = "user",
  ADMIN = "admin",
  BRANCH = "branch",
  HOUSE = "house",
}

// Consolidated Currency Enum
export enum CurrencyEnum {
  RWF = "RWF",
  CDF = "CDF",
  USD = "USD",
}

export enum HistoryType {
  ADDITION = "addition",
  SUBTRACTION = "subtraction",
}

export enum BalanceStatusEnum {
  WAITING = "WAITING",
  COMPLETED = "COMPLETED",
  HALF_PAYED = "HALF_PAYED",
  IGNORED = "IGNORED",
}

export enum BalanceProductType {
  INVITATION = "INVITATION",
  DIVERS = "DIVERS",
  OTHER = "OTHER",
}

export enum ProductType {
  INVITATION = "INVITATION",
  DIVERS = "DIVERS",
}

export enum SpendingTypeEnum {
  CASH_OUT = "CASH_OUT",
  CASH_IN = "CASH_IN",
  SPENDING = "SPENDING",
}

export enum StockQuantityLog {
  STOCK_IN = "STOCK_IN",
  STOCK_OUT = "STOCK_OUT",
  IMPORTED_SYSTEM_IN = "IMPORTED_SYSTEM_IN",
  IMPORTED_SYSTEM_OUT = "IMPORTED_SYSTEM_OUT",
  DATA_CLEANING_ADD = "DATA_CLEANING_ADD",
  DATA_CLEANING_OUT = "DATA_CLEANING_OUT",
}

export enum SpendingRepeatType {
  OCCASIONALLY = "OCCASIONALLY",
  WEAKLY = "WEAKLY",
  MONTHLY = "MONTHLY",
  DAILY = "DAILY",
}

export enum DepositDecisionEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum GenderClientEnum {
  male = "male",
  female = "female",
}

// ==========================================
// 2. HELPER INTERFACES & REGEX
// ==========================================

export interface BranchRate {
  RWF?: number;
  CDF?: number;
}

export const POSITIVE_VALUE_REGEX = /^(0|[1-9]\d*)(\.\d+)?$/;
export const SCAN_PRODUCT_REDIRECT_OPTION = "scan-product-redirect-option";

// ==========================================
// 3. REUSABLE SCHEMAS
// ==========================================

export const Delete__ValidationSchema = z.object({
  date: z.date(),
  user_id: z.string(),
  connection_id: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  can_restore: z.boolean(),
});

export type DeleteColumnFormatterType = z.infer<
  typeof Delete__ValidationSchema
>;

export const FileItem__ValidationSchema = z.object({
  type: z.string(),
  file_key: z.string(),
  url: z.string(),
});
export type FileItem = z.infer<typeof FileItem__ValidationSchema>;

export const PaperSize__ValidationSchema = z.object({
  width: z.number(),
  height: z.number(),
});
export type PaperSizeType = z.infer<typeof PaperSize__ValidationSchema>;

// ==========================================
// 4. CORE ZOD SCHEMAS
// ==========================================

// --- DIVERS & CATEGORIES ---

export const DiversCategory__ValidationSchema = z.object({
  id: z.string().trim().min(2, { message: "Id is required" }),
  name: z.string().trim().min(2, { message: "Category name is required" }),
  description: z.string().optional(),
  created_by: z.string().optional(),
  created_date: z.date().optional(),
  update_date: z.date().optional(),
  active: z.boolean(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

export const DiverSubCategory__ValidationSchema = z.object({
  id: z.string().trim().min(2, { message: "Id is required" }),
  name: z.string().trim().min(2, { message: "Category name is required" }),
  category_id: z.string().nullable(),
  description: z.string().optional(),
  created_by: z.string().optional(),
  created_date: z.date().optional(),
  update_date: z.date().optional(),
  active: z.boolean(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

export const Diver__ValidationSchema = z.object({
  id: z.string().min(1, { message: "err-id-required" }),
  name: z.string().min(1, { message: "err-name-required" }),
  code: z.string().optional(),
  colors: z.array(z.string().min(1, { message: "err-color-required" })),
  paper_colors: z
    .array(z.string().min(1, { message: "err-color-required" }))
    .optional(),
  description: z.string(),
  notes: z.string(),
  cover_image_url: z.string().min(1, { message: "err-cover-required" }),
  images: z.array(FileItem__ValidationSchema),
  paper_size: z.array(PaperSize__ValidationSchema).optional(),
  active: z.boolean(),
  public: z.boolean(),
  custom_diver: z.boolean(),
  diver_category_id: z.string().min(1, { message: "err-category-required" }),
  diver_sub_category_id: z.string().nullable(),
  created_by: z.string().min(1, { message: "err-user-required" }),
  created_time: z.date().optional(),
  updated_time: z.date().optional(),
  bar_code: z.string().optional(),
  qr_code: z.string().optional(),
  thumbnail: z.string().optional(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

export const DiversToBranch__ValidationSchema = z.object({
  id: z.string(),
  diver_id: z.string().min(1, { message: "Required" }),
  branch_id: z.string().min(1, { message: "Required" }),
  stock_quantity: z.number().int(),
  price_RWF: z.number(),
  price_USD: z.number(),
  price_CDF: z.number(),
  created_by: z.string().optional(),
  created_time: z.date().optional(),
  updated_time: z.date().optional(),
  active: z.boolean(),
  public: z.boolean(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

export const DiverSale__ValidationSchema = z.object({
  id: z.string(),
  sale_id: z.string().nullable().optional(),
  parent_sale_id: z.string().nullable().optional(),
  branch_id: z.string().nullable(),
  client_id: z.string().optional().nullable(),
  client_name: z.string().nullable(),
  client_phone: z.string().nullable(),
  house_id: z.string().nullable(),
  transaction_date: z.date(),
  payment_currency: z.nativeEnum(CurrencyEnum),
  price_total: z.number(),
  price_total_bc: z.number(),
  rate_RWF: z.number(),
  rate_CDF: z.number(),
  payed_USD: z.number(),
  payed_CDF: z.number(),
  payed_RWF: z.number(),
  total_payed_cash: z.number(),
  total_payed_cash_bc: z.number(),
  balance: z.number(),
  balance_bc: z.number(),
  comment: z.string(),
  recorded_by: z.string(),
  created_time: z.date(),
  updated_time: z.date(),
  deposit_id: z.string().optional().nullable(),
  total_products: z.number(),
  branch_currency: z.nativeEnum(CurrencyEnum),
  receipt_id: z.string().nullable().default(null),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

export const DiverSaleItem__ValidationSchema = z.object({
  id: z.string(),
  sale_id: z.string(),
  price_total: z.number(),
  price_total_bc: z.number(),
  quantity: z.number(),
  price_unit: z.number(),
  printed: z.boolean(),
  designed: z.boolean(),
  designed_by: z.string().optional(),
  bonus: z.number().default(0),
  product_id: z.string(),
  product_to_branch_id: z.string(),
  recorded_by: z.string(),
  created_time: z.date(),
  updated_time: z.date(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

// --- BRANCH & HOUSE ---

// Ideally, define RateSchema instead of using z.any()
const RateSchema = z
  .object({
    RWF: z.number().optional(),
    CDF: z.number().optional(),
    USD: z.number().optional(),
  })
  .optional();

export const Branch__ValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(4, { message: "Minimum 4 characters" }),
  country: z
    .string()
    .trim()
    .min(2, { message: "Country is required" })
    .nullable(),
  address: z.string(),
  contacts: z.string(),
  branch_currency: z.nativeEnum(CurrencyEnum),
  supported_currency: z.string(),
  rate_in: RateSchema.or(z.any()), // Prefer strict schema, fallback to any if structure varies
  rate_out: RateSchema.or(z.any()),
  active: z.boolean(),
  active_store: z.boolean(),
  created_date: z.date().optional(),
  updated_date: z.date().optional(),
  show_rate_card: z.boolean(),
  remember_rate_on_sale: z.boolean(),
  remember_price_on_re_sale: z.boolean(),
  show_rate_on_all_forms: z.boolean(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

export const House__ValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(4, { message: "Minimum 4 characters" }),
  country: z.string().trim().min(2, { message: "Country is required" }),
  address: z.string().optional(),
  contacts: z.string().optional(),
  active: z.boolean().optional(),
  comment: z.string().optional(),
  created_date: z.date().optional(),
  updated_date: z.date().optional(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

// --- SPENDING ---

export const SpendingCategory__ValidationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  created_date: z.date().default(() => new Date()),
  updated_date: z.date().default(() => new Date()),
  branch_id: z.string().uuid(),
  recorded_by: z.string(),
  status: z.boolean().default(true),
  repeat: z
    .nativeEnum(SpendingRepeatType)
    .default(SpendingRepeatType.OCCASIONALLY), // FIXED: nativeEnum
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

export const Spending__ValidationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(4, { message: "Minimum 4 characters" }),
  spending_category_id: z.string().uuid(),
  spending_type: z.nativeEnum(SpendingTypeEnum), // FIXED: nativeEnum
  rate_RWF: z.number().optional(),
  rate_CDF: z.number().optional(),
  branch_currency: z.nativeEnum(CurrencyEnum),
  cash_USD: z.number(),
  cash_CDF: z.number(),
  cash_RWF: z.number(),
  total_bc: z.number(),
  branch_id: z.string().uuid(),
  recorded_by: z.string(),
  comment: z.string().optional(),
  approved: z.boolean().default(false),
  active: z.boolean().default(true),
  history: z.any().optional(),
  created_date: z.date().default(() => new Date()),
  updated_date: z.date().default(() => new Date()),
  deposit_id: z.string().uuid().optional().nullable(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

// --- DEPOSIT ---

export const Deposit__ValidationSchema = z.object({
  id: z.string().uuid(),
  created_date: z.date().default(() => new Date()),
  updated_date: z.date().default(() => new Date()),
  rate_RWF: z.number(),
  rate_CDF: z.number(),
  cash_USD: z.number(),
  cash_CDF: z.number(),
  cash_RWF: z.number(),
  total_bc: z.number(),
  branch_id: z.string().uuid(),
  recorded_by: z.string(),
  branch_currency: z.nativeEnum(CurrencyEnum),
  decision: z.nativeEnum(DepositDecisionEnum).optional(), // FIXED: Use enum
  comment: z.string().optional(),
  approved: z.boolean().default(false),
  history: z.array(z.unknown()).optional(),
  deposit_summary: z.unknown(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

// --- CLIENTS ---

export const Client__ValidationSchema = z.object({
  id: z.string().optional(),
  names: z.string().trim().min(4, { message: "name-required" }),
  phone_number: z.string().trim().min(8, { message: "phone-number-required" }),
  gender: z.nativeEnum(GenderClientEnum),
  address: z.string().nullable(),
  other_phone_numbers: z.array(z.string()).nullable(),
  email: z.string().nullable(),
  recorded_by: z.string(),
  recorded_branch: z.string(),
  created_date: z.date().optional(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

// --- BALANCE ---

export const Balance__ValidationSchema = z.object({
  id: z.string(),
  balance_parent_id: z.string().nullable(),
  client_name: z.string(),
  product_type: z.nativeEnum(BalanceProductType),
  product_id: z.string().nullable(),
  payment_currency: z.nativeEnum(CurrencyEnum),
  branch_currency: z.nativeEnum(CurrencyEnum),
  rate_RWF: z.number(),
  rate_CDF: z.number(),
  amount: z.number(),
  amount_bc: z.number(),
  payed_amount: z.number(),
  payed_amount_bc: z.number(),
  sale_id: z.string().nullable(),
  parent_sale_id: z.string().nullable(),
  recorded_date: z.date(),
  pay_date: z.date(),
  branch_id: z.string(),
  house_id: z.string().nullable(),
  active: z.boolean(),
  balance_status: z.nativeEnum(BalanceStatusEnum),
  created_date: z.date(),
  updated_date: z.date(),
  balance_contacts: z.string(),
  comment: z.string().nullable(),
  recorded_by: z.string().nullable(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

export const BalancePayment__ValidationSchema = z.object({
  id: z.string(),
  balance_id: z.string().nullable(),
  product_type: z.nativeEnum(BalanceProductType),
  sale_id: z.string().nullable(),
  payment_currency: z.nativeEnum(CurrencyEnum),
  branch_currency: z.nativeEnum(CurrencyEnum),
  rate_RWF: z.number(),
  rate_CDF: z.number(),
  total_payed: z.number(),
  total_payed_bc: z.number(),
  payed_USD: z.number(),
  payed_CDF: z.number(),
  payed_RWF: z.number(),
  recorded_date: z.date(),
  recorded_by: z.string(),
  branch_id: z.string(),
  house_id: z.string().nullable(),
  active: z.boolean(),
  created_date: z.date(),
  updated_date: z.date(),
  // sync changes
  app_connection: z.string().nullable().optional(),
  row_version: z.number().optional().default(1),
  row_deleted: Delete__ValidationSchema.nullable().optional(),
  // local columns
  sync_status: z.string().optional(),
});

// ==========================================
// 5. TYPE INFERENCE
// ==========================================

export type DiverType = z.infer<typeof Diver__ValidationSchema>;
export type DiverCategoryType = z.infer<
  typeof DiversCategory__ValidationSchema
>;
export type DiverSubCategoryType = z.infer<
  typeof DiverSubCategory__ValidationSchema
>;
export type DiversToBranchType_Zod = z.infer<
  typeof DiversToBranch__ValidationSchema
>;
export type DiversSalesType = z.infer<typeof DiverSale__ValidationSchema>;
export type DiversSaleItemType = z.infer<
  typeof DiverSaleItem__ValidationSchema
>;
export type BranchType = z.infer<typeof Branch__ValidationSchema>;
export type HouseType = z.infer<typeof House__ValidationSchema>;
export type SpendingCategoryType_Zod = z.infer<
  typeof SpendingCategory__ValidationSchema
>;
export type SpendingType_Zod = z.infer<typeof Spending__ValidationSchema>;
export type DepositType_Zod = z.infer<typeof Deposit__ValidationSchema>;
export type ClientRecordType_Zod = z.infer<typeof Client__ValidationSchema>;
export type BalancePaymentType_zod = z.infer<
  typeof BalancePayment__ValidationSchema
>;
export type BalanceType = z.infer<typeof Balance__ValidationSchema>;

// Complex Interfaces (Manual)
export interface DiverSearchSellType {
  product_id: string;
  product_to_branch_id: string | null;
  code: string | null;
  image_url: string | null;
  name: string;
  category_name: string | null;
  sub_category_name: string | null;
  colors: string[] | null;
  price_CDF: string | null;
  price_RWF: string | null;
  price_USD: string | null;
  stock_quantity: number | null;
}

export type DiversSaleItemType_Details = DiversSaleItemType &
  DiverSearchSellType;

export interface DepositReport {
  divers: {
    total_RWF: number;
    total_USD: number;
    total_CDF: number;
    total_bc: number;
    total_records: number;
  };
  balance: {
    total_RWF: number;
    total_USD: number;
    total_CDF: number;
    total_bc: number;
    total_records: number;
  };
  expense: {
    total_RWF: number;
    total_USD: number;
    total_CDF: number;
    total_bc: number;
    total_records: number;
  };
  deposit: DepositType_Zod | null;
}

export interface FormError {
  target: string;
  message: string;
}
