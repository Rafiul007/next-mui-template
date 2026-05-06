import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

type CardSectionHeaderProps = {
  icon: ReactNode;
  iconSx?: SxProps<Theme>;
  title: string;
  description?: string;
};

export function CardSectionHeader({
  icon,
  iconSx,
  title,
  description,
}: CardSectionHeaderProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          ...iconSx,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}
