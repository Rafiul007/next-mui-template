"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
} from "@mui/material";
import { CloseRounded, MenuRounded } from "@mui/icons-material";
import { BrandLogo } from "./BrandLogo";
import {
  BRAND,
  navLinks,
  outlineButtonSx,
  primaryButtonSx,
} from "@/lib/marketing/landing-content";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#ffffff",
        color: BRAND.ink,
        borderBottom: "1px solid",
        borderColor: scrolled ? BRAND.border : "transparent",
        transition: "border-color 160ms ease",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 2 }}>
          <Box component={Link} href="/" sx={{ textDecoration: "none" }}>
            <BrandLogo />
          </Box>

          <Stack
            direction="row"
            spacing={3.5}
            sx={{ flex: 1, ml: 4, display: { xs: "none", md: "flex" } }}
          >
            {navLinks.map((link) => (
              <Box
                key={link.href}
                component="a"
                href={link.href}
                sx={{
                  textDecoration: "none",
                  color: BRAND.body,
                  fontWeight: 600,
                  fontSize: 15,
                  "&:hover": { color: BRAND.primary },
                }}
              >
                {link.label}
              </Box>
            ))}
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ ml: "auto", display: { xs: "none", md: "flex" } }}
          >
            <Button
              component={Link}
              href="/login"
              variant="text"
              sx={{ color: BRAND.ink, fontSize: 15 }}
            >
              Log in
            </Button>
            <Button
              component={Link}
              href="/signup"
              variant="contained"
              disableElevation
              sx={primaryButtonSx}
            >
              Get started
            </Button>
          </Stack>

          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ ml: "auto", display: { xs: "inline-flex", md: "none" }, color: BRAND.ink }}
            aria-label="Open menu"
          >
            <MenuRounded />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: "min(82vw, 320px)", p: 2.5 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <BrandLogo markSize={36} />
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <CloseRounded />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          {navLinks.map((link) => (
            <Box
              key={link.href}
              component="a"
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              sx={{
                textDecoration: "none",
                color: BRAND.ink,
                fontWeight: 600,
                fontSize: 16,
                py: 1.25,
              }}
            >
              {link.label}
            </Box>
          ))}
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            sx={outlineButtonSx}
            onClick={() => setDrawerOpen(false)}
          >
            Log in
          </Button>
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            disableElevation
            sx={primaryButtonSx}
            onClick={() => setDrawerOpen(false)}
          >
            Get started
          </Button>
        </Stack>
      </Drawer>
    </AppBar>
  );
}
