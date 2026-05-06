"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#0f172a",
          borderRadius: "12px",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
