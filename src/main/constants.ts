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
  "branch",
  "users_to_houses",
  "balances",
  "balance_payments",
];

export const pushTableList = [
  "spendings",
  "clients",
  "deposit",
  "sales",
  "sales_items",
  "balances",
  "balance_payments",
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

export interface Color {
  english: string;
  french: string;
  colorCode: string;
  keyword: string;
}

export const COLORS: Color[] = [
  {
    english: "Cyan",
    french: "Cyan",
    colorCode: "#00FFFF",
    keyword: "Cyan,Cyan",
  },
  {
    english: "Light Cyan",
    french: "Cyan clair",
    colorCode: "#ACFFFC",
    keyword: "Light Cyan,Cyan clair",
  },
  {
    english: "Magenta",
    french: "Magenta",
    colorCode: "#FF00FF",
    keyword: "Magenta,Magenta",
  },
  {
    english: "Light Magenta",
    french: "Magenta clair",
    colorCode: "#FF77FF",
    keyword: "Light Magenta,Magenta clair",
  },
  {
    english: "Red",
    french: "Rouge",
    colorCode: "#FF0000",
    keyword: "Red,Rouge",
  },
  {
    english: "Blue",
    french: "Bleu",
    colorCode: "#0000FF",
    keyword: "Blue,Bleu",
  },
  {
    english: "Yellow",
    french: "Jaune",
    colorCode: "#FFFF00",
    keyword: "Yellow,Jaune",
  },
  {
    english: "Green",
    french: "Vert",
    colorCode: "#008000",
    keyword: "Green,Vert",
  },
  {
    english: "Orange",
    french: "Orange",
    colorCode: "#FFA500",
    keyword: "Orange,Orange",
  },
  {
    english: "Purple",
    french: "Violet",
    colorCode: "#800080",
    keyword: "Purple,Violet",
  },
  {
    english: "Red-Orange",
    french: "Rouge-Orange",
    colorCode: "#FF4500",
    keyword: "Red-Orange,Rouge-Orange",
  },
  {
    english: "Yellow-Orange",
    french: "Jaune-Orange",
    colorCode: "#FFAE42",
    keyword: "Yellow-Orange,Jaune-Orange",
  },
  {
    english: "Yellow-Green",
    french: "Jaune-Vert",
    colorCode: "#9ACD32",
    keyword: "Yellow-Green,Jaune-Vert",
  },
  {
    english: "Blue-Green",
    french: "Bleu-Vert",
    colorCode: "#0D98BA",
    keyword: "Blue-Green,Bleu-Vert",
  },
  {
    english: "Blue-Violet",
    french: "Bleu-Violet",
    colorCode: "#8A2BE2",
    keyword: "Blue-Violet,Bleu-Violet",
  },
  {
    english: "Red-Violet",
    french: "Rouge-Violet",
    colorCode: "#C71585",
    keyword: "Red-Violet,Rouge-Violet",
  },
  {
    english: "White",
    french: "Blanc",
    colorCode: "#FFFFFF",
    keyword: "White,Blanc",
  },
  {
    english: "Black",
    french: "Noir",
    colorCode: "#000000",
    keyword: "Black,Noir",
  },
  {
    english: "Gray",
    french: "Gris",
    colorCode: "#808080",
    keyword: "Gray,Gris",
  },
  {
    english: "Silver",
    french: "Argent",
    colorCode: "#C0C0C0",
    keyword: "Silver,Argent",
  },
  {
    english: "Charcoal",
    french: "Charbon",
    colorCode: "#36454F",
    keyword: "Charcoal,Charbon",
  },
  {
    english: "Ivory",
    french: "Ivoire",
    colorCode: "#FFFFF0",
    keyword: "Ivory,Ivoire",
  },
  {
    english: "Crimson",
    french: "Cramoisi",
    colorCode: "#DC143C",
    keyword: "Crimson,Cramoisi",
  },
  {
    english: "Maroon",
    french: "Bordeaux",
    colorCode: "#800000",
    keyword: "Maroon,Bordeaux",
  },
  {
    english: "Scarlet",
    french: "Écarlate",
    colorCode: "#FF2400",
    keyword: "Scarlet,Écarlate",
  },
  {
    english: "Rose",
    french: "Rose",
    colorCode: "#FFC0CB",
    keyword: "Rose,Rose",
  },
  {
    english: "Burgundy",
    french: "Bourgogne",
    colorCode: "#800020",
    keyword: "Burgundy,Bourgogne",
  },
  {
    english: "Salmon",
    french: "Saumon",
    colorCode: "#FA8072",
    keyword: "Salmon,Saumon",
  },
  {
    english: "Navy",
    french: "Marine",
    colorCode: "#000080",
    keyword: "Navy,Marine",
  },
  {
    english: "Sky Blue",
    french: "Bleu Ciel",
    colorCode: "#87CEEB",
    keyword: "Sky Blue,Bleu Ciel",
  },
  {
    english: "Azure",
    french: "Azur",
    colorCode: "#007FFF",
    keyword: "Azure,Azur",
  },
  {
    english: "Teal",
    french: "Sarcelle",
    colorCode: "#008080",
    keyword: "Teal,Sarcelle",
  },
  {
    english: "Cobalt",
    french: "Cobalt",
    colorCode: "#0047AB",
    keyword: "Cobalt,Cobalt",
  },
  {
    english: "Turquoise",
    french: "Turquoise",
    colorCode: "#40E0D0",
    keyword: "Turquoise,Turquoise",
  },
  {
    english: "Indigo",
    french: "Indigo",
    colorCode: "#4B0082",
    keyword: "Indigo,Indigo",
  },
  { english: "Gold", french: "Or", colorCode: "#FFD700", keyword: "Gold,Or" },
  {
    english: "Lemon",
    french: "Citron",
    colorCode: "#FFF700",
    keyword: "Lemon,Citron",
  },
  {
    english: "Mustard",
    french: "Moutarde",
    colorCode: "#FFDB58",
    keyword: "Mustard,Moutarde",
  },
  {
    english: "Amber",
    french: "Ambre",
    colorCode: "#FFBF00",
    keyword: "Amber,Ambre",
  },
  {
    english: "Emerald",
    french: "Émeraude",
    colorCode: "#50C878",
    keyword: "Emerald,Émeraude",
  },
  {
    english: "Olive",
    french: "Olive",
    colorCode: "#808000",
    keyword: "Olive,Olive",
  },
  {
    english: "Lime",
    french: "Citron Vert",
    colorCode: "#00FF00",
    keyword: "Lime,Citron Vert",
  },
  {
    english: "Mint",
    french: "Menthe",
    colorCode: "#98FF98",
    keyword: "Mint,Menthe",
  },
  {
    english: "Jade",
    french: "Jade",
    colorCode: "#00A86B",
    keyword: "Jade,Jade",
  },
  {
    english: "Lavender",
    french: "Lavande",
    colorCode: "#E6E6FA",
    keyword: "Lavender,Lavande",
  },
  {
    english: "Mauve",
    french: "Mauve",
    colorCode: "#E0B0FF",
    keyword: "Mauve,Mauve",
  },
  {
    english: "Lilac",
    french: "Lilas",
    colorCode: "#C8A2C8",
    keyword: "Lilac,Lilas",
  },
  {
    english: "Plum",
    french: "Prune",
    colorCode: "#DDA0DD",
    keyword: "Plum,Prune",
  },
  {
    english: "Beige",
    french: "Beige",
    colorCode: "#F5F5DC",
    keyword: "Beige,Beige",
  },
  {
    english: "Tan",
    french: "Fauve",
    colorCode: "#D2B48C",
    keyword: "Tan,Fauve",
  },
  {
    english: "Chocolate",
    french: "Chocolat",
    colorCode: "#D2691E",
    keyword: "Chocolate,Chocolat",
  },
  {
    english: "Chestnut",
    french: "Châtaigne",
    colorCode: "#954535",
    keyword: "Chestnut,Châtaigne",
  },
  {
    english: "Copper",
    french: "Cuivre",
    colorCode: "#B87333",
    keyword: "Copper,Cuivre",
  },
  {
    english: "Peach",
    french: "Pêche",
    colorCode: "#FFE5B4",
    keyword: "Peach,Pêche",
  },
  {
    english: "Tangerine",
    french: "Mandarine",
    colorCode: "#F28500",
    keyword: "Tangerine,Mandarine",
  },
  {
    english: "Apricot",
    french: "Abricot",
    colorCode: "#FBCEB1",
    keyword: "Apricot,Abricot",
  },
  {
    english: "Coral",
    french: "Corail",
    colorCode: "#FF7F50",
    keyword: "Coral,Corail",
  },
  {
    english: "Hot Pink",
    french: "Rose Vif",
    colorCode: "#FF69B4",
    keyword: "Hot Pink,Rose Vif",
  },
  {
    english: "Fuchsia",
    french: "Fuchsia",
    colorCode: "#FF00FF",
    keyword: "Fuchsia,Fuchsia",
  },
  {
    english: "Blush",
    french: "Rose Pâle",
    colorCode: "#FFC1CC",
    keyword: "Blush,Rose Pâle",
  },
  {
    english: "Bubblegum",
    french: "Chewing-gum",
    colorCode: "#FFC1CC",
    keyword: "Bubblegum,Chewing-gum",
  },
];
