import { Paper, type PaperProps } from "@mui/material";

export function SectionCard({ sx, children, ...props }: PaperProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}
