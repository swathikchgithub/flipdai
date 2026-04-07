import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlashAI — AI Flash Card Generator",
  description: "AI-powered flash cards with voice support for any topic",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
