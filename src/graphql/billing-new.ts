/**
 * Billing GraphQL operations using the current backend schema.
 *
 * NOTE: invoiceType, enrollmentId, student (nested), getAllStudentInvoices, and
 * StudentInvoiceFiltersInput do NOT exist in the current StudentInvoice type.
 * Use getStudentInvoices(studentId) to fetch per-student invoices.
 */

import { gql, type TypedDocumentNode } from "@apollo/client";

// ── Types ─────────────────────────────────────────────────────────────────────

// InvoiceType is a planned field — NOT yet in the backend StudentInvoice schema.
export type InvoiceType = "ADMISSION" | "MONTHLY_FEE" | "FINE" | "MISC";

export type InvoiceStatus =
  | "ISSUED"
  | "UNPAID"
  | "PARTIAL"
  | "OVERDUE"
  | "PAID"
  | "WAIVED";

export type StudentInvoiceNew = {
  id: string;
  batchId: string;
  studentId: string;
  month: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  fineAmount: number;
  paidAmount: number;
  total: number;
  status: InvoiceStatus;
  gracePeriodDays: number;
  pdfPath: string | null;
  tenantId: string;
  lineItems: Array<{ feeTypeId: string; description: string; amount: number }>;
};

const STUDENT_INVOICE_FIELDS = /* GraphQL */ `
  fragment StudentInvoiceFields on StudentInvoice {
    id
    batchId
    studentId
    month
    dueDate
    subtotal
    discountAmount
    fineAmount
    paidAmount
    total
    status
    gracePeriodDays
    pdfPath
    tenantId
    lineItems {
      feeTypeId
      description
      amount
    }
  }
`;

// ── GetStudentInvoicesNew ─────────────────────────────────────────────────────

export type GetStudentInvoicesNewVariables = {
  studentId: string;
};

export type GetStudentInvoicesNewResult = {
  getStudentInvoices: StudentInvoiceNew[];
};

export const GetStudentInvoicesNewDocument: TypedDocumentNode<
  GetStudentInvoicesNewResult,
  GetStudentInvoicesNewVariables
> = gql`
  ${STUDENT_INVOICE_FIELDS}
  query GetStudentInvoicesNew($studentId: ID!) {
    getStudentInvoices(studentId: $studentId) {
      ...StudentInvoiceFields
    }
  }
`;

// ── RecordStudentPaymentNew ───────────────────────────────────────────────────

export type RecordStudentPaymentNewVariables = {
  payment: {
    invoiceId: string;
    studentId: string;
    amount: number;
    method: string;
    transactionRef?: string;
    remarks?: string;
  };
};

export type RecordStudentPaymentNewResult = {
  recordStudentPayment: {
    id: string;
    invoiceId: string;
    studentId: string;
    amount: number;
    method: string;
    transactionRef: string;
    status: string;
    collectedAt: string;
    receiptPath: string | null;
  };
};

export const RecordStudentPaymentNewDocument: TypedDocumentNode<
  RecordStudentPaymentNewResult,
  RecordStudentPaymentNewVariables
> = gql`
  mutation RecordStudentPaymentNew($payment: RecordStudentPaymentInput!) {
    recordStudentPayment(payment: $payment) {
      id
      invoiceId
      studentId
      amount
      method
      transactionRef
      status
      collectedAt
      receiptPath
    }
  }
`;
