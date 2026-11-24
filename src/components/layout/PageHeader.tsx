export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="container-page relative pt-12 pb-8 sm:pt-16">
        {eyebrow && <p className="eyebrow animate-fade-up">{eyebrow}</p>}
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold text-slate-900 animate-fade-up sm:text-5xl dark:text-white">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg text-slate-600 animate-fade-up [animation-delay:80ms] dark:text-slate-300">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
