import type { Metadata } from "next";
import { Box } from "@mui/material";
import { LandingHeader } from "@/components/marketing/LandingHeader";
import { LandingFooter } from "@/components/marketing/LandingFooter";
import { FaqSection } from "@/components/marketing/FaqSection";
import {
  BuiltForBangladeshSection,
  CtaSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  ModulesSection,
  PricingSection,
  StatsSection,
  TestimonialsSection,
} from "@/components/marketing/LandingSections";

export const metadata: Metadata = {
  title: "BongoEdu360 — Coaching center management for Bangladesh",
  description:
    "BongoEdu360 by BongoBrain is the all-in-one platform to manage admissions, attendance, fees, exams, and staff for coaching centers in Bangladesh.",
};

export default function Home() {
  return (
    <Box sx={{ bgcolor: "#ffffff" }}>
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ModulesSection />
        <HowItWorksSection />
        <BuiltForBangladeshSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </Box>
  );
}
