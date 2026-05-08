import * as yup from "yup";
import type { RhfCheckboxGroupOption, RhfSelectOption } from "@/components/form";
import type { CheckboxGroupCfg, FormSection, SelectFieldCfg, TextFieldCfg } from "@/models/form";
import type { PlanRecord } from "@/models/subscription";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const planSchema = yup.object({
  name:        yup.string().required("Plan name is required").trim(),
  billingCycle: yup.string().required("Billing cycle is required"),
  priceBdt:    yup.string().required("Price is required").test("positive", "Must be a positive number", (v) => !v || Number(v) > 0),
  maxStudents:  yup.string().default(""),
  maxStaff:     yup.string().default(""),
  maxBranches:  yup.string().default(""),
  smsCredits:   yup.string().required("SMS credits is required"),
  storageGb:    yup.string().required("Storage is required"),
  featureFlags: yup.array(yup.string().required()).default([]),
});

export type PlanFormValues = yup.InferType<typeof planSchema>;

// ─── Field config types ───────────────────────────────────────────────────────

type PlanTextField          = TextFieldCfg<keyof Omit<PlanFormValues, "featureFlags" | "billingCycle">>;
type PlanSelectField        = SelectFieldCfg<"billingCycle">;
type PlanCheckboxGroupField = CheckboxGroupCfg<"featureFlags">;
export type PlanFieldConfig  = PlanTextField | PlanSelectField | PlanCheckboxGroupField;
export type PlanFormSection  = FormSection<PlanFieldConfig>;

// ─── Feature flags ────────────────────────────────────────────────────────────

export const FEATURE_LABELS: Record<string, string> = {
  fees:               "Fees & Billing",
  attendance:         "Attendance",
  hr:                 "Staff & HR",
  analytics:          "Analytics",
  api_access:         "API Access",
  white_label:        "White Label",
  dedicated_support:  "Dedicated Support",
};

export const FEATURE_OPTIONS: RhfCheckboxGroupOption[] = Object.entries(FEATURE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const BILLING_OPTIONS: RhfSelectOption[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly",  label: "Yearly" },
];

export const LIMIT_ROWS = [
  { label: "Students",    key: "maxStudents" },
  { label: "Staff",       key: "maxStaff" },
  { label: "Branches",    key: "maxBranches" },
  { label: "SMS Credits", key: "smsCredits" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const billingCycleSuffix = (cycle: string) => (cycle.toLowerCase() === "yearly" ? "yr" : "mo");
export const formatBillingCycle = (cycle: string) => cycle.charAt(0).toUpperCase() + cycle.slice(1).toLowerCase();
export const formatLimit = (val: number) => (val === -1 ? "Unlimited" : val.toLocaleString());
export const formatBdt   = (val: number) => new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(val);
export const toLimit     = (s: string)   => (s === "" ? -1 : parseInt(s, 10));

/** Converts raw API flag names (e.g. "MULTI_BRANCH") to a human-readable label.
 *  Falls back to title-casing the snake_case value for any flag not in FEATURE_LABELS. */
export const formatFlagLabel = (flag: string): string =>
  FEATURE_LABELS[flag] ??
  flag.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Form sections ────────────────────────────────────────────────────────────

export const buildPlanSections = (plans: PlanRecord[]): PlanFormSection[] => {
  const billingOptions: RhfSelectOption[] =
    plans.length > 0
      ? [...new Set(plans.map((p) => p.billingCycle))].map((c) => ({
          value: c,
          label: c.charAt(0).toUpperCase() + c.slice(1),
        }))
      : BILLING_OPTIONS;

  const featureOptions: RhfCheckboxGroupOption[] =
    plans.length > 0
      ? [...new Set(plans.flatMap((p) => p.featureFlags))].map((f) => ({
          value: f,
          label: formatFlagLabel(f),
        }))
      : FEATURE_OPTIONS;

  return [
    {
      key: "basics",
      label: "Plan Details",
      fields: [
        { kind: "text",   name: "name",        label: "Plan Name",     fullSpan: true },
        { kind: "select", name: "billingCycle", label: "Billing Cycle", options: billingOptions },
        { kind: "text",   name: "priceBdt",    label: "Price (BDT)",   type: "number", placeholder: "e.g. 5000" },
      ],
    },
    {
      key: "limits",
      label: "Usage Limits — leave blank for unlimited",
      fields: [
        { kind: "text", name: "maxStudents", label: "Max Students", type: "number", placeholder: "e.g. 500" },
        { kind: "text", name: "maxStaff",    label: "Max Staff",    type: "number" },
        { kind: "text", name: "maxBranches", label: "Max Branches", type: "number" },
        { kind: "text", name: "smsCredits",  label: "SMS Credits",  type: "number" },
        { kind: "text", name: "storageGb",   label: "Storage (GB)", type: "number" },
      ],
    },
    {
      key: "features",
      label: "Feature Flags",
      fields: [
        { kind: "checkboxGroup", name: "featureFlags", label: "Features", options: featureOptions, fullSpan: true },
      ],
    },
  ];
};
