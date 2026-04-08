import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  shape: {
    borderRadius: 0,
  },
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
});
