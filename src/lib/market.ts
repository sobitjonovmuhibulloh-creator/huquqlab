import type { ExamMeta, Product } from "@/types/exam";

/** Mahsulot (paket) krediti shu testga ishlatilishi mumkinmi — server va klient uchun umumiy qoida */
export function productCovers(product: Pick<Product, "categories">, exam: Pick<ExamMeta, "category">) {
  return product.categories.length === 0 || product.categories.includes(exam.category);
}

/** Bitta testni sotib olish narxi: testning o'z narxi (bazadan) bo'lsa — u, aks holda mahsulot narxi */
export function priceForExam(product: Product, exam: Pick<ExamMeta, "price">) {
  return product.kind === "single" && exam.price ? exam.price : product.price;
}

/**
 * Testni bitta xarid bilan ochadigan mahsulot. Kategoriyaga xos mahsulot (masalan, mock — 5 000)
 * umumiy «1 ta test»dan ustun. Server checkout'da aynan shu mahsulotni talab qiladi,
 * shuning uchun arzonroq umumiy mahsulot bilan qimmatroq testni ochib bo'lmaydi.
 */
export function singlePrice(products: Product[], exam: ExamMeta): Product | undefined {
  return products
    .filter((p) => p.active && p.kind === "single" && productCovers(p, exam))
    .sort((a, b) => b.categories.length - a.categories.length || a.price - b.price)
    .map((p) => ({ ...p, price: priceForExam(p, exam) }))[0];
}
