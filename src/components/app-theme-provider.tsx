"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { PropsWithChildren } from "react";
import { appTheme } from "@/theme/theme";
import { MuiCacheProvider } from "@/components/mui-cache-provider";

export function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <MuiCacheProvider>
      <ThemeProvider theme={appTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </MuiCacheProvider>
  );
}
