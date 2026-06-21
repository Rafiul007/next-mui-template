"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import {
  ArrowForwardRounded,
  CheckCircleRounded,
  CheckRounded,
  EventAvailableRounded,
  FormatQuoteRounded,
  GroupsRounded,
  PaymentsRounded,
  StarRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import { BrandMark } from "./BrandLogo";
import {
  BRAND,
  COMPANY,
  features,
  localPoints,
  modules,
  outlineButtonSx,
  primaryButtonSx,
  pricingTiers,
  stats,
  steps,
  testimonials,
} from "@/lib/marketing/landing-content";

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        textAlign: align,
        alignItems: align === "center" ? "center" : "flex-start",
        maxWidth: align === "center" ? 720 : "none",
        mx: align === "center" ? "auto" : 0,
        mb: { xs: 5, md: 7 },
      }}
    >
      <Typography
        sx={{
          color: BRAND.primary,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        variant="h3"
        sx={{ fontSize: { xs: 28, md: 40 }, color: BRAND.ink }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography sx={{ color: BRAND.body, fontSize: { xs: 16, md: 18 } }}>
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}

function Section({
  id,
  bg = "#ffffff",
  children,
}: {
  id?: string;
  bg?: string;
  children: ReactNode;
}) {
  return (
    <Box component="section" id={id} sx={{ py: { xs: 8, md: 12 }, bgcolor: bg }}>
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}

/* ------------------------------- Hero ---------------------------------- */

function HeroMetric({
  icon,
  label,
  value,
  tint,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tint: string;
  color: string;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: BRAND.border,
        bgcolor: "#ffffff",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          display: "grid",
          placeItems: "center",
          bgcolor: tint,
          color,
          mb: 1.25,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: 22, color: BRAND.ink }}>
        {value}
      </Typography>
      <Typography sx={{ color: BRAND.body, fontSize: 13 }}>{label}</Typography>
    </Box>
  );
}

function HeroVisual() {
  return (
    <Box
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: BRAND.border,
        bgcolor: BRAND.soft,
        p: { xs: 2, md: 3 },
        boxShadow: "0 30px 60px rgba(11, 27, 51, 0.10)",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <BrandMark size={28} />
          <Typography sx={{ fontWeight: 700, color: BRAND.ink }}>
            Center overview
          </Typography>
        </Stack>
        <Chip
          label="Live"
          size="small"
          sx={{ bgcolor: "#E4F6EC", color: "#0F9D58", fontWeight: 700 }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(2, 1fr)" },
        }}
      >
        <HeroMetric
          icon={<GroupsRounded fontSize="small" />}
          value="1,248"
          label="Active students"
          tint="#EAF3FB"
          color={BRAND.primary}
        />
        <HeroMetric
          icon={<PaymentsRounded fontSize="small" />}
          value="৳8,40,000"
          label="Collected this month"
          tint="#E7F7F0"
          color="#0F9D58"
        />
        <HeroMetric
          icon={<EventAvailableRounded fontSize="small" />}
          value="94%"
          label="Avg. attendance"
          tint="#EEF0FE"
          color={BRAND.violet}
        />
        <HeroMetric
          icon={<TrendingUpRounded fontSize="small" />}
          value="36"
          label="Running batches"
          tint="#FEF3E7"
          color="#E0871A"
        />
      </Box>

      <Box
        sx={{
          mt: 1.5,
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: BRAND.border,
          bgcolor: "#ffffff",
        }}
      >
        <Typography sx={{ fontWeight: 700, color: BRAND.ink, mb: 1.25 }}>
          Recent fee payments
        </Typography>
        <Stack spacing={1.25}>
          {[
            { name: "Ayesha Siddiqua", method: "bKash", amount: "৳3,500" },
            { name: "Imran Hossain", method: "Nagad", amount: "৳2,800" },
            { name: "Sadia Akter", method: "Rocket", amount: "৳4,200" },
          ].map((row) => (
            <Stack
              key={row.name}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    bgcolor: "#EAF3FB",
                    color: BRAND.primary,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {row.name[0]}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: BRAND.ink }}>
                    {row.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: BRAND.body }}>
                    {row.method}
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontWeight: 700, color: "#0F9D58", fontSize: 14 }}>
                {row.amount}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export function HeroSection() {
  return (
    <Box component="section" sx={{ bgcolor: "#ffffff", pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: { xs: 5, md: 6 },
            alignItems: "center",
          }}
        >
          <Stack spacing={3}>
            <Chip
              label="Built for Bangladesh's coaching centers"
              sx={{
                alignSelf: "flex-start",
                bgcolor: BRAND.softer,
                color: BRAND.primary,
                fontWeight: 700,
                py: 2,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 36, md: 56 },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                color: BRAND.ink,
              }}
            >
              Run your entire coaching center from one dashboard
            </Typography>
            <Typography sx={{ fontSize: { xs: 17, md: 20 }, color: BRAND.body, maxWidth: 560 }}>
              {COMPANY.product} brings admissions, attendance, fees, exams, and
              staff together — so you spend less time on paperwork and more time
              teaching.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                disableElevation
                endIcon={<ArrowForwardRounded />}
                sx={primaryButtonSx}
              >
                Start free trial
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                sx={outlineButtonSx}
              >
                Book a demo
              </Button>
            </Stack>

            <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
              {["14-day free trial", "No card required", "Setup in a day"].map(
                (item) => (
                  <Stack key={item} direction="row" spacing={0.75} alignItems="center">
                    <CheckCircleRounded sx={{ fontSize: 18, color: "#0F9D58" }} />
                    <Typography sx={{ fontSize: 14, color: BRAND.body }}>
                      {item}
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Stack>

          <HeroVisual />
        </Box>
      </Container>
    </Box>
  );
}

/* ------------------------------- Stats --------------------------------- */

export function StatsSection() {
  return (
    <Box sx={{ bgcolor: BRAND.soft, py: { xs: 5, md: 6 }, borderBlock: "1px solid", borderColor: BRAND.border }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gap: { xs: 3, md: 2 },
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            textAlign: "center",
          }}
        >
          {stats.map((stat) => (
            <Box key={stat.label}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 28, md: 36 }, color: BRAND.ink }}>
                {stat.value}
              </Typography>
              <Typography sx={{ color: BRAND.body, fontSize: 14, mt: 0.5 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

/* ------------------------------ Features ------------------------------- */

export function FeaturesSection() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="Everything in one place"
        title="One platform for every part of your center"
        subtitle="From the first admission to the final result, BongoEdu360 handles the day-to-day so nothing slips through the cracks."
      />
      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
        }}
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Box
              key={feature.title}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: BRAND.border,
                bgcolor: "#ffffff",
                transition: "transform 160ms ease, box-shadow 160ms ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(11, 27, 51, 0.08)",
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: BRAND.softer,
                  color: BRAND.primary,
                  mb: 2,
                }}
              >
                <Icon />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 17, color: BRAND.ink, mb: 1 }}>
                {feature.title}
              </Typography>
              <Typography sx={{ color: BRAND.body, fontSize: 14.5, lineHeight: 1.6 }}>
                {feature.description}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Section>
  );
}

