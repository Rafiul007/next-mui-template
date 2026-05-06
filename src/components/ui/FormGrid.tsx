import { Box, type BoxProps } from "@mui/material";

export function FormGrid({ sx, children, ...props }: BoxProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
