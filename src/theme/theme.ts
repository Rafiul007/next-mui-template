import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#0f766e",
      light: "#5eead4",
      dark: "#134e4a",
    },
    secondary: {
      main: "#ea580c",
    },
    background: {
      default: "#f3f7f6",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily:
      '"Segoe UI", "Helvetica Neue", Helvetica, Arial, "Noto Sans", sans-serif',
    h1: {
      fontSize: "clamp(2.5rem, 5vw, 4rem)",
      fontWeight: 700,
      lineHeight: 1.05,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
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
  },
});
