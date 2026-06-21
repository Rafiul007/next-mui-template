import type { ElementType } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  AssessmentRounded,
  BadgeRounded,
  CampaignRounded,
  EventNoteRounded,
  FactCheckRounded,
  HowToRegRounded,
  InsightsRounded,
  PaymentsRounded,
  PhoneIphoneRounded,
  AccountTreeRounded,
  TranslateRounded,
  WifiTetheringRounded,
} from "@mui/icons-material";

/**
 * BongoBrain brand tokens for the BongoEdu360 marketing site. Solid colours
 * only — no gradients anywhere on the landing page.
 */
export const BRAND = {
  ink: "#0B1B33",
  body: "#48566B",
  primary: "#0E6FBE",
  primaryDark: "#0A5798",
  accent: "#16A6E9",
  violet: "#5B6CF0",
  surface: "#FFFFFF",
  soft: "#F2F7FB",
  softer: "#E9F2FA",
  dark: "#0B1B33",
  border: "rgba(11, 27, 51, 0.10)",
} as const;

export const COMPANY = {
  product: "BongoEdu360",
  parent: "BongoBrain",
  parentLegal: "BongoBrain IT",
  email: "hello@bongobrain.it.com",
  phone: "+880 1700-000000",
} as const;

export const primaryButtonSx: SxProps<Theme> = {
  backgroundImage: "none",
  bgcolor: BRAND.primary,
  color: "#ffffff",
  boxShadow: "none",
  minHeight: 48,
  px: 3,
  fontSize: 15,
  "&:hover": {
    backgroundImage: "none",
    bgcolor: BRAND.primaryDark,
    boxShadow: "none",
  },
};

export const outlineButtonSx: SxProps<Theme> = {
  bgcolor: "#ffffff",
  color: BRAND.ink,
  borderColor: BRAND.border,
  minHeight: 48,
  px: 3,
  fontSize: 15,
  "&:hover": {
    borderColor: BRAND.primary,
    bgcolor: BRAND.soft,
  },
};

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "Modules", href: "#modules" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "500+", label: "Coaching centers" },
  { value: "1,20,000+", label: "Students managed" },
  { value: "৳40Cr+", label: "Fees collected" },
  { value: "99.9%", label: "Uptime" },
];

export type Feature = {
  icon: ElementType;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: HowToRegRounded,
    title: "Admissions & student profiles",
    description:
      "Onboard students in minutes, store guardian details, documents, and track status from inquiry to alumni.",
  },
  {
    icon: EventNoteRounded,
    title: "Batches, routine & scheduling",
    description:
      "Build batches, assign teachers, and publish class routines. Handle substitutes and one-off sessions with ease.",
  },
  {
    icon: FactCheckRounded,
    title: "Attendance with guardian SMS",
    description:
      "Mark attendance in one tap and auto-notify parents over SMS in Bangla or English the moment class starts.",
  },
  {
    icon: AssessmentRounded,
    title: "Exams, marks & results",
    description:
      "Create exams, enter marks, and publish results students and parents can view instantly online.",
  },
  {
    icon: PaymentsRounded,
    title: "Fees & online payments",
    description:
      "Generate monthly invoices and collect via bKash, Nagad, and Rocket. Auto-remind defaulters over SMS.",
  },
  {
    icon: BadgeRounded,
    title: "Staff, HR & payroll",
    description:
      "Manage employees, leave, and run payroll with salary structures, approvals, and payslips in one place.",
  },
  {
    icon: CampaignRounded,
    title: "Notices & SMS broadcast",
    description:
      "Send announcements to a batch or the whole center. Reach every guardian without leaving the dashboard.",
  },
  {
    icon: InsightsRounded,
    title: "Reports & insights",
    description:
      "See collections, attendance, and enrollment trends at a glance so you can make decisions with data.",
  },
];

export type Module = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};

export const modules: Module[] = [
  {
    eyebrow: "Academics",
    title: "Run your whole center from one dashboard",
    description:
      "Programs, batches, routines, materials, and exams stay connected. Teachers and admins work from a single, always-current view.",
    points: [
      "Subjects, programs, and batch management",
      "Class routine and session scheduling",
      "Study materials and homework sharing",
      "Exams, marks entry, and result publishing",
    ],
  },
  {
    eyebrow: "Billing",
    title: "Get paid faster with online collections",
    description:
      "Stop chasing cash. Automate invoices, accept mobile payments, and let the system handle reminders so your revenue stays on time.",
    points: [
      "bKash, Nagad, and Rocket payments built-in",
      "Automatic monthly invoice generation",
      "Discounts, waivers, and late-fee policies",
      "Defaulter tracking with SMS reminders",
    ],
  },
  {
    eyebrow: "Communication",
    title: "Keep parents in the loop, automatically",
    description:
      "Guardians stay informed without a single phone call. Attendance, results, and notices reach them the moment they happen.",
    points: [
      "Attendance alerts to guardians",
      "Instant result and notice publishing",
      "Batch-wide and center-wide SMS broadcast",
      "Bangla and English messaging",
    ],
  },
];

