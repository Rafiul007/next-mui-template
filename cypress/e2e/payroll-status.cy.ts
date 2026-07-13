/// <reference types="cypress" />

// Pure-logic tests for the payroll-run lifecycle. This is the module that keeps
// the admin console and the employee self-service view agreeing on what a status
// means — a disagreement here silently stalls the approve/disburse flow, so it
// gets locked down. No backend needed; imports the source directly.
// Relative import (not "@/") because the Cypress bundler doesn't read tsconfig paths.
import {
  canApprovePayroll,
  canDisbursePayroll,
  isPayrollDisbursed,
  normalizePayrollStatus,
  payrollStatusMeta,
} from "../../src/lib/payroll/status";

describe("payroll run status", () => {
  describe("normalizePayrollStatus", () => {
    it("treats every pre-approval spelling as pending", () => {
      // The backend has shipped both 'draft' and 'pending' for this state.
      ["draft", "pending", "PROCESSING", "Created", "generated"].forEach((s) => {
        expect(normalizePayrollStatus(s), s).to.eq("pending");
      });
    });

    it("maps paid-family spellings to disbursed", () => {
      ["disbursed", "PAID", "completed"].forEach((s) => {
        expect(normalizePayrollStatus(s), s).to.eq("disbursed");
      });
    });

    it("returns unknown for blank or unrecognised input", () => {
      expect(normalizePayrollStatus("")).to.eq("unknown");
      expect(normalizePayrollStatus(null)).to.eq("unknown");
      expect(normalizePayrollStatus("weird")).to.eq("unknown");
    });
  });

  describe("action gates", () => {
    it("lets a run be approved whether the backend calls it draft or pending", () => {
      expect(canApprovePayroll("draft")).to.be.true;
      expect(canApprovePayroll("pending")).to.be.true;
      expect(canApprovePayroll("approved")).to.be.false;
      expect(canApprovePayroll("disbursed")).to.be.false;
    });

    it("only allows disbursement of an approved run", () => {
      expect(canDisbursePayroll("approved")).to.be.true;
      expect(canDisbursePayroll("draft")).to.be.false;
      expect(canDisbursePayroll("disbursed")).to.be.false;
    });

    it("recognises a disbursed run as done", () => {
      expect(isPayrollDisbursed("disbursed")).to.be.true;
      expect(isPayrollDisbursed("paid")).to.be.true;
      expect(isPayrollDisbursed("approved")).to.be.false;
    });
  });

  describe("payrollStatusMeta", () => {
    it("gives admin and employee their own label for the same state", () => {
      const disbursed = payrollStatusMeta("disbursed");
      expect(disbursed.adminLabel).to.eq("Disbursed");
      expect(disbursed.employeeLabel).to.eq("Paid");
      expect(disbursed.color).to.eq("success");
    });

    it("falls back to a readable label for an unknown status", () => {
      const meta = payrollStatusMeta("mystery");
      expect(meta.phase).to.eq("unknown");
      expect(meta.adminLabel).to.eq("Mystery");
      expect(meta.color).to.eq("default");
    });
  });
});
