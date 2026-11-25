import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers/Providers";
import { themeInitScript } from "@/components/providers/ThemeProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HuquqLab — Huquqingni bil. Kelajagingni himoya qil.",
    template: "%s · HuquqLab",
  },
  description:
    "O‘zbekiston maktab o‘quvchilari uchun interaktiv huquqiy ta’lim platformasi: sodda darslar, hayotiy vaziyatlar, simulyatorlar va testlar.",
  keywords: ["huquq", "maktab", "o‘quvchi", "O‘zbekiston", "huquqiy ta’lim", "simulyator", "test"],
  openGraph: { type: "website", locale: "uz_UZ", siteName: "HuquqLab" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1222" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} ${manrope.variable} min-h-screen antialiased`}>
        <Providers>
          <a
            href="#main"
            className="sr-only z-[100] rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Asosiy mazmunga o‘tish
          </a>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
