import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/app-theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Project",
  description: "Basic home, login, signup, and dashboard pages.",
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
