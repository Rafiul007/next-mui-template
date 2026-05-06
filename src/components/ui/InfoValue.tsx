import { Box, Typography } from "@mui/material";

type InfoValueProps = {
  label: string;
  value: string;
};

export function InfoValue({ label, value }: InfoValueProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );
}
