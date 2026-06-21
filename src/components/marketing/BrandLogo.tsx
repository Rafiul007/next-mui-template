import { Box, Stack, Typography } from "@mui/material";
import { BRAND, COMPANY } from "@/lib/marketing/landing-content";

type BrandMarkProps = {
  size?: number;
  /** Fill colour of the brain silhouette. */
  color?: string;
  /** Colour of the inner fold lines. */
  foldColor?: string;
};

/**
 * BongoBrain brain emblem, drawn inline so the site renders without a binary
 * asset. Swap for the official PNG by replacing this component's <svg> with a
 * next/image pointing at /public.
 */
export function BrandMark({
  size = 40,
  color = BRAND.primary,
  foldColor = "#ffffff",
}: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={`${COMPANY.parent} logo`}
    >
      <path
        d="M32 11C28 7 21 8 19 13C13 12 9 17 12 22C7 25 7 32 12 35C9 40 12 46 18 46C19 51 26 53 32 50C38 53 45 51 46 46C52 46 55 40 52 35C57 32 57 25 52 22C55 17 51 12 45 13C43 8 36 7 32 11Z"
        fill={color}
      />
      <g
        stroke={foldColor}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.92}
      >
        <path d="M32 12C30 18 34 24 31 30C28 36 33 42 32 50" />
        <path d="M20 20C24 22 24 26 21 28" />
        <path d="M17 34C21 34 24 37 22 40" />
        <path d="M44 20C40 22 40 26 43 28" />
        <path d="M47 34C43 34 40 37 42 40" />
      </g>
    </svg>
  );
}

type BrandLogoProps = {
  /** Render light text for use on dark backgrounds. */
  onDark?: boolean;
  /** Show the "by BongoBrain" parent line. */
  showParent?: boolean;
  markSize?: number;
};

export function BrandLogo({
  onDark = false,
  showParent = true,
  markSize = 40,
}: BrandLogoProps) {
  const titleColor = onDark ? "#ffffff" : BRAND.ink;
  const parentColor = onDark ? "rgba(255,255,255,0.66)" : BRAND.body;

  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <BrandMark
        size={markSize}
        color={onDark ? "#ffffff" : BRAND.primary}
        foldColor={onDark ? BRAND.ink : "#ffffff"}
      />
      <Box sx={{ lineHeight: 1 }}>
        <Typography
          component="span"
          sx={{
            display: "block",
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: -0.4,
            color: titleColor,
          }}
        >
          {COMPANY.product}
        </Typography>
        {showParent ? (
          <Typography
            component="span"
            sx={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.2,
              color: parentColor,
            }}
          >
            by {COMPANY.parent}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}