export type Step = { number: string; title: string; description: string };

export const steps: Step[] = [
  {
    number: "01",
    title: "Set up your center",
    description:
      "Add your branches, academic calendar, and team. Configure roles so everyone sees exactly what they need.",
  },
  {
    number: "02",
    title: "Add batches & students",
    description:
      "Create programs and batches, then admit students and onboard staff. Import existing records in bulk.",
  },
  {
    number: "03",
    title: "Go live",
    description:
      "Collect fees online, take attendance, publish results, and keep guardians updated from day one.",
  },
];

export type LocalPoint = {
  icon: ElementType;
  title: string;
  description: string;
};

export const localPoints: LocalPoint[] = [
  {
    icon: PaymentsRounded,
    title: "Mobile payments built-in",
    description: "Collect fees through bKash, Nagad, and Rocket without extra plugins.",
  },
  {
    icon: TranslateRounded,
    title: "Bangla & English",
    description: "SMS and notices in the language your guardians actually read.",
  },
  {
    icon: WifiTetheringRounded,
    title: "Works on low bandwidth",
    description: "Fast and reliable even on slow connections across the country.",
  },
  {
    icon: AccountTreeRounded,
    title: "Multi-branch ready",
    description: "Run one center or fifty from a single account as you grow.",
  },
  {
    icon: PhoneIphoneRounded,
    title: "Mobile friendly",
    description: "Manage your center from the phone in your pocket, anywhere.",
  },
  {
    icon: FactCheckRounded,
    title: "Guardian trust",
    description: "Real-time attendance and results build confidence with parents.",
  },
];

export type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "৳1,500",
    period: "/month",
    description: "For new and single-branch coaching centers finding their feet.",
    features: [
      "Up to 200 students",
      "1 branch",
      "Academics & attendance",
      "Fee invoicing",
      "Email support",
    ],
    cta: "Start free trial",
  },
  {
    name: "Growth",
    price: "৳3,500",
    period: "/month",
    description: "For established centers that want automation and online payments.",
    features: [
      "Up to 1,000 students",
      "Up to 3 branches",
      "Online payments (bKash, Nagad, Rocket)",
      "Guardian SMS alerts",
      "Exams, results & payroll",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-branch institutions with advanced needs.",
    features: [
      "Unlimited students",
      "Unlimited branches",
      "Custom roles & permissions",
      "Dedicated account manager",
      "API access & integrations",
      "Onboarding & training",
    ],
    cta: "Talk to sales",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Fee collection used to eat our whole first week of the month. With online payments and SMS reminders, dues are cleared before classes even start.",
    name: "Tanvir Ahmed",
    role: "Director, Scholars Academy — Dhaka",
  },
  {
    quote:
      "Parents finally trust us with real-time attendance and results. Admissions went up because word spread that we are organized and modern.",
    name: "Nusrat Jahan",
    role: "Founder, Bright Future Coaching — Chattogram",
  },
  {
    quote:
      "Managing three branches from one dashboard saved us from hiring two more admin staff. The payroll module alone pays for itself.",
    name: "Rakibul Hasan",
    role: "Owner, Mentor's Hub — Sylhet",
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Every plan starts with a 14-day free trial. No card required, and you can import your data and explore every feature before you decide.",
  },
  {
    question: "Do you support bKash, Nagad, and Rocket?",
    answer:
      "Absolutely. Online fee collection through bKash, Nagad, and Rocket is built in, so guardians can pay from home and your books update automatically.",
  },
  {
    question: "Can I manage multiple branches?",
    answer:
      "Yes. The Growth plan supports up to three branches and Enterprise is unlimited. Each branch keeps its own batches, staff, and reports under one account.",
  },
  {
    question: "Do students and parents get access?",
    answer:
      "Guardians receive SMS alerts for attendance, results, and notices. Student and parent self-service portals keep everyone informed without extra calls.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Your data is encrypted in transit and at rest, with role-based access so staff only see what they should. Regular backups keep your records safe.",
  },
];

export type FooterColumn = { title: string; links: NavLink[] };

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Modules", href: "#modules" },
      { label: "Pricing", href: "#pricing" },
      { label: "Book a demo", href: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About BongoBrain", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", href: "#" },
      { label: "Blog", href: "#" },
      { label: "System status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
    ],
  },
];
