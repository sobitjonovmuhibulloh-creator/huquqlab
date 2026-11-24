import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-8xl font-extrabold text-brand-600/20 dark:text-brand-400/20">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy-900 dark:text-white">Sahifa topilmadi</h1>
      <p className="mt-2 max-w-md text-navy-600 dark:text-navy-400">Siz qidirgan sahifa mavjud emas yoki ko‘chirilgan bo‘lishi mumkin.</p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/">Bosh sahifa</ButtonLink>
        <ButtonLink href="/mavzular" variant="secondary">
          Mavzular
        </ButtonLink>
      </div>
    </div>
  );
}
