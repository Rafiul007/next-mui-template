import { Box, type BoxProps } from "@mui/material";

export function InfoBox({ sx, children, ...props }: BoxProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "rgba(15, 23, 42, 0.03)",
        border: "1px solid",
        borderColor: "divider",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
