/**
 * New billing GraphQL operations.
 *
 * These are hand-crafted TypedDocumentNodes that map to the NEW backend schema
 * described in docs/backend-billing-requirements.md.
 *
 * Once the backend ships and codegen is re-run, delete this file and import
 * everything from @/graphql/generated instead.
 */

import { gql, type TypedDocumentNode } from "@apollo/client";

// ── Shared enums / types ──────────────────────────────────────────────────────

export type InvoiceType = "ADMISSION" | "MONTHLY_FEE" | "FINE" | "MISC";

export type InvoiceStatus = "UNPAID" | "PARTIAL" | "OVERDUE" | "PAID" | "WAIVED";

export type StudentInvoiceNew = {
  id: string;
  invoiceType: InvoiceType;
  enrollmentId: string | null;
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
  student: {
    id: string;
    firstName: string;
    lastName: string | null;
    studentCode: string | null;
    classLevel: string | null;
  };
};

const STUDENT_INVOICE_FRAGMENT = /* GraphQL */ `
  fragment StudentInvoiceNew on StudentInvoice {
    id
    invoiceType
    enrollmentId
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
    student {
      id
      firstName
      lastName
      studentCode
      classLevel
    }
  }
`;

// ── GetAllStudentInvoices ─────────────────────────────────────────────────────

export type GetAllStudentInvoicesFilters = {
  invoiceType?: InvoiceType;
  status?: InvoiceStatus;
  month?: string;
  batchId?: string;
  studentId?: string;
};

export type GetAllStudentInvoicesVariables = {
  filters?: GetAllStudentInvoicesFilters;
};

export type GetAllStudentInvoicesResult = {
  getAllStudentInvoices: StudentInvoiceNew[];
};

export const GetAllStudentInvoicesDocument: TypedDocumentNode<
  GetAllStudentInvoicesResult,
  GetAllStudentInvoicesVariables
> = gql`
  ${STUDENT_INVOICE_FRAGMENT}
  query GetAllStudentInvoices($filters: StudentInvoiceFiltersInput) {
    getAllStudentInvoices(filters: $filters) {
      ...StudentInvoiceNew
    }
  }
`;

// ── GenerateAdmissionInvoice ─────────────────────────────────────────────────

export type GenerateAdmissionInvoiceVariables = {
  studentId: string;
  batchId: string;
  enrollmentId: string;
};

export type GenerateAdmissionInvoiceResult = {
  generateAdmissionInvoice: StudentInvoiceNew;
};

export const GenerateAdmissionInvoiceDocument: TypedDocumentNode<
  GenerateAdmissionInvoiceResult,
  GenerateAdmissionInvoiceVariables
> = gql`
  ${STUDENT_INVOICE_FRAGMENT}
  mutation GenerateAdmissionInvoice(
    $studentId: ID!
    $batchId: ID!
    $enrollmentId: ID!
  ) {
    generateAdmissionInvoice(
      studentId: $studentId
      batchId: $batchId
      enrollmentId: $enrollmentId
    ) {
      ...StudentInvoiceNew
    }
  }
`;

// ── GetStudentInvoicesNew (per-student, with new fields) ──────────────────────

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
  ${STUDENT_INVOICE_FRAGMENT}
  query GetStudentInvoicesNew($studentId: ID!) {
    getStudentInvoices(studentId: $studentId) {
      ...StudentInvoiceNew
    }
  }
`;

// ── RecordStudentPaymentNew (re-export with extended return) ──────────────────

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
