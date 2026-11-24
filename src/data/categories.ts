import type { Category } from "@/types";

export const categories: Category[] = [
  { id: "inson-huquqlari", name: "Inson huquqlari", description: "Bola va inson huquqlari, ularning kafolatlari", icon: "HeartHandshake", color: "rose" },
  { id: "talim", name: "Ta’lim", description: "O‘quvchining huquq va majburiyatlari", icon: "GraduationCap", color: "indigo" },
  { id: "mulk", name: "Mulk huquqi", description: "Mulk, topilma va mas’uliyat", icon: "Wallet", color: "amber" },
  { id: "raqamli", name: "Raqamli huquq", description: "Internet, shaxsiy ma’lumotlar va kiberxavfsizlik", icon: "Smartphone", color: "sky" },
  { id: "fuqarolik", name: "Fuqarolik huquqi", description: "Shartnoma, xarid va iste’molchi huquqlari", icon: "ShoppingBag", color: "teal" },
  { id: "mehnat", name: "Mehnat huquqi", description: "Voyaga yetmaganlar mehnati va kafolatlar", icon: "Briefcase", color: "orange" },
  { id: "javobgarlik", name: "Javobgarlik", description: "Huquqbuzarlik turlari va yuridik javobgarlik", icon: "Scale", color: "violet" },
  { id: "davlat", name: "Davlat va huquq", description: "Konstitutsiya, saylov va fuqarolik", icon: "Landmark", color: "emerald" },
  { id: "xavfsizlik", name: "Xavfsizlik", description: "Yo‘l harakati va shaxsiy xavfsizlik", icon: "ShieldCheck", color: "lime" },
  { id: "oila", name: "Oila huquqi", description: "Oila, ota-ona va bola munosabatlari", icon: "Home", color: "fuchsia" },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  Category["id"],
  Category
>;
