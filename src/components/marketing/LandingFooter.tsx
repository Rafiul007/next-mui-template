"use client";

import Link from "next/link";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import { EmailRounded, PhoneRounded } from "@mui/icons-material";
import { BrandLogo } from "./BrandLogo";
import { BRAND, COMPANY, footerColumns } from "@/lib/marketing/landing-content";

export function LandingFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: BRAND.dark, color: "#ffffff" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 4, md: 6 },
            gridTemplateColumns: { xs: "1fr", md: "1.4fr repeat(4, 1fr)" },
          }}
        >
          <Stack spacing={2} sx={{ maxWidth: 320 }}>
            <BrandLogo onDark showParent={false} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14.5, lineHeight: 1.7 }}>
              The complete management platform for coaching centers in Bangladesh.
              Admissions, fees, exams, and staff in one place.
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailRounded sx={{ fontSize: 18, color: BRAND.accent }} />
                <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: 14 }}>
                  {COMPANY.email}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneRounded sx={{ fontSize: 18, color: BRAND.accent }} />
                <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: 14 }}>
                  {COMPANY.phone}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {footerColumns.map((column) => (
            <Stack key={column.title} spacing={1.5}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>
                {column.title}
              </Typography>
              {column.links.map((link) => (
                <Box
                  key={link.label}
                  component={Link}
                  href={link.href}
                  sx={{
                    textDecoration: "none",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 14.5,
                    "&:hover": { color: "#ffffff" },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>
          ))}
        </Box>

        <Divider sx={{ my: { xs: 4, md: 5 }, borderColor: "rgba(255,255,255,0.12)" }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13.5 }}>
            © {new Date().getFullYear()} {COMPANY.product}. A product of{" "}
            {COMPANY.parentLegal}.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box
              component={Link}
              href="#"
              sx={{ textDecoration: "none", color: "rgba(255,255,255,0.6)", fontSize: 13.5, "&:hover": { color: "#fff" } }}
            >
              Privacy
            </Box>
            <Box
              component={Link}
              href="#"
              sx={{ textDecoration: "none", color: "rgba(255,255,255,0.6)", fontSize: 13.5, "&:hover": { color: "#fff" } }}
            >
              Terms
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
