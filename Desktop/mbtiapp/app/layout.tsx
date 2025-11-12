import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your College Sorting Hat",
  description: "Find the perfect BYU college for your personality type",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050714] text-slate-100`}>
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#2b2060,_transparent_55%),radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.25),_transparent_35%),radial-gradient(circle_at_80%_10%,_rgba(255,255,255,0.15),_transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#050714]/70 to-[#050714]" />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
