import * as yup from "yup";
import type { Dayjs } from "dayjs";
import { alpha } from "@mui/material";
import type { RhfSelectOption } from "@/components/form";
import type {
  DateFieldCfg,
  FormSection,
  SelectFieldCfg,
  TextFieldCfg,
} from "@/models/form";
import type { ConfirmAction } from "@/models/tenant";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const tenantFormSchema = yup.object({
  legalName: yup.string().trim().required("Required").max(120),
  contactName: yup.string().trim().required("Required").max(80),
  contactEmail: yup.string().trim().email("Invalid email").required("Required"),
  contactPhone: yup.string().trim().default(""),
  address: yup.string().trim().default(""),
  eBIN: yup.string().trim().default(""),
  tradeLicense: yup.string().trim().default(""),
  planId: yup.string().required("Select a plan"),
  trialEndsAt: yup.mixed<Dayjs>().nullable().default(null),
});

export type TenantFormValues = yup.InferType<typeof tenantFormSchema>;

// ─── Field config types ───────────────────────────────────────────────────────

type TenantTextField = TextFieldCfg<
  keyof Omit<TenantFormValues, "trialEndsAt">
>;
type TenantSelectField = SelectFieldCfg<"planId">;
type TenantDateField = DateFieldCfg<"trialEndsAt">;
export type TenantFieldConfig =
  | TenantTextField
  | TenantSelectField
  | TenantDateField;
export type TenantFormSection = FormSection<TenantFieldConfig>;

// ─── Status display ───────────────────────────────────────────────────────────

export const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active", color: "#10b981", bg: alpha("#10b981", 0.1) },
  trial: { label: "Trial", color: "#f59e0b", bg: alpha("#f59e0b", 0.1) },
  suspended: {
    label: "Suspended",
    color: "#ef4444",
    bg: alpha("#ef4444", 0.1),
  },
  terminated: {
    label: "Terminated",
    color: "#64748b",
    bg: alpha("#64748b", 0.1),
  },
};

export const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Terminated" },
];

// ─── Confirm dialog ───────────────────────────────────────────────────────────

export const CONFIRM_CONFIG: Record<
  ConfirmAction,
  {
    title: string;
    getMessage: (name: string) => string;
    confirmLabel: string;
    color: "primary" | "warning" | "error";
  }
> = {
  activate: {
    title: "Reactivate tenant",
    getMessage: (name) =>
      `This will restore "${name}" to active status and give their users full access to the platform.`,
    confirmLabel: "Reactivate",
    color: "primary",
  },
  suspend: {
    title: "Suspend tenant",
    getMessage: (name) =>
      `This will immediately suspend "${name}". Their users will lose access until reactivated.`,
    confirmLabel: "Suspend",
    color: "warning",
  },
  terminate: {
    title: "Terminate tenant",
    getMessage: (name) =>
      `Terminating "${name}" is permanent. Their account will be closed and data retained for compliance. This cannot be undone.`,
    confirmLabel: "Terminate",
    color: "error",
  },
};

// ─── Form defaults ────────────────────────────────────────────────────────────

export const emptyTenantDefaults: TenantFormValues = {
  legalName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  eBIN: "",
  tradeLicense: "",
  planId: "",
  trialEndsAt: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─── Form sections ────────────────────────────────────────────────────────────

export const buildTenantSections = (
  planOptions: RhfSelectOption[],
  mode: "create" | "edit",
): TenantFormSection[] => [
  {
    key: "identity",
    label: "Identity",
    fields: [
      {
        kind: "text",
        name: "legalName",
        label: "Legal / School Name",
        placeholder: "Uddayan Online School",
        trim: true,
        fullSpan: true,
      },
      {
        kind: "select",
        name: "planId",
        label: "Subscription Plan",
        options: planOptions,
      },
      ...(mode === "create"
        ? [
            {
              kind: "date" as const,
              name: "trialEndsAt" as const,
              label: "Trial Ends At",
              helperText: "Leave blank to skip the trial period",
            },
          ]
        : []),
    ],
  },
  {
    key: "contact",
    label: "Primary Contact",
    fields: [
      {
        kind: "text",
        name: "contactName",
        label: "Contact Name",
        placeholder: "Full name",
        trim: true,
      },
      {
        kind: "text",
        name: "contactPhone",
        label: "Phone",
        placeholder: "+8801XXXXXXXXX",
        trim: true,
      },
      {
        kind: "text",
        name: "contactEmail",
        label: "Email",
        placeholder: "admin@school.com",
        trim: true,
        type: "email",
        fullSpan: true,
      },
      {
        kind: "text",
        name: "address",
        label: "Address",
        placeholder: "Road, area, city",
        trim: true,
        multiline: true,
        minRows: 2,
        fullSpan: true,
      },
    ],
  },
  {
    key: "compliance",
    label: "Compliance (optional)",
    fields: [
      {
        kind: "text",
        name: "eBIN",
        label: "e-BIN",
        helperText: "Bangladesh tax ID",
        trim: true,
      },
      {
        kind: "text",
        name: "tradeLicense",
        label: "Trade License",
        trim: true,
      },
    ],
  },
];
