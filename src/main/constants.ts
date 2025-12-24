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

export const SettingsSeeds = {
  BASE_URL: {
    key: "BASE_URL",
    value: "https://antares-theta.vercel.app/api/desktop",
  },
} as const;

export type SettingsKey = keyof typeof SettingsSeeds;
