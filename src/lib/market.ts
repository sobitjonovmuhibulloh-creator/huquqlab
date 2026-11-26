import type { ExamMeta, Product } from "@/types/exam";

/** Mahsulot (paket) krediti shu testga ishlatilishi mumkinmi — server va klient uchun umumiy qoida */
export function productCovers(product: Pick<Product, "categories">, exam: Pick<ExamMeta, "category">) {
  return product.categories.length === 0 || product.categories.includes(exam.category);
}

/** Bitta testni sotib olish narxi: testning o'z narxi (bazadan) bo'lsa — u, aks holda mahsulot narxi */
export function priceForExam(product: Product, exam: Pick<ExamMeta, "price">) {
  return product.kind === "single" && exam.price ? exam.price : product.price;
}

/** Bitta testni ochishning eng arzon yo'li (1 kreditli mahsulotlar orasidan), narxi test uchun hisoblangan */
export function singlePrice(products: Product[], exam: ExamMeta): Product | undefined {
  return products
    .filter((p) => p.active && p.credits === 1 && productCovers(p, exam))
    .map((p) => ({ ...p, price: priceForExam(p, exam) }))
    .sort((a, b) => a.price - b.price)[0];
}
