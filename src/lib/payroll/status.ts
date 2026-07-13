// Single source of truth for the payroll-run lifecycle. Both the admin/HR
// PayrollWorkspace and the employee self-service view read from here, so the
// two can never disagree about what a status means or which action it unlocks.
//
// The backend has used more than one spelling for the pre-approval state
// ("draft" vs "pending"), so normalisation is deliberately generous: any
// unrecognised-but-pre-approval synonym still maps to "pending" and keeps the
// Approve action alive. Getting this wrong is what silently stalls a run.
//
// Lifecycle:  pending ──approvePayroll──▶ approved ──disbursePayroll──▶ disbursed

export type PayrollPhase = "pending" | "approved" | "disbursed" | "unknown";

export type PayrollStatusMeta = {
  phase: PayrollPhase;
  // Operational label for the admin/HR console (what action is due).
  adminLabel: string;
  // Employee-facing label (what it means for their money).
  employeeLabel: string;
  color: "warning" | "info" | "success" | "default";
  variant: "filled" | "outlined";
};

const PENDING_SYNONYMS = new Set([
  "draft",
  "pending",
  "processing",
  "created",
  "generated",
  "open",
]);
const DISBURSED_SYNONYMS = new Set(["disbursed", "paid", "completed", "settled"]);

export const normalizePayrollStatus = (
  status?: string | null,
): PayrollPhase => {
  const s = (status ?? "").trim().toLowerCase();
  if (!s) return "unknown";
  if (PENDING_SYNONYMS.has(s)) return "pending";
  if (s === "approved") return "approved";
  if (DISBURSED_SYNONYMS.has(s)) return "disbursed";
  return "unknown";
};

const titleCase = (raw?: string | null) => {
  const s = (raw ?? "").trim();
  if (!s) return "Unknown";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const payrollStatusMeta = (
  status?: string | null,
): PayrollStatusMeta => {
  switch (normalizePayrollStatus(status)) {
    case "pending":
      return {
        phase: "pending",
        adminLabel: "Pending approval",
        employeeLabel: "Processing",
        color: "warning",
        variant: "outlined",
      };
    case "approved":
      return {
        phase: "approved",
        adminLabel: "Approved",
        employeeLabel: "Approved",
        color: "info",
        variant: "outlined",
      };
    case "disbursed":
      return {
        phase: "disbursed",
        adminLabel: "Disbursed",
        employeeLabel: "Paid",
        color: "success",
        variant: "filled",
      };
    default: {
      const label = titleCase(status);
      return {
        phase: "unknown",
        adminLabel: label,
        employeeLabel: label,
        color: "default",
        variant: "outlined",
      };
    }
  }
};

// Action gates — the only place that decides whether a run can advance a step.
export const canApprovePayroll = (status?: string | null) =>
  normalizePayrollStatus(status) === "pending";

export const canDisbursePayroll = (status?: string | null) =>
  normalizePayrollStatus(status) === "approved";

export const isPayrollDisbursed = (status?: string | null) =>
  normalizePayrollStatus(status) === "disbursed";
