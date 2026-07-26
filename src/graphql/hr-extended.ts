import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import type * as SchemaTypes from "./generated/schema";

// ─── Employee Document Upload ─────────────────────────────────────────────────

export type UploadEmployeeDocumentMutationVariables = {
  input: SchemaTypes.UploadEmployeeDocumentInput;
};
export type UploadEmployeeDocumentMutation = {
  uploadEmployeeDocument: {
    id: string;
    employeeId: string;
    filePath: string;
    type: string;
    uploadedAt: string;
    tenantId: string;
  };
};

export const UploadEmployeeDocumentDocument = gql`
  mutation UploadEmployeeDocument($input: UploadEmployeeDocumentInput!) {
    uploadEmployeeDocument(input: $input) {
      id
      employeeId
      filePath
      type
      uploadedAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  UploadEmployeeDocumentMutation,
  UploadEmployeeDocumentMutationVariables
>;

// ─── Payroll ──────────────────────────────────────────────────────────────────

export type GetPayrollRunsQueryVariables = Record<string, never>;
export type GetPayrollRunsQuery = {
  getPayrollRuns: Array<{
    id: string;
    month: number;
    year: number;
    status: string;
    totalAmount: number;
    totalEmployees: number;
    createdAt: string;
    tenantId: string;
  }>;
};

export const GetPayrollRunsDocument = gql`
  query GetPayrollRuns {
    getPayrollRuns {
      id
      month
      year
      status
      totalAmount
      totalEmployees
      createdAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<GetPayrollRunsQuery, GetPayrollRunsQueryVariables>;

export type GetSalaryStructureQueryVariables = {
  employeeId: string;
};
export type GetSalaryStructureQuery = {
  getSalaryStructure: {
    id: string;
    employeeId: string;
    basicSalary: number;
    houseRent: number | null;
    medical: number | null;
    transport: number | null;
    allowances: number | null;
    deductions: number | null;
    netSalary: number;
    effectiveFrom: string;
    tenantId: string;
  } | null;
};

export const GetSalaryStructureDocument = gql`
  query GetSalaryStructure($employeeId: ID!) {
    getSalaryStructure(employeeId: $employeeId) {
      id
      employeeId
      basicSalary
      houseRent
      medical
      transport
      allowances
      deductions
      netSalary
      effectiveFrom
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  GetSalaryStructureQuery,
  GetSalaryStructureQueryVariables
>;

export type SetSalaryStructureMutationVariables = {
  input: {
    employeeId: string;
    basicSalary: number;
    houseRent?: number;
    medical?: number;
    transport?: number;
    deductions?: number;
    effectiveFrom: string;
  };
};
export type SetSalaryStructureMutation = {
  setSalaryStructure: {
    id: string;
    employeeId: string;
    basicSalary: number;
    houseRent: number | null;
    medical: number | null;
    transport: number | null;
    allowances: number | null;
    deductions: number | null;
    netSalary: number;
    effectiveFrom: string;
    tenantId: string;
  };
};

export const SetSalaryStructureDocument = gql`
  mutation SetSalaryStructure($input: SetSalaryStructureInput!) {
    setSalaryStructure(input: $input) {
      id
      employeeId
      basicSalary
      houseRent
      medical
      transport
      allowances
      deductions
      netSalary
      effectiveFrom
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  SetSalaryStructureMutation,
  SetSalaryStructureMutationVariables
>;

export type RunPayrollMutationVariables = {
  input: {
    month: number;
    year: number;
    excludedEmployeeIds?: string[];
  };
};
export type RunPayrollMutation = {
  runPayroll: {
    id: string;
    month: number;
    year: number;
    status: string;
    totalAmount: number;
    totalEmployees: number;
    createdAt: string;
    tenantId: string;
  };
};

export const RunPayrollDocument = gql`
  mutation RunPayroll($input: RunPayrollInput!) {
    runPayroll(input: $input) {
      id
      month
      year
      status
      totalAmount
      totalEmployees
      createdAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<RunPayrollMutation, RunPayrollMutationVariables>;

export type GetPayrollRunEligibleEmployeesQueryVariables = {
  payrollRunId: string;
};
export type GetPayrollRunEligibleEmployeesQuery = {
  getPayrollRunEligibleEmployees: Array<{
    id: string;
    employeeCode: string;
    designation: string | null;
  }>;
};

export const GetPayrollRunEligibleEmployeesDocument = gql`
  query GetPayrollRunEligibleEmployees($payrollRunId: ID!) {
    getPayrollRunEligibleEmployees(payrollRunId: $payrollRunId) {
      id
      employeeCode
      designation
    }
  }
` as unknown as TypedDocumentNode<
  GetPayrollRunEligibleEmployeesQuery,
  GetPayrollRunEligibleEmployeesQueryVariables
>;

export type AddEmployeeToPayrollRunMutationVariables = {
  payrollRunId: string;
  employeeId: string;
};
export type AddEmployeeToPayrollRunMutation = {
  addEmployeeToPayrollRun: {
    id: string;
    month: number;
    year: number;
    status: string;
    totalAmount: number;
    totalEmployees: number;
    createdAt: string;
    tenantId: string;
  };
};

export const AddEmployeeToPayrollRunDocument = gql`
  mutation AddEmployeeToPayrollRun($payrollRunId: ID!, $employeeId: ID!) {
    addEmployeeToPayrollRun(payrollRunId: $payrollRunId, employeeId: $employeeId) {
      id
      month
      year
      status
      totalAmount
      totalEmployees
      createdAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  AddEmployeeToPayrollRunMutation,
  AddEmployeeToPayrollRunMutationVariables
>;

export type RemoveEmployeeFromPayrollRunMutationVariables = {
  payrollRunId: string;
  employeeId: string;
};
export type RemoveEmployeeFromPayrollRunMutation = {
  removeEmployeeFromPayrollRun: {
    id: string;
    month: number;
    year: number;
    status: string;
    totalAmount: number;
    totalEmployees: number;
    createdAt: string;
    tenantId: string;
  };
};

export const RemoveEmployeeFromPayrollRunDocument = gql`
  mutation RemoveEmployeeFromPayrollRun($payrollRunId: ID!, $employeeId: ID!) {
    removeEmployeeFromPayrollRun(payrollRunId: $payrollRunId, employeeId: $employeeId) {
      id
      month
      year
      status
      totalAmount
      totalEmployees
      createdAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  RemoveEmployeeFromPayrollRunMutation,
  RemoveEmployeeFromPayrollRunMutationVariables
>;

export type GetPayrollRunEntriesQueryVariables = {
  payrollRunId: string;
};
export type GetPayrollRunEntriesQuery = {
  getPayrollRunEntries: Array<{
    id: string;
    employeeId: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    taxableIncome: number;
    taxes: number;
    netAmount: number;
  }>;
};

export const GetPayrollRunEntriesDocument = gql`
  query GetPayrollRunEntries($payrollRunId: ID!) {
    getPayrollRunEntries(payrollRunId: $payrollRunId) {
      id
      employeeId
      basicSalary
      allowances
      deductions
      taxableIncome
      taxes
      netAmount
    }
  }
` as unknown as TypedDocumentNode<
  GetPayrollRunEntriesQuery,
  GetPayrollRunEntriesQueryVariables
>;

export type ApprovePayrollMutationVariables = {
  payrollRunId: string;
};
export type ApprovePayrollMutation = {
  approvePayroll: {
    id: string;
    month: number;
    year: number;
    status: string;
    totalAmount: number;
    totalEmployees: number;
    createdAt: string;
    tenantId: string;
  };
};

export const ApprovePayrollDocument = gql`
  mutation ApprovePayroll($payrollRunId: ID!) {
    approvePayroll(payrollRunId: $payrollRunId) {
      id
      month
      year
      status
      totalAmount
      totalEmployees
      createdAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  ApprovePayrollMutation,
  ApprovePayrollMutationVariables
>;

export type DisbursePayrollMutationVariables = {
  payrollRunId: string;
};
export type DisbursePayrollMutation = {
  disbursePayroll: {
    id: string;
    month: number;
    year: number;
    status: string;
    totalAmount: number;
    totalEmployees: number;
    createdAt: string;
    tenantId: string;
  };
};

export const DisbursePayrollDocument = gql`
  mutation DisbursePayroll($payrollRunId: ID!) {
    disbursePayroll(payrollRunId: $payrollRunId) {
      id
      month
      year
      status
      totalAmount
      totalEmployees
      createdAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  DisbursePayrollMutation,
  DisbursePayrollMutationVariables
>;

export type CancelPayrollMutationVariables = {
  payrollRunId: string;
};
export type CancelPayrollMutation = {
  cancelPayroll: {
    id: string;
    month: number;
    year: number;
    status: string;
    totalAmount: number;
    totalEmployees: number;
    createdAt: string;
    tenantId: string;
  };
};

export const CancelPayrollDocument = gql`
  mutation CancelPayroll($payrollRunId: ID!) {
    cancelPayroll(payrollRunId: $payrollRunId) {
      id
      month
      year
      status
      totalAmount
      totalEmployees
      createdAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  CancelPayrollMutation,
  CancelPayrollMutationVariables
>;

// ─── Recruitment ──────────────────────────────────────────────────────────────

export type GetVacanciesQueryVariables = Record<string, never>;
export type GetVacanciesQuery = {
  getVacancies: Array<{
    id: string;
    title: string;
    department: string;
    description: string | null;
    jobType: string;
    noOfPositions: number;
    requiredExperience: number | null;
    requiredQualification: string | null;
    status: string;
    postedAt: string;
    tenantId: string;
  }>;
};

export const GetVacanciesDocument = gql`
  query GetVacancies {
    getVacancies {
      id
      title
      department
      description
      jobType
      noOfPositions
      requiredExperience
      requiredQualification
      status
      postedAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<GetVacanciesQuery, GetVacanciesQueryVariables>;

export type GetApplicationsByVacancyQueryVariables = {
  vacancyId: string;
};
export type GetApplicationsByVacancyQuery = {
  getApplicationsByVacancy: Array<{
    id: string;
    vacancyId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    coverLetter: string | null;
    resume: string | null;
    status: string;
    interviewDate: string | null;
    interviewScore: number | null;
    appliedAt: string;
    tenantId: string;
  }>;
};

export const GetApplicationsByVacancyDocument = gql`
  query GetApplicationsByVacancy($vacancyId: ID!) {
    getApplicationsByVacancy(vacancyId: $vacancyId) {
      id
      vacancyId
      applicantName
      applicantEmail
      applicantPhone
      coverLetter
      resume
      status
      interviewDate
      interviewScore
      appliedAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  GetApplicationsByVacancyQuery,
  GetApplicationsByVacancyQueryVariables
>;

export type PostVacancyMutationVariables = {
  input: SchemaTypes.PostVacancyInput;
};
export type PostVacancyMutation = {
  postVacancy: {
    id: string;
    title: string;
    department: string;
    description: string | null;
    jobType: string;
    noOfPositions: number;
    requiredExperience: number | null;
    requiredQualification: string | null;
    status: string;
    postedAt: string;
    tenantId: string;
  };
};

export const PostVacancyDocument = gql`
  mutation PostVacancy($input: PostVacancyInput!) {
    postVacancy(input: $input) {
      id
      title
      department
      description
      jobType
      noOfPositions
      requiredExperience
      requiredQualification
      status
      postedAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<PostVacancyMutation, PostVacancyMutationVariables>;

export type ApplyForVacancyMutationVariables = {
  input: SchemaTypes.ApplyForVacancyInput;
};
export type ApplyForVacancyMutation = {
  applyForVacancy: {
    id: string;
    vacancyId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    status: string;
    appliedAt: string;
    tenantId: string;
  };
};

export const ApplyForVacancyDocument = gql`
  mutation ApplyForVacancy($input: ApplyForVacancyInput!) {
    applyForVacancy(input: $input) {
      id
      vacancyId
      applicantName
      applicantEmail
      applicantPhone
      status
      appliedAt
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  ApplyForVacancyMutation,
  ApplyForVacancyMutationVariables
>;

export type ScheduleInterviewMutationVariables = {
  applicationId: string;
  interviewDate: string;
};
export type ScheduleInterviewMutation = {
  scheduleInterview: {
    id: string;
    status: string;
    interviewDate: string | null;
  };
};

export const ScheduleInterviewDocument = gql`
  mutation ScheduleInterview($applicationId: ID!, $interviewDate: String!) {
    scheduleInterview(applicationId: $applicationId, interviewDate: $interviewDate) {
      id
      status
      interviewDate
    }
  }
` as unknown as TypedDocumentNode<
  ScheduleInterviewMutation,
  ScheduleInterviewMutationVariables
>;

export type ReviewApplicationMutationVariables = {
  applicationId: string;
  status: string;
};
export type ReviewApplicationMutation = {
  reviewApplication: {
    id: string;
    status: string;
  };
};

export const ReviewApplicationDocument = gql`
  mutation ReviewApplication($applicationId: ID!, $status: String!) {
    reviewApplication(applicationId: $applicationId, status: $status) {
      id
      status
    }
  }
` as unknown as TypedDocumentNode<
  ReviewApplicationMutation,
  ReviewApplicationMutationVariables
>;

export type HireApplicantMutationVariables = {
  input: SchemaTypes.HireApplicantInput;
};
export type HireApplicantMutation = {
  hireApplicant: {
    id: string;
    employeeCode: string;
    designation: string | null;
    department: string | null;
    status: string;
    tenantId: string;
  };
};

export const HireApplicantDocument = gql`
  mutation HireApplicant($input: HireApplicantInput!) {
    hireApplicant(input: $input) {
      id
      employeeCode
      designation
      department
      status
      tenantId
    }
  }
` as unknown as TypedDocumentNode<HireApplicantMutation, HireApplicantMutationVariables>;

export type GenerateOfferLetterMutationVariables = {
  applicationId: string;
};
export type GenerateOfferLetterMutation = {
  generateOfferLetter: string;
};

export const GenerateOfferLetterDocument = gql`
  mutation GenerateOfferLetter($applicationId: ID!) {
    generateOfferLetter(applicationId: $applicationId)
  }
` as unknown as TypedDocumentNode<
  GenerateOfferLetterMutation,
  GenerateOfferLetterMutationVariables
>;

// ─── Payslips ───────────────────────────────────────────────────────────────

export type PayrollEntry = {
  id: string;
  payrollRunId: string;
  employeeId: string;
  tenantId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  taxableIncome: number;
  taxes: number;
  netAmount: number;
  payslipPdfUrl: string | null;
};

const PAYROLL_ENTRY_FIELDS = `
  id
  payrollRunId
  employeeId
  tenantId
  basicSalary
  allowances
  deductions
  taxableIncome
  taxes
  netAmount
  payslipPdfUrl
`;

export type GetPayslipQueryVariables = {
  employeeId: string;
  payrollRunId: string;
};
export type GetPayslipQuery = { getPayslip: PayrollEntry };

export const GetPayslipDocument = gql`
  query GetPayslip($employeeId: ID!, $payrollRunId: ID!) {
    getPayslip(employeeId: $employeeId, payrollRunId: $payrollRunId) {
      ${PAYROLL_ENTRY_FIELDS}
    }
  }
` as unknown as TypedDocumentNode<GetPayslipQuery, GetPayslipQueryVariables>;

export type GetMyLatestPayslipQueryVariables = Record<string, never>;
export type GetMyLatestPayslipQuery = { getMyLatestPayslip: PayrollEntry };

export const GetMyLatestPayslipDocument = gql`
  query GetMyLatestPayslip {
    getMyLatestPayslip {
      ${PAYROLL_ENTRY_FIELDS}
    }
  }
` as unknown as TypedDocumentNode<
  GetMyLatestPayslipQuery,
  GetMyLatestPayslipQueryVariables
>;

// ─── Employee self-service & substitutes ──────────────────────────────────────

export type EmployeeProfile = {
  id: string;
  tenantId: string;
  userId: string | null;
  branchId: string | null;
  employeeCode: string;
  designation: string | null;
  department: string | null;
  employmentType: string | null;
  joiningDate: string | null;
  status: string;
  isOnProbation: boolean | null;
  probationEndsAt: string | null;
  nid: string | null;
  tin: string | null;
  bloodGroup: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  userInfo: {
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    profilePicture: string | null;
  } | null;
};

const EMPLOYEE_FIELDS = `
  id
  tenantId
  userId
  branchId
  employeeCode
  designation
  department
  employmentType
  joiningDate
  status
  isOnProbation
  probationEndsAt
  nid
  tin
  bloodGroup
  emergencyContactName
  emergencyContactPhone
  userInfo {
    firstName
    lastName
    email
    phone
    profilePicture
  }
`;

export type GetMyEmployeeProfileQueryVariables = Record<string, never>;
export type GetMyEmployeeProfileQuery = { getMyEmployeeProfile: EmployeeProfile };

export const GetMyEmployeeProfileDocument = gql`
  query GetMyEmployeeProfile {
    getMyEmployeeProfile {
      ${EMPLOYEE_FIELDS}
    }
  }
` as unknown as TypedDocumentNode<
  GetMyEmployeeProfileQuery,
  GetMyEmployeeProfileQueryVariables
>;

export type SuggestSubstitutesQueryVariables = {
  leaveApplicationId: string;
};
export type SuggestSubstitutesQuery = {
  suggestSubstitutes: EmployeeProfile[];
};

export const SuggestSubstitutesDocument = gql`
  query SuggestSubstitutes($leaveApplicationId: ID!) {
    suggestSubstitutes(leaveApplicationId: $leaveApplicationId) {
      ${EMPLOYEE_FIELDS}
    }
  }
` as unknown as TypedDocumentNode<
  SuggestSubstitutesQuery,
  SuggestSubstitutesQueryVariables
>;

// ─── Leave balance initialisation ─────────────────────────────────────────────

export type LeaveBalanceEntry = {
  id: string;
  employeeId: string;
  leaveType: string;
  totalBalance: number;
  usedDays: number;
  remainingDays: number;
  year: number;
  tenantId: string;
};

export type InitLeaveBalancesMutationVariables = {
  employeeId: string;
};
export type InitLeaveBalancesMutation = {
  initLeaveBalancesForEmployee: LeaveBalanceEntry[];
};

export const InitLeaveBalancesForEmployeeDocument = gql`
  mutation InitLeaveBalancesForEmployee($employeeId: ID!) {
    initLeaveBalancesForEmployee(employeeId: $employeeId) {
      id
      employeeId
      leaveType
      totalBalance
      usedDays
      remainingDays
      year
      tenantId
    }
  }
` as unknown as TypedDocumentNode<
  InitLeaveBalancesMutation,
  InitLeaveBalancesMutationVariables
>;
