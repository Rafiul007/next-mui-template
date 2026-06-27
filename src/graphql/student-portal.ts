/**
 * Student portal GraphQL operations.
 * New backend endpoints (myEnrollments, myStudentProfile, myInvoices, submitMyAssignment)
 * are not yet in the generated schema — defined manually here like billing-new.ts.
 * Existing JWT-resolved queries (myAttendanceSummary, myResults, myAttendanceBySession)
 * are also defined here since no query document existed for them.
 */

import { gql, type TypedDocumentNode } from "@apollo/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MyEnrollment = {
  id: string;
  studentId: string;
  batchId: string;
  enrolledAt: string;
  status: string;
  dropReason: string | null;
  tenantId: string;
};

export type MyStudentProfile = {
  id: string;
  studentCode: string;
  firstName: string;
  firstNameBangla: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  classLevel: string | null;
  previousInstitution: string | null;
  previousResult: string | null;
  address: string | null;
  village: string | null;
  upazila: string | null;
  district: string | null;
  division: string | null;
  status: string;
  userId: string;
  tenantId: string;
};

export type MyInvoice = {
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
  status: string;
  gracePeriodDays: number;
  tenantId: string;
  lineItems: Array<{ feeTypeId: string; description: string; amount: number }>;
};

export type MyAttendanceSummary = {
  totalSessions: number;
  presentCount: number;
  presentPercent: number;
  absentCount: number;
  absentPercent: number;
  lateCount: number;
  latePercent: number;
  shortageAlert: boolean;
};

export type MyResult = {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number;
  grade: string | null;
  remarks: string | null;
  publishedAt: string | null;
  tenantId: string;
};

export type MyAttendanceRecord = {
  id: string;
  studentId: string;
  sessionId: string;
  status: string;
  markedAt: string | null;
  correctionReason: string | null;
  tenantId: string;
};

export type MySubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  filePath: string | null;
  linkUrl: string | null;
  submittedAt: string;
  feedback: string | null;
  feedbackAt: string | null;
  late: boolean;
  tenantId: string;
};

// ── myEnrollments ─────────────────────────────────────────────────────────────

export type MyEnrollmentsResult = { myEnrollments: MyEnrollment[] };

export const MyEnrollmentsDocument: TypedDocumentNode<
  MyEnrollmentsResult,
  Record<string, never>
> = gql`
  query MyEnrollments {
    myEnrollments {
      id
      studentId
      batchId
      enrolledAt
      status
      dropReason
      tenantId
    }
  }
`;

// ── myStudentProfile ──────────────────────────────────────────────────────────

export type MyStudentProfileResult = { myStudentProfile: MyStudentProfile };

export const MyStudentProfileDocument: TypedDocumentNode<
  MyStudentProfileResult,
  Record<string, never>
> = gql`
  query MyStudentProfile {
    myStudentProfile {
      id
      studentCode
      firstName
      firstNameBangla
      lastName
      email
      phone
      dateOfBirth
      gender
      bloodGroup
      classLevel
      previousInstitution
      previousResult
      address
      village
      upazila
      district
      division
      status
      userId
      tenantId
    }
  }
`;

// ── myInvoices ────────────────────────────────────────────────────────────────

export type MyInvoicesResult = { myInvoices: MyInvoice[] };

export const MyInvoicesDocument: TypedDocumentNode<
  MyInvoicesResult,
  Record<string, never>
> = gql`
  query MyInvoices {
    myInvoices {
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
      tenantId
      lineItems {
        feeTypeId
        description
        amount
      }
    }
  }
`;

// ── myAttendanceSummary ───────────────────────────────────────────────────────

export type MyAttendanceSummaryResult = {
  myAttendanceSummary: MyAttendanceSummary;
};

export const MyAttendanceSummaryDocument: TypedDocumentNode<
  MyAttendanceSummaryResult,
  Record<string, never>
> = gql`
  query MyAttendanceSummary {
    myAttendanceSummary {
      totalSessions
      presentCount
      presentPercent
      absentCount
      absentPercent
      lateCount
      latePercent
      shortageAlert
    }
  }
`;

// ── myResults ─────────────────────────────────────────────────────────────────

export type MyResultsResult = { myResults: MyResult[] };

export const MyResultsDocument: TypedDocumentNode<
  MyResultsResult,
  Record<string, never>
> = gql`
  query MyResults {
    myResults {
      id
      examId
      studentId
      marksObtained
      grade
      remarks
      publishedAt
      tenantId
    }
  }
`;

// ── myAttendanceBySession ─────────────────────────────────────────────────────

export type MyAttendanceBySessionResult = {
  myAttendanceBySession: MyAttendanceRecord[];
};

export const MyAttendanceBySessionDocument: TypedDocumentNode<
  MyAttendanceBySessionResult,
  { sessionId: string }
> = gql`
  query MyAttendanceBySession($sessionId: ID!) {
    myAttendanceBySession(sessionId: $sessionId) {
      id
      studentId
      sessionId
      status
      markedAt
      correctionReason
      tenantId
    }
  }
`;

// ── submitMyAssignment ────────────────────────────────────────────────────────

export type SubmitMyAssignmentResult = { submitMyAssignment: MySubmission };

export const SubmitMyAssignmentDocument: TypedDocumentNode<
  SubmitMyAssignmentResult,
  { assignmentId: string; linkUrl?: string | null }
> = gql`
  mutation SubmitMyAssignment($assignmentId: ID!, $linkUrl: String) {
    submitMyAssignment(assignmentId: $assignmentId, linkUrl: $linkUrl) {
      id
      assignmentId
      studentId
      filePath
      linkUrl
      submittedAt
      feedback
      feedbackAt
      late
      tenantId
    }
  }
`;
