import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Sales System — B2B Управление продажами",
  description: "Профессиональная система управления продажами для бизнеса в Узбекистане",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#1e1e2e", color: "#fff", borderRadius: "12px" },
            success: { iconTheme: { primary: "#7c3aed", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
