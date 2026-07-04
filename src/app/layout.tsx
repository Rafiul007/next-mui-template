import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppThemeProvider } from "@/components/app-theme-provider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BongoEdu360",
  description: "BongoEdu360 dashboard, authentication, and admin pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body suppressHydrationWarning>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
