export const appTableList = [
  "users",
  "spendings",
  "houses",
  "clients",
  "spending_categories",
  "categories",
  "sub_categories",
  "products",
  "sales",
  "sales_items",
  "deposit",
];

export const pushTableList = [
  "spendings",
  "clients",
  "deposit",
  "sales",
  "sales_items",
];

export const SettingsSeeds = {
  BASE_URL: {
    key: "BASE_URL",
    value: "https://antares-theta.vercel.app/api/desktop",
  },
} as const;

export type SettingsKey = keyof typeof SettingsSeeds;

export enum SyncType {
  Push = "push",
  Pull = "pull",
}

export enum SyncStatus {
  Synced = "SYNCED",
  Pending = "PENDING",
}

export const IMAGE_STORAGE_FOLDER = "product_images";
