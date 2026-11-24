import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers/Providers";
import { themeInitScript } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "HuquqLab — Huquqingni bil. Kelajagingni himoya qil.",
    template: "%s · HuquqLab",
  },
  description:
    "O‘zbekiston maktab o‘quvchilari uchun interaktiv huquqiy ta’lim platformasi: sodda darslar, hayotiy vaziyatlar, simulyatorlar va testlar.",
  keywords: ["huquq", "maktab", "o‘quvchi", "O‘zbekiston", "huquqiy ta’lim", "simulyator", "test"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
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
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
