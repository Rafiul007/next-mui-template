import { Box } from "@mui/material";
import type { ReactNode } from "react";

export function FormSubmitRow({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        gridColumn: { md: "1 / -1" },
        display: "flex",
        justifyContent: "flex-end",
        pt: 1,
      }}
    >
      {children}
    </Box>
  );
}
