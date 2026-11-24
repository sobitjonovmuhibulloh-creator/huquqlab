import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="hl-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#111C30" />
          <stop offset="1" stopColor="#0F6A82" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#hl-g)" />
      {/* Qalqon ichida tarozi — himoya va adolat */}
      <path d="M20 8.5l9 3.4v6.6c0 6-3.8 10.6-9 12.9-5.2-2.3-9-6.9-9-12.9v-6.6l9-3.4z" fill="white" fillOpacity="0.18" />
      <path d="M20 13v14M15 16h10M15 16l-2.6 5.2a2.6 2.6 0 005.2 0L15 16zm10 0l-2.6 5.2a2.6 2.6 0 005.2 0L25 16zM17 27h6" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="HuquqLab bosh sahifa">
      <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105" />
      <span className="font-display text-xl font-extrabold tracking-tight text-navy-900 dark:text-white">
        Huquq<span className="text-brand-700 dark:text-brand-400">Lab</span>
      </span>
    </Link>
  );
}