/* ------------------------------ Modules -------------------------------- */

export function ModulesSection() {
  return (
    <Section id="modules" bg={BRAND.soft}>
      <SectionHeading
        eyebrow="How it fits together"
        title="Built around how coaching centers actually work"
      />
      <Stack spacing={{ xs: 6, md: 9 }}>
        {modules.map((module, index) => {
          const reversed = index % 2 === 1;
          return (
            <Box
              key={module.title}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: { xs: 3, md: 6 },
                alignItems: "center",
              }}
            >
              <Stack
                spacing={2.5}
                sx={{ order: { xs: 1, md: reversed ? 2 : 1 } }}
              >
                <Typography
                  sx={{
                    color: BRAND.primary,
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  {module.eyebrow}
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 32 }, color: BRAND.ink }}>
                  {module.title}
                </Typography>
                <Typography sx={{ color: BRAND.body, fontSize: 17, lineHeight: 1.7 }}>
                  {module.description}
                </Typography>
                <Stack spacing={1.25}>
                  {module.points.map((point) => (
                    <Stack key={point} direction="row" spacing={1.25} alignItems="flex-start">
                      <CheckRounded sx={{ fontSize: 20, color: BRAND.primary, mt: "2px" }} />
                      <Typography sx={{ color: BRAND.ink, fontSize: 15.5 }}>
                        {point}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              <Box
                sx={{
                  order: { xs: 2, md: reversed ? 1 : 2 },
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: BRAND.border,
                  bgcolor: "#ffffff",
                  minHeight: { xs: 220, md: 320 },
                  display: "grid",
                  placeItems: "center",
                  p: 4,
                }}
              >
                <Stack spacing={1.5} alignItems="center" sx={{ textAlign: "center" }}>
                  <BrandMark size={64} />
                  <Typography sx={{ fontWeight: 700, color: BRAND.ink }}>
                    {module.eyebrow} module
                  </Typography>
                  <Typography sx={{ color: BRAND.body, fontSize: 14, maxWidth: 280 }}>
                    A focused, fast workspace your team will actually enjoy using.
                  </Typography>
                </Stack>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Section>
  );
}

/* ---------------------------- How it works ----------------------------- */

export function HowItWorksSection() {
  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow="Get started in days, not months"
        title="Up and running in three simple steps"
      />
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        }}
      >
        {steps.map((step) => (
          <Box
            key={step.number}
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: BRAND.border,
              bgcolor: "#ffffff",
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 40,
                color: BRAND.accent,
                lineHeight: 1,
                mb: 2,
              }}
            >
              {step.number}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 19, color: BRAND.ink, mb: 1 }}>
              {step.title}
            </Typography>
            <Typography sx={{ color: BRAND.body, fontSize: 15.5, lineHeight: 1.65 }}>
              {step.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Section>
  );
}

/* ------------------------- Built for Bangladesh ------------------------ */

export function BuiltForBangladeshSection() {
  return (
    <Section bg={BRAND.soft}>
      <SectionHeading
        eyebrow="Made for the local market"
        title="Designed for Bangladesh, not adapted for it"
        subtitle="Every detail — from payments to language — fits how coaching centers run here."
      />
      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
        }}
      >
        {localPoints.map((point) => {
          const Icon = point.icon;
          return (
            <Stack
              key={point.title}
              direction="row"
              spacing={2}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: BRAND.border,
                bgcolor: "#ffffff",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: BRAND.softer,
                  color: BRAND.primary,
                }}
              >
                <Icon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 16.5, color: BRAND.ink, mb: 0.5 }}>
                  {point.title}
                </Typography>
                <Typography sx={{ color: BRAND.body, fontSize: 14.5, lineHeight: 1.6 }}>
                  {point.description}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Box>
    </Section>
  );
}

