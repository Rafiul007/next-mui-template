import { alpha, createTheme } from "@mui/material/styles";

// Solid brand blue. Name kept for backwards compatibility with existing usages.
export const primaryGradient = "#2563eb";

export const appTheme = createTheme({
  shape: {
    borderRadius: 8,
  },
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0f172a",
    },
    background: {
      default: "#eef2f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#5b6b79",
    },
    divider: alpha("#0f172a", 0.08),
    success: {
      main: "#2563eb",
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#ef4444",
    },
    info: {
      main: "#0ea5e9",
    },
  },
  typography: {
    fontSize: 13,
    fontFamily:
      '"Inter", "Manrope", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: -1,
    },
    h4: {
      fontWeight: 800,
      letterSpacing: -0.8,
    },
    h5: {
      fontWeight: 750,
      letterSpacing: -0.4,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: -0.2,
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "#eef2f9",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${alpha("#0f172a", 0.08)}`,
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 42,
          paddingInline: 16,
        },
        containedPrimary: {
          backgroundImage: "none",
          backgroundColor: primaryGradient,
          boxShadow: "0 12px 24px rgba(37, 99, 235, 0.24)",
          "&:hover": {
            backgroundImage: "none",
            backgroundColor: "#1d4ed8",
            boxShadow: "0 14px 28px rgba(37, 99, 235, 0.3)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: alpha("#ffffff", 0.72),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          overflow: "hidden",
        },
      },
    },
  },
});
