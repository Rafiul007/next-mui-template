import { alpha, createTheme } from "@mui/material/styles";

export const primaryGradient =
  "linear-gradient(135deg, #22c55e 0%, #10b981 48%, #14b8a6 100%)";

export const appTheme = createTheme({
  shape: {
    borderRadius: 8,
  },
  palette: {
    mode: "light",
    primary: {
      main: "#10b981",
      light: "#34d399",
      dark: "#047857",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0f172a",
    },
    background: {
      default: "#eef4f1",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#5b6b79",
    },
    divider: alpha("#0f172a", 0.08),
    success: {
      main: "#10b981",
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
          background:
            "radial-gradient(circle at top left, rgba(16,185,129,0.08), transparent 24%), #eef4f1",
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
          backgroundImage: primaryGradient,
          boxShadow: "0 12px 24px rgba(16, 185, 129, 0.24)",
          "&:hover": {
            backgroundImage: primaryGradient,
            boxShadow: "0 14px 28px rgba(16, 185, 129, 0.3)",
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
