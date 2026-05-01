import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/app-theme-provider";
import "./globals.css";

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
    <html lang="en">
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
