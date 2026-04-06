import type { Metadata } from "next";
import { AppThemeProvider } from "@/components/app-theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next MUI Template",
  description:
    "Next.js starter with Material UI, React Hook Form, Yup, and MUI icons",
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
