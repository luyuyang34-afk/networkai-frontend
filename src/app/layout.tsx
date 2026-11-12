import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NetworkAI",
  description: "Share and discover creative work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav
            aria-label="Main navigation"
            className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3 sm:px-8"
          >
            <Link href="/" className="font-semibold">
              NetworkAI
            </Link>
            <Link href="/" aria-current="page" className="text-sm underline">
              Discover
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