/* ------------------------------ Pricing -------------------------------- */

export function PricingSection() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Simple, transparent pricing"
        title="Plans that grow with your center"
        subtitle="Start free for 14 days. Upgrade only when you are ready. Prices in BDT, billed monthly."
      />
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          alignItems: "stretch",
        }}
      >
        {pricingTiers.map((tier) => (
          <Box
            key={tier.name}
            sx={{
              p: 4,
              borderRadius: 4,
              border: tier.highlighted ? "2px solid" : "1px solid",
              borderColor: tier.highlighted ? BRAND.primary : BRAND.border,
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: tier.highlighted
                ? "0 24px 50px rgba(14, 111, 190, 0.16)"
                : "none",
            }}
          >
            {tier.highlighted ? (
              <Chip
                label="Most popular"
                size="small"
                sx={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: BRAND.primary,
                  color: "#fff",
                  fontWeight: 700,
                }}
              />
            ) : null}

            <Typography sx={{ fontWeight: 700, fontSize: 18, color: BRAND.ink }}>
              {tier.name}
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 1.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 38, color: BRAND.ink }}>
                {tier.price}
              </Typography>
              <Typography sx={{ color: BRAND.body, fontSize: 15 }}>
                {tier.period}
              </Typography>
            </Stack>
            <Typography sx={{ color: BRAND.body, fontSize: 14.5, mt: 1.5, minHeight: 44 }}>
              {tier.description}
            </Typography>

            <Button
              component={Link}
              href="/signup"
              variant={tier.highlighted ? "contained" : "outlined"}
              disableElevation
              sx={{ ...(tier.highlighted ? primaryButtonSx : outlineButtonSx), mt: 3 }}
            >
              {tier.cta}
            </Button>

            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {tier.features.map((feature) => (
                <Stack key={feature} direction="row" spacing={1.25} alignItems="flex-start">
                  <CheckCircleRounded sx={{ fontSize: 19, color: BRAND.primary, mt: "1px" }} />
                  <Typography sx={{ color: BRAND.ink, fontSize: 14.5 }}>
                    {feature}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Section>
  );
}

/* ---------------------------- Testimonials ----------------------------- */

export function TestimonialsSection() {
  return (
    <Section bg={BRAND.soft}>
      <SectionHeading
        eyebrow="Loved by center owners"
        title="Trusted by coaching centers across the country"
      />
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        }}
      >
        {testimonials.map((testimonial) => (
          <Stack
            key={testimonial.name}
            spacing={2.5}
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: BRAND.border,
              bgcolor: "#ffffff",
            }}
          >
            <FormatQuoteRounded sx={{ fontSize: 36, color: BRAND.accent }} />
            <Typography sx={{ color: BRAND.ink, fontSize: 16, lineHeight: 1.7 }}>
              “{testimonial.quote}”
            </Typography>
            <Box>
              <Stack direction="row" spacing={0.25} sx={{ mb: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarRounded key={i} sx={{ fontSize: 18, color: "#F5A623" }} />
                ))}
              </Stack>
              <Typography sx={{ fontWeight: 700, color: BRAND.ink }}>
                {testimonial.name}
              </Typography>
              <Typography sx={{ color: BRAND.body, fontSize: 13.5 }}>
                {testimonial.role}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>
    </Section>
  );
}

/* -------------------------------- CTA ---------------------------------- */

export function CtaSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: "#ffffff" }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            borderRadius: 5,
            bgcolor: BRAND.dark,
            px: { xs: 4, md: 8 },
            py: { xs: 6, md: 8 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="h3"
            sx={{ color: "#ffffff", fontSize: { xs: 28, md: 40 }, mb: 2 }}
          >
            Ready to modernize your coaching center?
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.78)", fontSize: { xs: 16, md: 18 }, maxWidth: 600, mx: "auto", mb: 4 }}
          >
            Join hundreds of centers using {COMPANY.product} to save time, get
            paid faster, and keep parents happy.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
            <Button
              component={Link}
              href="/signup"
              variant="contained"
              disableElevation
              endIcon={<ArrowForwardRounded />}
              sx={primaryButtonSx}
            >
              Start your free trial
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="contained"
              disableElevation
              sx={{
                bgcolor: "rgba(255,255,255,0.12)",
                color: "#fff",
                backgroundImage: "none",
                boxShadow: "none",
                minHeight: 48,
                px: 3,
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)", boxShadow: "none" },
              }}
            >
              Book a demo
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
