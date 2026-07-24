export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AcademicYear = {
  __typename?: 'AcademicYear';
  current: Scalars['Boolean']['output'];
  endDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  startDate: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type AddCertificationInput = {
  certificateUrl?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  issueDate: Scalars['String']['input'];
  issuingOrganization: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type AddGuardianInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  nid?: InputMaybe<Scalars['String']['input']>;
  occupation?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  relationship: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};

export type AddInlineQuestionInput = {
  examId: Scalars['ID']['input'];
  marks: Scalars['Int']['input'];
  options: Array<QuestionOptionInput>;
  scoringMode: ScoringMode;
  text: Scalars['String']['input'];
  type: QuestionType;
};

export type AddQuestionsFromBankInput = {
  examId: Scalars['ID']['input'];
  selections: Array<BankQuestionSelectionInput>;
};

export type AddSkillTagInput = {
  employeeId: Scalars['ID']['input'];
  proficiencyLevel: Scalars['String']['input'];
  skill: Scalars['String']['input'];
};

/**  ─── Inputs ────────────────────────────────────────────────────────────────── */
export type AdmitStudentInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  admissionSource?: InputMaybe<Scalars['String']['input']>;
  batchId: Scalars['ID']['input'];
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  classLevel?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  division?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  firstNameBangla?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  previousInstitution?: InputMaybe<Scalars['String']['input']>;
  previousResult?: InputMaybe<Scalars['String']['input']>;
  qualifications?: InputMaybe<Array<QualificationInput>>;
  referrerId?: InputMaybe<Scalars['ID']['input']>;
  upazila?: InputMaybe<Scalars['String']['input']>;
  village?: InputMaybe<Scalars['String']['input']>;
};

export type ApplyForVacancyInput = {
  applicantEmail: Scalars['String']['input'];
  applicantName: Scalars['String']['input'];
  applicantPhone: Scalars['String']['input'];
  coverLetter?: InputMaybe<Scalars['String']['input']>;
  resume?: InputMaybe<Scalars['String']['input']>;
  vacancyId: Scalars['ID']['input'];
};

export type ApplyLeaveInput = {
  employeeId: Scalars['ID']['input'];
  endDate: Scalars['String']['input'];
  leaveType: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
};

export type Assignment = {
  __typename?: 'Assignment';
  active: Scalars['Boolean']['output'];
  attachmentPath?: Maybe<Scalars['String']['output']>;
  batchId?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  subjectId?: Maybe<Scalars['ID']['output']>;
  teacherId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type AttemptOption = {
  __typename?: 'AttemptOption';
  order: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type Attendance = {
  __typename?: 'Attendance';
  correctionReason?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  markedAt?: Maybe<Scalars['String']['output']>;
  markedBy?: Maybe<Scalars['ID']['output']>;
  sessionId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  studentId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
};

export type AttendanceSummary = {
  __typename?: 'AttendanceSummary';
  absentCount: Scalars['Int']['output'];
  absentPercent: Scalars['Float']['output'];
  lateCount: Scalars['Int']['output'];
  latePercent: Scalars['Float']['output'];
  presentCount: Scalars['Int']['output'];
  presentPercent: Scalars['Float']['output'];
  shortageAlert: Scalars['Boolean']['output'];
  totalSessions: Scalars['Int']['output'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  expiresInSeconds: Scalars['Int']['output'];
  refreshToken: Scalars['String']['output'];
  tokenType: Scalars['String']['output'];
};

export type BankQuestionSelectionInput = {
  marksOverride?: InputMaybe<Scalars['Int']['input']>;
  questionId: Scalars['ID']['input'];
};

export type Batch = {
  __typename?: 'Batch';
  branchId?: Maybe<Scalars['ID']['output']>;
  capacity: Scalars['Int']['output'];
  certificateOnCompletion: Scalars['Boolean']['output'];
  certificateTemplateName?: Maybe<Scalars['String']['output']>;
  classLevel?: Maybe<Scalars['String']['output']>;
  coTeacherIds?: Maybe<Array<Scalars['ID']['output']>>;
  courseName?: Maybe<Scalars['String']['output']>;
  deleted: Scalars['Boolean']['output'];
  deliveryMode?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  enrolledCount: Scalars['Int']['output'];
  feePlans: Array<FeePlan>;
  headTeacherId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  mediumOfInstruction?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  prerequisites?: Maybe<Scalars['String']['output']>;
  programId?: Maybe<Scalars['ID']['output']>;
  registrationDeadline?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type BatchFeePlanInput = {
  amount: Scalars['Float']['input'];
  feeTypeId: Scalars['ID']['input'];
  frequency: Scalars['String']['input'];
};

export type BatchFeeReport = {
  __typename?: 'BatchFeeReport';
  batchId: Scalars['ID']['output'];
  fullyPaidCount: Scalars['Int']['output'];
  month: Scalars['String']['output'];
  overdueCount: Scalars['Int']['output'];
  partiallyPaidCount: Scalars['Int']['output'];
  totalInvoiced: Scalars['Float']['output'];
  totalOverdue: Scalars['Float']['output'];
  totalPaid: Scalars['Float']['output'];
  totalPending: Scalars['Float']['output'];
  totalStudents: Scalars['Int']['output'];
  unpaidCount: Scalars['Int']['output'];
};

export type Branch = {
  __typename?: 'Branch';
  address?: Maybe<Scalars['String']['output']>;
  centerId: Scalars['ID']['output'];
  closeTime?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  managerId?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  openTime?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  workingDays?: Maybe<Array<Scalars['String']['output']>>;
};

export type BreakdownOption = {
  __typename?: 'BreakdownOption';
  correct: Scalars['Boolean']['output'];
  order: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

/** # Phase 2 — Center Profile, Branches, Calendar, Org Hierarchy, Tenant Roles */
export type Center = {
  __typename?: 'Center';
  academicYearStartMonth?: Maybe<Scalars['Int']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  establishedYear?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nameBangla?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  tagline?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type Certification = {
  __typename?: 'Certification';
  certificateUrl?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  expiryDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  issueDate: Scalars['String']['output'];
  issuingOrganization: Scalars['String']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type CreateAcademicYearInput = {
  current: Scalars['Boolean']['input'];
  endDate: Scalars['String']['input'];
  label: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};

export type CreateAssignmentInput = {
  batchId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
};

export type CreateBatchInput = {
  branchId?: InputMaybe<Scalars['ID']['input']>;
  capacity: Scalars['Int']['input'];
  certificateOnCompletion?: InputMaybe<Scalars['Boolean']['input']>;
  certificateTemplateName?: InputMaybe<Scalars['String']['input']>;
  classLevel?: InputMaybe<Scalars['String']['input']>;
  coTeacherIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  courseName?: InputMaybe<Scalars['String']['input']>;
  deliveryMode?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  feePlans?: InputMaybe<Array<BatchFeePlanInput>>;
  headTeacherId?: InputMaybe<Scalars['ID']['input']>;
  mediumOfInstruction?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  prerequisites?: InputMaybe<Scalars['String']['input']>;
  programId?: InputMaybe<Scalars['ID']['input']>;
  registrationDeadline?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBranchInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  centerId: Scalars['ID']['input'];
  closeTime?: InputMaybe<Scalars['String']['input']>;
  managerId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  openTime?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  workingDays?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateDepartmentInput = {
  code: Scalars['String']['input'];
  defaultRoles?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentDepartmentId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateDiscountInput = {
  applicableRuleJson?: InputMaybe<Scalars['String']['input']>;
  discountType: Scalars['String']['input'];
  earlyBirdDeadline?: InputMaybe<Scalars['String']['input']>;
  isPercentage: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  value: Scalars['Float']['input'];
};

export type CreateDraftExamInput = {
  batchId: Scalars['ID']['input'];
  examDate?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  passMark: Scalars['Int']['input'];
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
};

export type CreateFeePlanInput = {
  amount: Scalars['Float']['input'];
  batchId?: InputMaybe<Scalars['ID']['input']>;
  feeTypeId: Scalars['ID']['input'];
  frequency: Scalars['String']['input'];
  programId?: InputMaybe<Scalars['ID']['input']>;
};

/**  ─── Inputs ────────────────────────────────────────────────────────────────── */
export type CreateFeeTypeInput = {
  isRecurring: Scalars['Boolean']['input'];
  keyName?: InputMaybe<Scalars['String']['input']>;
  typeName: Scalars['String']['input'];
};

export type CreateHolidayInput = {
  branchId?: InputMaybe<Scalars['ID']['input']>;
  date: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type CreateLeavePolicyInput = {
  carryForwardDays: Scalars['Int']['input'];
  customName?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  leaveType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  requiresApproval: Scalars['Boolean']['input'];
  totalDaysPerYear: Scalars['Int']['input'];
};

export type CreateNoticeInput = {
  body: Scalars['String']['input'];
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  targetBatchIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  title: Scalars['String']['input'];
};

export type CreateOneOffSessionInput = {
  batchId: Scalars['ID']['input'];
  date: Scalars['String']['input'];
  endTime: Scalars['String']['input'];
  roomName?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['String']['input'];
  teacherId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrgNodeInput = {
  level: Scalars['String']['input'];
  managerId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreatePipInput = {
  createdBy: Scalars['ID']['input'];
  employeeId: Scalars['ID']['input'];
  endDate: Scalars['String']['input'];
  goals: Scalars['String']['input'];
  progressNotes?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
};

export type CreatePlanInput = {
  billingCycle: Scalars['String']['input'];
  featureFlags?: InputMaybe<Array<Scalars['String']['input']>>;
  maxBranches: Scalars['Int']['input'];
  maxStaff: Scalars['Int']['input'];
  maxStudents: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  priceBdt: Scalars['Float']['input'];
  smsCredits: Scalars['Int']['input'];
  storageGb: Scalars['Int']['input'];
};

export type CreateProgramInput = {
  durationMonths: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  subjectIds: Array<Scalars['ID']['input']>;
  syllabusPath?: InputMaybe<Scalars['String']['input']>;
  targetLevel?: InputMaybe<Scalars['String']['input']>;
};

export type CreateQuestionInput = {
  defaultMarks: Scalars['Int']['input'];
  difficulty?: InputMaybe<Difficulty>;
  options: Array<QuestionOptionInput>;
  scoringMode: ScoringMode;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  text: Scalars['String']['input'];
  topic?: InputMaybe<Scalars['String']['input']>;
  type: QuestionType;
};

export type CreateRecurringScheduleInput = {
  batchId: Scalars['ID']['input'];
  dayOfWeek: Scalars['String']['input'];
  endTime: Scalars['String']['input'];
  roomName?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['String']['input'];
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  teacherId?: InputMaybe<Scalars['ID']['input']>;
};

/**  ─── Inputs ────────────────────────────────────────────────────────────────── */
export type CreateSubjectInput = {
  batchId?: InputMaybe<Scalars['ID']['input']>;
  classLevel?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  nameBangla?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTenantInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactEmail: Scalars['String']['input'];
  contactName: Scalars['String']['input'];
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  eBIN?: InputMaybe<Scalars['String']['input']>;
  legalName: Scalars['String']['input'];
  planId: Scalars['ID']['input'];
  tradeLicense?: InputMaybe<Scalars['String']['input']>;
  trialEndsAt?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTenantRoleInput = {
  name: Scalars['String']['input'];
  permissions: Array<Scalars['String']['input']>;
};

export type DefaulterInfo = {
  __typename?: 'DefaulterInfo';
  batchId: Scalars['ID']['output'];
  daysOverdue: Scalars['Int']['output'];
  dueDate?: Maybe<Scalars['String']['output']>;
  invoiceId: Scalars['ID']['output'];
  month: Scalars['String']['output'];
  outstanding: Scalars['Float']['output'];
  paidAmount: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  studentId: Scalars['ID']['output'];
  total: Scalars['Float']['output'];
};

export type DepartmentDto = {
  __typename?: 'DepartmentDto';
  code: Scalars['String']['output'];
  defaultRoles?: Maybe<Array<Scalars['String']['output']>>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parentDepartmentId?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export enum Difficulty {
  Easy = 'EASY',
  Hard = 'HARD',
  Medium = 'MEDIUM'
}

export type Discount = {
  __typename?: 'Discount';
  applicableRuleJson?: Maybe<Scalars['String']['output']>;
  discountType: Scalars['String']['output'];
  earlyBirdDeadline?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPercentage: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  value: Scalars['Float']['output'];
};

/**
 * # Phase 6 — HR Module (Employee, Recruitment, Leave, Attendance, Payroll, Performance)
 * # Phase 6b — Department CRUD
 *  ─── Types ──────────────────────────────────────────────────────────────────
 */
export type Employee = {
  __typename?: 'Employee';
  bloodGroup?: Maybe<Scalars['String']['output']>;
  branch?: Maybe<EmployeeBranchInfo>;
  branchId: Scalars['ID']['output'];
  department?: Maybe<Scalars['String']['output']>;
  departmentId?: Maybe<Scalars['ID']['output']>;
  designation?: Maybe<Scalars['String']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  employeeCode: Scalars['String']['output'];
  employmentType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isOnProbation: Scalars['Boolean']['output'];
  joiningDate: Scalars['String']['output'];
  nid?: Maybe<Scalars['String']['output']>;
  probationEndsAt?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  tin?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
  userInfo?: Maybe<EmployeeUserInfo>;
};

export type EmployeeAttendance = {
  __typename?: 'EmployeeAttendance';
  attendanceDate: Scalars['String']['output'];
  checkInTime?: Maybe<Scalars['String']['output']>;
  checkOutTime?: Maybe<Scalars['String']['output']>;
  correctionReason?: Maybe<Scalars['String']['output']>;
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  source: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type EmployeeBranchInfo = {
  __typename?: 'EmployeeBranchInfo';
  branchName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

export type EmployeeDocument = {
  __typename?: 'EmployeeDocument';
  employeeId: Scalars['ID']['output'];
  filePath: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
  type: Scalars['String']['output'];
  uploadedAt: Scalars['String']['output'];
};

export type EmployeeUserInfo = {
  __typename?: 'EmployeeUserInfo';
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  profilePicture?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type Enrollment = {
  __typename?: 'Enrollment';
  batchId: Scalars['ID']['output'];
  dropReason?: Maybe<Scalars['String']['output']>;
  enrolledAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  studentId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
};

export type EnterMarksInput = {
  examId: Scalars['ID']['input'];
  grade?: InputMaybe<Scalars['String']['input']>;
  marksObtained: Scalars['Float']['input'];
  remarks?: InputMaybe<Scalars['String']['input']>;
  studentId: Scalars['ID']['input'];
};

export type Exam = {
  __typename?: 'Exam';
  approvedAt?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['ID']['output']>;
  batchId: Scalars['ID']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  examDate?: Maybe<Scalars['String']['output']>;
  examQuestions: Array<ExamQuestion>;
  id: Scalars['ID']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  passMark: Scalars['Int']['output'];
  published: Scalars['Boolean']['output'];
  rejectionReason?: Maybe<Scalars['String']['output']>;
  startAt?: Maybe<Scalars['String']['output']>;
  status: ExamStatus;
  subjectId?: Maybe<Scalars['ID']['output']>;
  submittedAt?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  totalMarks: Scalars['Int']['output'];
};

export type ExamAssignment = {
  __typename?: 'ExamAssignment';
  assignedAt: Scalars['String']['output'];
  examId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  studentId: Scalars['ID']['output'];
};

export type ExamAttempt = {
  __typename?: 'ExamAttempt';
  deadlineAt: Scalars['String']['output'];
  examId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  questions: Array<ExamAttemptQuestion>;
  startedAt: Scalars['String']['output'];
  status: ExamAttemptStatus;
  studentId: Scalars['ID']['output'];
  submittedAt?: Maybe<Scalars['String']['output']>;
};

export type ExamAttemptAnswer = {
  __typename?: 'ExamAttemptAnswer';
  examQuestionId: Scalars['ID']['output'];
  selectedOrders: Array<Scalars['Int']['output']>;
};

export type ExamAttemptQuestion = {
  __typename?: 'ExamAttemptQuestion';
  id: Scalars['ID']['output'];
  marks: Scalars['Int']['output'];
  options: Array<AttemptOption>;
  questionTextSnapshot: Scalars['String']['output'];
  scoringModeSnapshot: ScoringMode;
  typeSnapshot: QuestionType;
};

export enum ExamAttemptStatus {
  Expired = 'EXPIRED',
  InProgress = 'IN_PROGRESS',
  Submitted = 'SUBMITTED'
}

export type ExamQuestion = {
  __typename?: 'ExamQuestion';
  examId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  marks: Scalars['Int']['output'];
  optionsSnapshot: Array<ExamQuestionOptionSnapshot>;
  order: Scalars['Int']['output'];
  questionTextSnapshot: Scalars['String']['output'];
  scoringModeSnapshot: ScoringMode;
  sourceQuestionId?: Maybe<Scalars['ID']['output']>;
  typeSnapshot: QuestionType;
};

export type ExamQuestionOptionSnapshot = {
  __typename?: 'ExamQuestionOptionSnapshot';
  correct: Scalars['Boolean']['output'];
  order: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type ExamResult = {
  __typename?: 'ExamResult';
  examId: Scalars['ID']['output'];
  grade?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  marksObtained: Scalars['Float']['output'];
  publishedAt?: Maybe<Scalars['String']['output']>;
  remarks?: Maybe<Scalars['String']['output']>;
  studentId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
};

export type ExamResultBreakdown = {
  __typename?: 'ExamResultBreakdown';
  examId: Scalars['ID']['output'];
  grade?: Maybe<Scalars['String']['output']>;
  marksObtained: Scalars['Float']['output'];
  publishedAt: Scalars['String']['output'];
  questions: Array<QuestionBreakdown>;
  remarks?: Maybe<Scalars['String']['output']>;
};

export enum ExamStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Draft = 'DRAFT',
  PendingApproval = 'PENDING_APPROVAL',
  Rejected = 'REJECTED',
  Scheduled = 'SCHEDULED'
}

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  disabledTenantIds: Array<Scalars['String']['output']>;
  enabledGlobally: Scalars['Boolean']['output'];
  enabledTenantIds: Array<Scalars['String']['output']>;
  flagName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  scheduledAt?: Maybe<Scalars['String']['output']>;
};

export type FeatureFlagInput = {
  disabledTenantIds?: InputMaybe<Array<Scalars['String']['input']>>;
  enabledGlobally: Scalars['Boolean']['input'];
  enabledTenantIds?: InputMaybe<Array<Scalars['String']['input']>>;
  flagName: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  scheduledAt?: InputMaybe<Scalars['String']['input']>;
};

export type FeePlan = {
  __typename?: 'FeePlan';
  amount: Scalars['Float']['output'];
  batchId?: Maybe<Scalars['ID']['output']>;
  feeTypeId: Scalars['ID']['output'];
  feeTypeKeyName?: Maybe<Scalars['String']['output']>;
  feeTypeName?: Maybe<Scalars['String']['output']>;
  frequency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  programId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
};

/**
 * # Phase 5 — Fee & Payment: Fee structure, invoicing, and payment collection
 *  ─── Types ──────────────────────────────────────────────────────────────────
 */
export type FeeType = {
  __typename?: 'FeeType';
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isRecurring: Scalars['Boolean']['output'];
  keyName?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
  typeName: Scalars['String']['output'];
};

export type Guardian = {
  __typename?: 'Guardian';
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nid?: Maybe<Scalars['String']['output']>;
  occupation?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  relationship?: Maybe<Scalars['String']['output']>;
  studentId: Scalars['ID']['output'];
};

export type HireApplicantInput = {
  applicationId: Scalars['ID']['input'];
  branchId: Scalars['ID']['input'];
  department: Scalars['String']['input'];
  designation: Scalars['String']['input'];
  joiningDate: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type Holiday = {
  __typename?: 'Holiday';
  branchId?: Maybe<Scalars['ID']['output']>;
  date: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  type: Scalars['String']['output'];
};

export type ImpersonationResult = {
  __typename?: 'ImpersonationResult';
  accessToken: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  tenantSlug: Scalars['String']['output'];
};

export type InviteBongoUserInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  role: Scalars['String']['input'];
};

export type Invoice = {
  __typename?: 'Invoice';
  createdAt?: Maybe<Scalars['String']['output']>;
  dueDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  invoiceNumber: Scalars['String']['output'];
  paidAt?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  subtotal: Scalars['Float']['output'];
  tenantId: Scalars['ID']['output'];
  total: Scalars['Float']['output'];
  vatAmount: Scalars['Float']['output'];
};

export type JobApplication = {
  __typename?: 'JobApplication';
  applicantEmail: Scalars['String']['output'];
  applicantName: Scalars['String']['output'];
  applicantPhone: Scalars['String']['output'];
  appliedAt: Scalars['String']['output'];
  coverLetter?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  interviewDate?: Maybe<Scalars['String']['output']>;
  interviewScore?: Maybe<Scalars['Float']['output']>;
  resume?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  vacancyId: Scalars['ID']['output'];
};

export type JobVacancy = {
  __typename?: 'JobVacancy';
  department: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jobType: Scalars['String']['output'];
  noOfPositions: Scalars['Int']['output'];
  postedAt: Scalars['String']['output'];
  requiredExperience?: Maybe<Scalars['Int']['output']>;
  requiredQualification?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type LateFinePolicy = {
  __typename?: 'LateFinePolicy';
  fineType: Scalars['String']['output'];
  graceDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
  value: Scalars['Float']['output'];
};

export type LaunchReviewCycleInput = {
  cycleType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  submissionDeadline: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type LeaveApplication = {
  __typename?: 'LeaveApplication';
  appliedAt: Scalars['String']['output'];
  approvalDate?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['ID']['output']>;
  employeeId: Scalars['ID']['output'];
  endDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  leaveType: Scalars['String']['output'];
  numberOfDays: Scalars['Int']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type LeaveBalance = {
  __typename?: 'LeaveBalance';
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  leaveType: Scalars['String']['output'];
  remainingDays: Scalars['Int']['output'];
  tenantId: Scalars['ID']['output'];
  totalBalance: Scalars['Int']['output'];
  usedDays: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type LeavePolicy = {
  __typename?: 'LeavePolicy';
  carryForwardDays: Scalars['Int']['output'];
  customName?: Maybe<Scalars['String']['output']>;
  departmentId?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  leaveType: Scalars['String']['output'];
  name: Scalars['String']['output'];
  requiresApproval: Scalars['Boolean']['output'];
  tenantId: Scalars['ID']['output'];
  totalDaysPerYear: Scalars['Int']['output'];
};

export type LineItem = {
  __typename?: 'LineItem';
  amount: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  feeTypeId: Scalars['ID']['output'];
};

export type MarkAttendanceInput = {
  sessionId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};

export type MeResponse = {
  __typename?: 'MeResponse';
  permissions: Array<PermissionInfo>;
  roles: Array<Scalars['String']['output']>;
  subscription?: Maybe<SubscriptionInfo>;
  tenantId?: Maybe<Scalars['ID']['output']>;
  tenantName?: Maybe<Scalars['String']['output']>;
  user: UserInfo;
  userType: UserType;
};

export type Mutation = {
  __typename?: 'Mutation';
  activateTenant: Tenant;
  addCertification: Certification;
  addEmployeeToPayrollRun: PayrollRun;
  addGuardian: Guardian;
  addInlineQuestion: Exam;
  addOneOffSession: Session;
  addOrgNode: OrgNode;
  addQuestionsFromBank: Exam;
  addRole?: Maybe<User>;
  addSkillTag: SkillTag;
  admitStudent: Student;
  applyForVacancy: JobApplication;
  applyLeave: LeaveApplication;
  approveExam: Exam;
  approveLeave: LeaveApplication;
  approveManualAttendance: EmployeeAttendance;
  approveOvertimeClaim: OvertimeClaim;
  approvePayroll: PayrollRun;
  approveWaiver: StudentInvoice;
  archiveNotice: Notice;
  assignEmployeeToDepartment: Employee;
  assignRoleToUser: TenantRole;
  assignStudentToExam: Array<ExamAssignment>;
  assignSubstitute: Session;
  cancelLeave: LeaveApplication;
  cancelPayroll: PayrollRun;
  changeBatchStatus: Batch;
  changePassword?: Maybe<Scalars['Boolean']['output']>;
  changeStudentStatus: Student;
  cloneBatch: Batch;
  correctAttendance: Attendance;
  createAcademicYear: AcademicYear;
  createAssignment: Assignment;
  createBatch: Batch;
  createBranch: Branch;
  createCustomRole: TenantRole;
  createDepartment: DepartmentDto;
  createDiscount: Discount;
  createDraftExam: Exam;
  createFeePlan: FeePlan;
  createFeeType: FeeType;
  createHoliday: Holiday;
  createLeavePolicy: LeavePolicy;
  createNotice: Notice;
  createPIP: Pip;
  createProgram: Program;
  createQuestion: Question;
  createRecurringSchedule: RecurringSchedule;
  createSalaryPolicy: SalaryPolicy;
  createSubject: Subject;
  createSubscriptionPlan: SubscriptionPlan;
  createTenant: Tenant;
  deactivateBranch: Branch;
  deactivateQuestion: Question;
  deleteBatch: Scalars['Boolean']['output'];
  deleteRecurringSchedule: Scalars['Boolean']['output'];
  deleteSalaryPolicy: Scalars['Boolean']['output'];
  deleteUser?: Maybe<Scalars['Boolean']['output']>;
  disbursePayroll: PayrollRun;
  dropEnrollment: Enrollment;
  enrollStudent: Enrollment;
  enterMarks: Array<ExamResult>;
  generateMonthlyInvoices: Array<Invoice>;
  generateMonthlyStudentInvoices: Array<StudentInvoice>;
  generateOfferLetter: Scalars['String']['output'];
  giveFeedback: Submission;
  hireApplicant: Employee;
  impersonateTenant: ImpersonationResult;
  initLeaveBalancesForEmployee: Array<LeaveBalance>;
  inviteBongoUser: User;
  launchReviewCycle: ReviewCycle;
  login: AuthResponse;
  logout: Scalars['Boolean']['output'];
  markAllRead: Scalars['Boolean']['output'];
  markAsRead: Notification;
  markAttendance: Array<Attendance>;
  onboardEmployee: Employee;
  onboardEmployeeWithUser: Employee;
  postVacancy: JobVacancy;
  publishNotice: Notice;
  publishResults: Exam;
  reEnroll: Enrollment;
  recordCheckIn: EmployeeAttendance;
  recordCheckOut: EmployeeAttendance;
  recordPayment: PaymentResult;
  recordStudentPayment: StudentPayment;
  refresh: AuthResponse;
  rejectExam: Exam;
  rejectLeave: LeaveApplication;
  rejectOvertimeClaim: OvertimeClaim;
  removeEmployeeFromDepartment: Employee;
  removeEmployeeFromPayrollRun: PayrollRun;
  removeExamQuestion: Exam;
  requestManualAttendance: EmployeeAttendance;
  requestWaiver: StudentInvoice;
  resendOtp?: Maybe<OtpResendStatus>;
  reviewApplication: JobApplication;
  runPayroll: PayrollRun;
  scheduleExam: Exam;
  scheduleInterview: JobApplication;
  sendBatchNotification: Scalars['Boolean']['output'];
  sendNotification: Notification;
  setActiveStatus?: Maybe<User>;
  setFeatureFlag: FeatureFlag;
  setLateFinePolicy: LateFinePolicy;
  setQuestionMarks: Exam;
  setSalaryStructure: SalaryStructure;
  setupCenter: Center;
  startExamAttempt: ExamAttempt;
  startImpersonation: UserImpersonationResult;
  startSession: Session;
  stopImpersonation: Scalars['Boolean']['output'];
  submitAnswer: ExamAttemptAnswer;
  submitAssignment: Submission;
  submitAttempt: ExamAttempt;
  submitExamForApproval: Exam;
  submitMyAssignment: Submission;
  submitOvertimeClaim: OvertimeClaim;
  submitReview: PerformanceReview;
  suspendTenant: Tenant;
  terminateTenant: Tenant;
  unassignScheduleTeacher: RecurringSchedule;
  unassignStudentFromExam: Array<ExamAssignment>;
  updateBatch: Batch;
  updateBranch: Branch;
  updateCenter: Center;
  updateDepartment: DepartmentDto;
  updateEmployee: Employee;
  updatePIPProgress: Pip;
  updateProfile?: Maybe<User>;
  updateProgram: Program;
  updateQuestion: Question;
  updateRecurringSchedule: RecurringSchedule;
  updateSalaryPolicy: SalaryPolicy;
  updateStudent: Student;
  updateSubject: Subject;
  updateSubscriptionPlan: SubscriptionPlan;
  updateTenant: Tenant;
  uploadEmployeeDocument: EmployeeDocument;
  uploadMaterial: StudyMaterial;
  userRegistration?: Maybe<User>;
  verifyUser?: Maybe<User>;
};


export type MutationActivateTenantArgs = {
  tenantId: Scalars['ID']['input'];
};


export type MutationAddCertificationArgs = {
  input: AddCertificationInput;
};


export type MutationAddEmployeeToPayrollRunArgs = {
  employeeId: Scalars['ID']['input'];
  payrollRunId: Scalars['ID']['input'];
};


export type MutationAddGuardianArgs = {
  guardian: AddGuardianInput;
};


export type MutationAddInlineQuestionArgs = {
  input: AddInlineQuestionInput;
};


export type MutationAddOneOffSessionArgs = {
  session: CreateOneOffSessionInput;
};


export type MutationAddOrgNodeArgs = {
  node: CreateOrgNodeInput;
};


export type MutationAddQuestionsFromBankArgs = {
  input: AddQuestionsFromBankInput;
};


export type MutationAddRoleArgs = {
  id: Scalars['String']['input'];
  roles: Array<Scalars['String']['input']>;
};


export type MutationAddSkillTagArgs = {
  input: AddSkillTagInput;
};


export type MutationAdmitStudentArgs = {
  student: AdmitStudentInput;
};


export type MutationApplyForVacancyArgs = {
  input: ApplyForVacancyInput;
};


export type MutationApplyLeaveArgs = {
  input: ApplyLeaveInput;
};


export type MutationApproveExamArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationApproveLeaveArgs = {
  applicationId: Scalars['ID']['input'];
};


export type MutationApproveManualAttendanceArgs = {
  attendanceId: Scalars['ID']['input'];
};


export type MutationApproveOvertimeClaimArgs = {
  claimId: Scalars['ID']['input'];
};


export type MutationApprovePayrollArgs = {
  payrollRunId: Scalars['ID']['input'];
};


export type MutationApproveWaiverArgs = {
  invoiceId: Scalars['ID']['input'];
};


export type MutationArchiveNoticeArgs = {
  noticeId: Scalars['ID']['input'];
};


export type MutationAssignEmployeeToDepartmentArgs = {
  departmentId: Scalars['ID']['input'];
  employeeId: Scalars['ID']['input'];
};


export type MutationAssignRoleToUserArgs = {
  roleName: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationAssignStudentToExamArgs = {
  examId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationAssignSubstituteArgs = {
  sessionId: Scalars['ID']['input'];
  substituteTeacherId: Scalars['ID']['input'];
};


export type MutationCancelLeaveArgs = {
  applicationId: Scalars['ID']['input'];
};


export type MutationCancelPayrollArgs = {
  payrollRunId: Scalars['ID']['input'];
};


export type MutationChangeBatchStatusArgs = {
  batchId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  confirmPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationChangeStudentStatusArgs = {
  status: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationCloneBatchArgs = {
  newEndDate?: InputMaybe<Scalars['String']['input']>;
  newName: Scalars['String']['input'];
  newStartDate?: InputMaybe<Scalars['String']['input']>;
  sourceBatchId: Scalars['ID']['input'];
};


export type MutationCorrectAttendanceArgs = {
  correctionReason?: InputMaybe<Scalars['String']['input']>;
  sessionId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationCreateAcademicYearArgs = {
  year: CreateAcademicYearInput;
};


export type MutationCreateAssignmentArgs = {
  assignment: CreateAssignmentInput;
};


export type MutationCreateBatchArgs = {
  batch: CreateBatchInput;
};


export type MutationCreateBranchArgs = {
  branch: CreateBranchInput;
};


export type MutationCreateCustomRoleArgs = {
  role: CreateTenantRoleInput;
};


export type MutationCreateDepartmentArgs = {
  input: CreateDepartmentInput;
};


export type MutationCreateDiscountArgs = {
  input: CreateDiscountInput;
};


export type MutationCreateDraftExamArgs = {
  exam: CreateDraftExamInput;
};


export type MutationCreateFeePlanArgs = {
  input: CreateFeePlanInput;
};


export type MutationCreateFeeTypeArgs = {
  input: CreateFeeTypeInput;
};


export type MutationCreateHolidayArgs = {
  holiday: CreateHolidayInput;
};


export type MutationCreateLeavePolicyArgs = {
  input: CreateLeavePolicyInput;
};


export type MutationCreateNoticeArgs = {
  notice: CreateNoticeInput;
};


export type MutationCreatePipArgs = {
  input: CreatePipInput;
};


export type MutationCreateProgramArgs = {
  program: CreateProgramInput;
};


export type MutationCreateQuestionArgs = {
  question: CreateQuestionInput;
};


export type MutationCreateRecurringScheduleArgs = {
  schedule: CreateRecurringScheduleInput;
};


export type MutationCreateSalaryPolicyArgs = {
  input: SalaryPolicyInput;
};


export type MutationCreateSubjectArgs = {
  subject: CreateSubjectInput;
};


export type MutationCreateSubscriptionPlanArgs = {
  plan: CreatePlanInput;
};


export type MutationCreateTenantArgs = {
  tenant: CreateTenantInput;
};


export type MutationDeactivateBranchArgs = {
  branchId: Scalars['ID']['input'];
};


export type MutationDeactivateQuestionArgs = {
  questionId: Scalars['ID']['input'];
};


export type MutationDeleteBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type MutationDeleteRecurringScheduleArgs = {
  scheduleId: Scalars['ID']['input'];
};


export type MutationDeleteSalaryPolicyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDisbursePayrollArgs = {
  payrollRunId: Scalars['ID']['input'];
};


export type MutationDropEnrollmentArgs = {
  enrollmentId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEnrollStudentArgs = {
  batchId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationEnterMarksArgs = {
  marks: Array<EnterMarksInput>;
};


export type MutationGenerateMonthlyStudentInvoicesArgs = {
  batchId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
};


export type MutationGenerateOfferLetterArgs = {
  applicationId: Scalars['ID']['input'];
};


export type MutationGiveFeedbackArgs = {
  assignmentId: Scalars['ID']['input'];
  feedback: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationHireApplicantArgs = {
  input: HireApplicantInput;
};


export type MutationImpersonateTenantArgs = {
  tenantId: Scalars['ID']['input'];
};


export type MutationInitLeaveBalancesForEmployeeArgs = {
  employeeId: Scalars['ID']['input'];
};


export type MutationInviteBongoUserArgs = {
  user: InviteBongoUserInput;
};


export type MutationLaunchReviewCycleArgs = {
  input: LaunchReviewCycleInput;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationLogoutArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationMarkAsReadArgs = {
  notificationId: Scalars['ID']['input'];
};


export type MutationMarkAttendanceArgs = {
  entries: Array<MarkAttendanceInput>;
};


export type MutationOnboardEmployeeArgs = {
  input: OnboardEmployeeInput;
};


export type MutationOnboardEmployeeWithUserArgs = {
  input: OnboardEmployeeWithUserInput;
};


export type MutationPostVacancyArgs = {
  input: PostVacancyInput;
};


export type MutationPublishNoticeArgs = {
  noticeId: Scalars['ID']['input'];
};


export type MutationPublishResultsArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationReEnrollArgs = {
  newBatchId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationRecordCheckInArgs = {
  input: RecordCheckInInput;
};


export type MutationRecordCheckOutArgs = {
  input: RecordCheckOutInput;
};


export type MutationRecordPaymentArgs = {
  payment: RecordPaymentInput;
};


export type MutationRecordStudentPaymentArgs = {
  payment: RecordStudentPaymentInput;
};


export type MutationRefreshArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRejectExamArgs = {
  examId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRejectLeaveArgs = {
  applicationId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRejectOvertimeClaimArgs = {
  claimId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRemoveEmployeeFromDepartmentArgs = {
  employeeId: Scalars['ID']['input'];
};


export type MutationRemoveEmployeeFromPayrollRunArgs = {
  employeeId: Scalars['ID']['input'];
  payrollRunId: Scalars['ID']['input'];
};


export type MutationRemoveExamQuestionArgs = {
  examId: Scalars['ID']['input'];
  examQuestionId: Scalars['ID']['input'];
};


export type MutationRequestManualAttendanceArgs = {
  input: RequestManualAttendanceInput;
};


export type MutationRequestWaiverArgs = {
  invoiceId: Scalars['ID']['input'];
};


export type MutationResendOtpArgs = {
  email: Scalars['String']['input'];
};


export type MutationReviewApplicationArgs = {
  applicationId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationRunPayrollArgs = {
  input: RunPayrollInput;
};


export type MutationScheduleExamArgs = {
  input: ScheduleExamInput;
};


export type MutationScheduleInterviewArgs = {
  applicationId: Scalars['ID']['input'];
  interviewDate: Scalars['String']['input'];
};


export type MutationSendBatchNotificationArgs = {
  batchId: Scalars['ID']['input'];
  notification: SendNotificationInput;
};


export type MutationSendNotificationArgs = {
  notification: SendNotificationInput;
};


export type MutationSetActiveStatusArgs = {
  id: Scalars['String']['input'];
  newStatus: Scalars['Boolean']['input'];
};


export type MutationSetFeatureFlagArgs = {
  flag: FeatureFlagInput;
};


export type MutationSetLateFinePolicyArgs = {
  input: SetLateFinePolicyInput;
};


export type MutationSetQuestionMarksArgs = {
  examId: Scalars['ID']['input'];
  examQuestionId: Scalars['ID']['input'];
  marks: Scalars['Int']['input'];
};


export type MutationSetSalaryStructureArgs = {
  input: SetSalaryStructureInput;
};


export type MutationSetupCenterArgs = {
  center: SetupCenterInput;
};


export type MutationStartExamAttemptArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationStartImpersonationArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationStartSessionArgs = {
  date: Scalars['String']['input'];
  scheduleId: Scalars['ID']['input'];
};


export type MutationSubmitAnswerArgs = {
  input: SubmitAnswerInput;
};


export type MutationSubmitAssignmentArgs = {
  assignmentId: Scalars['ID']['input'];
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  studentId: Scalars['ID']['input'];
};


export type MutationSubmitAttemptArgs = {
  attemptId: Scalars['ID']['input'];
};


export type MutationSubmitExamForApprovalArgs = {
  examId: Scalars['ID']['input'];
};


export type MutationSubmitMyAssignmentArgs = {
  assignmentId: Scalars['ID']['input'];
  linkUrl?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSubmitOvertimeClaimArgs = {
  input: SubmitOvertimeClaimInput;
};


export type MutationSubmitReviewArgs = {
  input: SubmitReviewInput;
};


export type MutationSuspendTenantArgs = {
  tenantId: Scalars['ID']['input'];
};


export type MutationTerminateTenantArgs = {
  tenantId: Scalars['ID']['input'];
};


export type MutationUnassignScheduleTeacherArgs = {
  scheduleId: Scalars['ID']['input'];
};


export type MutationUnassignStudentFromExamArgs = {
  examId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationUpdateBatchArgs = {
  batch: UpdateBatchInput;
};


export type MutationUpdateBranchArgs = {
  branch: UpdateBranchInput;
};


export type MutationUpdateCenterArgs = {
  center: SetupCenterInput;
};


export type MutationUpdateDepartmentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDepartmentInput;
};


export type MutationUpdateEmployeeArgs = {
  input: UpdateEmployeeInput;
};


export type MutationUpdatePipProgressArgs = {
  input: UpdatePipProgressInput;
};


export type MutationUpdateProfileArgs = {
  user?: InputMaybe<UserUpdate>;
};


export type MutationUpdateProgramArgs = {
  program: UpdateProgramInput;
};


export type MutationUpdateQuestionArgs = {
  question: UpdateQuestionInput;
};


export type MutationUpdateRecurringScheduleArgs = {
  schedule: UpdateRecurringScheduleInput;
};


export type MutationUpdateSalaryPolicyArgs = {
  id: Scalars['ID']['input'];
  input: SalaryPolicyInput;
};


export type MutationUpdateStudentArgs = {
  student: UpdateStudentInput;
};


export type MutationUpdateSubjectArgs = {
  subject: UpdateSubjectInput;
};


export type MutationUpdateSubscriptionPlanArgs = {
  plan: UpdatePlanInput;
};


export type MutationUpdateTenantArgs = {
  tenant: UpdateTenantInput;
};


export type MutationUploadEmployeeDocumentArgs = {
  input: UploadEmployeeDocumentInput;
};


export type MutationUploadMaterialArgs = {
  material: UploadMaterialInput;
};


export type MutationUserRegistrationArgs = {
  user: UserRegistration;
};


export type MutationVerifyUserArgs = {
  email: Scalars['String']['input'];
  otp?: InputMaybe<Scalars['Int']['input']>;
};

export type Notice = {
  __typename?: 'Notice';
  body: Scalars['String']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  expiresAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  publishedAt?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  targetBatchIds: Array<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type Notification = {
  __typename?: 'Notification';
  body: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  readAt?: Maybe<Scalars['String']['output']>;
  recipientStudentId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

/**  ─── Input Types ──────────────────────────────────────────────────────────── */
export type OnboardEmployeeInput = {
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  branchId: Scalars['ID']['input'];
  department?: InputMaybe<Scalars['String']['input']>;
  designation?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  employeeCode?: InputMaybe<Scalars['String']['input']>;
  employmentType: Scalars['String']['input'];
  joiningDate: Scalars['String']['input'];
  nid?: InputMaybe<Scalars['String']['input']>;
  probationEndsAt?: InputMaybe<Scalars['String']['input']>;
  tin?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type OnboardEmployeeWithUserInput = {
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  branchId: Scalars['ID']['input'];
  department?: InputMaybe<Scalars['String']['input']>;
  designation?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  employeeCode?: InputMaybe<Scalars['String']['input']>;
  employmentType: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  joiningDate: Scalars['String']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
  nid?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  probationEndsAt?: InputMaybe<Scalars['String']['input']>;
  tin?: InputMaybe<Scalars['String']['input']>;
};

export type OrgNode = {
  __typename?: 'OrgNode';
  children: Array<OrgNode>;
  id: Scalars['ID']['output'];
  level: Scalars['String']['output'];
  managerId?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type OtpResendStatus = {
  __typename?: 'OtpResendStatus';
  cooldown?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['Boolean']['output']>;
};

export type OvertimeClaim = {
  __typename?: 'OvertimeClaim';
  amount?: Maybe<Scalars['Float']['output']>;
  approvedBy?: Maybe<Scalars['ID']['output']>;
  claimDate: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  hourlyRate?: Maybe<Scalars['Float']['output']>;
  hours: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  payrollRunId?: Maybe<Scalars['ID']['output']>;
  reason: Scalars['String']['output'];
  rejectionReason?: Maybe<Scalars['String']['output']>;
  sessionId?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

export type Pip = {
  __typename?: 'PIP';
  createdBy: Scalars['ID']['output'];
  employeeId: Scalars['ID']['output'];
  endDate: Scalars['String']['output'];
  goals: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  progressNotes?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type PaymentResult = {
  __typename?: 'PaymentResult';
  amount: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  invoiceId: Scalars['ID']['output'];
  method: Scalars['String']['output'];
  recordedAt: Scalars['String']['output'];
  recordedBy?: Maybe<Scalars['ID']['output']>;
  transactionRef?: Maybe<Scalars['String']['output']>;
};

export type PayrollEntry = {
  __typename?: 'PayrollEntry';
  allowances: Scalars['Float']['output'];
  basicSalary: Scalars['Float']['output'];
  deductions: Scalars['Float']['output'];
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  netAmount: Scalars['Float']['output'];
  payrollRunId: Scalars['ID']['output'];
  taxableIncome: Scalars['Float']['output'];
  taxes: Scalars['Float']['output'];
  tenantId: Scalars['ID']['output'];
};

export type PayrollRun = {
  __typename?: 'PayrollRun';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  month: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  totalAmount: Scalars['Float']['output'];
  totalEmployees: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type PayrollSummary = {
  __typename?: 'PayrollSummary';
  payslipCount: Scalars['Int']['output'];
  totalAllowances: Scalars['Float']['output'];
  totalBasicSalary: Scalars['Float']['output'];
  totalDeductions: Scalars['Float']['output'];
  totalNetAmount: Scalars['Float']['output'];
  totalTaxes: Scalars['Float']['output'];
  year: Scalars['Int']['output'];
};

export type PerformanceDashboard = {
  __typename?: 'PerformanceDashboard';
  averageScore: Scalars['Float']['output'];
  reviewCount: Scalars['Int']['output'];
  revieweeId: Scalars['ID']['output'];
  reviewerTypes: Array<Scalars['String']['output']>;
};

export type PerformanceReview = {
  __typename?: 'PerformanceReview';
  comments?: Maybe<Scalars['String']['output']>;
  cycleId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  overallScore: Scalars['Int']['output'];
  revieweeId: Scalars['ID']['output'];
  reviewerId: Scalars['ID']['output'];
  reviewerType: Scalars['String']['output'];
  submittedAt?: Maybe<Scalars['String']['output']>;
};

export type PermissionInfo = {
  __typename?: 'PermissionInfo';
  actions: Array<Scalars['String']['output']>;
  resource: Scalars['String']['output'];
};

export type PostVacancyInput = {
  department: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  jobType: Scalars['String']['input'];
  noOfPositions: Scalars['Int']['input'];
  requiredExperience?: InputMaybe<Scalars['Int']['input']>;
  requiredQualification?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type Program = {
  __typename?: 'Program';
  active: Scalars['Boolean']['output'];
  durationMonths: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  subjectIds: Array<Scalars['ID']['output']>;
  syllabusPath?: Maybe<Scalars['String']['output']>;
  targetLevel?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type QualificationInput = {
  board?: InputMaybe<Scalars['String']['input']>;
  exam: Scalars['String']['input'];
  gradeGpa?: InputMaybe<Scalars['String']['input']>;
  institution: Scalars['String']['input'];
  passingYear?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  getAcademicYears: Array<AcademicYear>;
  getAllBatches: Array<Batch>;
  getAllNotices: Array<Notice>;
  getApplicationsByVacancy: Array<JobApplication>;
  getAssignmentsByBatch: Array<Assignment>;
  getAttendanceBySession: Array<Attendance>;
  getAttendanceSummary: AttendanceSummary;
  getBatchFeeReport: BatchFeeReport;
  getBatchInvoices: Array<StudentInvoice>;
  getBatchesByBranch: Array<Batch>;
  getBranch?: Maybe<Branch>;
  getBranches: Array<Branch>;
  getCenter?: Maybe<Center>;
  getDefaulters: Array<DefaulterInfo>;
  getDepartment: DepartmentDto;
  getDepartments: Array<DepartmentDto>;
  getDiscounts: Array<Discount>;
  getEmployee: Employee;
  getEmployees: Array<Employee>;
  getEnrollmentsByBatch: Array<Enrollment>;
  getEnrollmentsByStudent: Array<Enrollment>;
  getExamAssignments: Array<ExamAssignment>;
  getExamById: Exam;
  getExamsByBatch: Array<Exam>;
  getExpiringCertifications: Array<Certification>;
  getFeatureFlags: Array<FeatureFlag>;
  getFeePlans: Array<FeePlan>;
  getFeeTypes: Array<FeeType>;
  getGuardians: Array<Guardian>;
  getHolidays: Array<Holiday>;
  getInvoice?: Maybe<Invoice>;
  getInvoices: Array<Invoice>;
  getLateFinePolicy?: Maybe<LateFinePolicy>;
  getLeaveApplications: Array<LeaveApplication>;
  getLeaveBalance: Array<LeaveBalance>;
  getLeavePolicies: Array<LeavePolicy>;
  getMaterialsByBatch: Array<StudyMaterial>;
  getMonthlyAttendanceSheet: Array<EmployeeAttendance>;
  getMyAttendanceSheet: Array<EmployeeAttendance>;
  getMyBatches: Array<Batch>;
  getMyEmployeeProfile: Employee;
  getMyExamAttempt?: Maybe<ExamAttempt>;
  getMyLatestPayslip: PayrollEntry;
  getMyLeaveApplications: Array<LeaveApplication>;
  getMyLeaveBalance: Array<LeaveBalance>;
  getMyOvertimeClaims: Array<OvertimeClaim>;
  getMyPayrollRuns: Array<PayrollRun>;
  getMyPayrollSummary: PayrollSummary;
  getMyPayslips: Array<PayrollEntry>;
  getMyPlan: SubscriptionPlan;
  getMyResultBreakdown: ExamResultBreakdown;
  getMySalaryStructure: SalaryStructure;
  getMyScheduledExams: Array<Exam>;
  getNoticesForBatch: Array<Notice>;
  getOrgChart: Array<OrgNode>;
  getOvertimeClaims: Array<OvertimeClaim>;
  getPIPs: Array<Pip>;
  getPaymentsByInvoice: Array<StudentPayment>;
  getPayrollRunEligibleEmployees: Array<Employee>;
  getPayrollRunEntries: Array<PayrollEntry>;
  getPayrollRuns: Array<PayrollRun>;
  getPayslip: PayrollEntry;
  getPendingOvertimeClaims: Array<OvertimeClaim>;
  getPerformanceDashboard: Array<PerformanceDashboard>;
  getPrograms: Array<Program>;
  getQuestionById: Question;
  getQuestionsBySubject: Array<Question>;
  getQuestionsByTenant: Array<Question>;
  getResultsByExam: Array<ExamResult>;
  getSalaryPolicies: Array<SalaryPolicy>;
  getSalaryStructure: SalaryStructure;
  getSchedulesByBatch: Array<RecurringSchedule>;
  getSessionsByBatch: Array<Session>;
  getSkillMatrix: Array<SkillTag>;
  getStudent: Student;
  getStudentDocuments: Array<StudentDocument>;
  getStudentInvoice: StudentInvoice;
  getStudentInvoices: Array<StudentInvoice>;
  getStudents: Array<Student>;
  getSubjects: Array<Subject>;
  getSubjectsByBatch: Array<Subject>;
  getSubmissions: Array<Submission>;
  getSubscriptionPlan?: Maybe<SubscriptionPlan>;
  getSubscriptionPlans: Array<SubscriptionPlan>;
  getTeachers: Array<User>;
  getTenant?: Maybe<Tenant>;
  getTenantRoles: Array<TenantRole>;
  getTenants: Array<Tenant>;
  getUser?: Maybe<User>;
  getUsers: Array<Maybe<User>>;
  getVacancies: Array<JobVacancy>;
  isFeatureEnabled: Scalars['Boolean']['output'];
  me: MeResponse;
  myAttendanceBySession: Array<Attendance>;
  myAttendanceSummary: AttendanceSummary;
  myEnrollments: Array<Enrollment>;
  myImpersonationStatus: UserImpersonationStatus;
  myInvoices: Array<StudentInvoice>;
  myNotifications: Array<Notification>;
  myResults: Array<ExamResult>;
  myRoutine: Array<RecurringSchedule>;
  myStudentProfile: Student;
  myUnreadCount: Scalars['Int']['output'];
  suggestSubstitutes: Array<Employee>;
};


export type QueryGetApplicationsByVacancyArgs = {
  vacancyId: Scalars['ID']['input'];
};


export type QueryGetAssignmentsByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetAttendanceBySessionArgs = {
  sessionId: Scalars['ID']['input'];
};


export type QueryGetAttendanceSummaryArgs = {
  studentId: Scalars['ID']['input'];
};


export type QueryGetBatchFeeReportArgs = {
  batchId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
};


export type QueryGetBatchInvoicesArgs = {
  batchId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
};


export type QueryGetBatchesByBranchArgs = {
  branchId: Scalars['ID']['input'];
};


export type QueryGetBranchArgs = {
  branchId: Scalars['ID']['input'];
};


export type QueryGetBranchesArgs = {
  centerId: Scalars['ID']['input'];
};


export type QueryGetDefaultersArgs = {
  batchId?: InputMaybe<Scalars['ID']['input']>;
  month?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetDepartmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetEmployeeArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryGetEmployeesArgs = {
  role?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetEnrollmentsByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetEnrollmentsByStudentArgs = {
  studentId: Scalars['ID']['input'];
};


export type QueryGetExamAssignmentsArgs = {
  examId: Scalars['ID']['input'];
};


export type QueryGetExamByIdArgs = {
  examId: Scalars['ID']['input'];
};


export type QueryGetExamsByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetFeePlansArgs = {
  batchId?: InputMaybe<Scalars['ID']['input']>;
  programId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetGuardiansArgs = {
  studentId: Scalars['ID']['input'];
};


export type QueryGetHolidaysArgs = {
  year: Scalars['String']['input'];
};


export type QueryGetInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetInvoicesArgs = {
  tenantId: Scalars['ID']['input'];
};


export type QueryGetLeaveApplicationsArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryGetLeaveBalanceArgs = {
  employeeId: Scalars['ID']['input'];
  year: Scalars['Int']['input'];
};


export type QueryGetLeavePoliciesArgs = {
  departmentId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetMaterialsByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetMonthlyAttendanceSheetArgs = {
  employeeId: Scalars['ID']['input'];
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryGetMyAttendanceSheetArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryGetMyExamAttemptArgs = {
  examId: Scalars['ID']['input'];
};


export type QueryGetMyLeaveBalanceArgs = {
  year: Scalars['Int']['input'];
};


export type QueryGetMyPayrollSummaryArgs = {
  year: Scalars['Int']['input'];
};


export type QueryGetMyResultBreakdownArgs = {
  examId: Scalars['ID']['input'];
};


export type QueryGetNoticesForBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetOvertimeClaimsArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryGetPiPsArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryGetPaymentsByInvoiceArgs = {
  invoiceId: Scalars['ID']['input'];
};


export type QueryGetPayrollRunEligibleEmployeesArgs = {
  payrollRunId: Scalars['ID']['input'];
};


export type QueryGetPayrollRunEntriesArgs = {
  payrollRunId: Scalars['ID']['input'];
};


export type QueryGetPayslipArgs = {
  employeeId: Scalars['ID']['input'];
  payrollRunId: Scalars['ID']['input'];
};


export type QueryGetPerformanceDashboardArgs = {
  cycleId: Scalars['ID']['input'];
};


export type QueryGetQuestionByIdArgs = {
  questionId: Scalars['ID']['input'];
};


export type QueryGetQuestionsBySubjectArgs = {
  subjectId: Scalars['ID']['input'];
};


export type QueryGetResultsByExamArgs = {
  examId: Scalars['ID']['input'];
};


export type QueryGetSalaryStructureArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryGetSchedulesByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetSessionsByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetSkillMatrixArgs = {
  employeeId: Scalars['ID']['input'];
};


export type QueryGetStudentArgs = {
  studentId: Scalars['ID']['input'];
};


export type QueryGetStudentDocumentsArgs = {
  studentId: Scalars['ID']['input'];
};


export type QueryGetStudentInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetStudentInvoicesArgs = {
  studentId: Scalars['ID']['input'];
};


export type QueryGetSubjectsByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetSubmissionsArgs = {
  assignmentId: Scalars['ID']['input'];
};


export type QueryGetSubscriptionPlanArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetTenantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetTenantsArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};


export type QueryGetUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetUsersArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  query?: Scalars['String']['input'];
};


export type QueryIsFeatureEnabledArgs = {
  flagName: Scalars['String']['input'];
  tenantId: Scalars['ID']['input'];
};


export type QueryMyAttendanceBySessionArgs = {
  sessionId: Scalars['ID']['input'];
};


export type QueryMyNotificationsArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};


export type QueryMyRoutineArgs = {
  batchId: Scalars['ID']['input'];
};


export type QuerySuggestSubstitutesArgs = {
  leaveApplicationId: Scalars['ID']['input'];
};

export type Question = {
  __typename?: 'Question';
  active: Scalars['Boolean']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  defaultMarks: Scalars['Int']['output'];
  difficulty?: Maybe<Difficulty>;
  id: Scalars['ID']['output'];
  options: Array<QuestionOption>;
  scoringMode: ScoringMode;
  subjectId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
  text: Scalars['String']['output'];
  topic?: Maybe<Scalars['String']['output']>;
  type: QuestionType;
};

export type QuestionBreakdown = {
  __typename?: 'QuestionBreakdown';
  correct: Scalars['Boolean']['output'];
  examQuestionId: Scalars['ID']['output'];
  marksAwarded: Scalars['Float']['output'];
  options: Array<BreakdownOption>;
  questionTextSnapshot: Scalars['String']['output'];
  selectedOrders: Array<Scalars['Int']['output']>;
  typeSnapshot: QuestionType;
};

export type QuestionOption = {
  __typename?: 'QuestionOption';
  correct: Scalars['Boolean']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  order: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type QuestionOptionInput = {
  correct: Scalars['Boolean']['input'];
  order: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export enum QuestionType {
  McqMulti = 'MCQ_MULTI',
  McqSingle = 'MCQ_SINGLE'
}

export type RecordCheckInInput = {
  checkInTime: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
};

export type RecordCheckOutInput = {
  checkOutTime: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
};

export type RecordPaymentInput = {
  amount: Scalars['Float']['input'];
  invoiceId: Scalars['ID']['input'];
  method: Scalars['String']['input'];
  transactionRef?: InputMaybe<Scalars['String']['input']>;
};

export type RecordStudentPaymentInput = {
  amount: Scalars['Float']['input'];
  invoiceId: Scalars['ID']['input'];
  method: Scalars['String']['input'];
  paidAt?: InputMaybe<Scalars['String']['input']>;
  remarks?: InputMaybe<Scalars['String']['input']>;
  studentId: Scalars['ID']['input'];
  transactionRef: Scalars['String']['input'];
};

export type RecurringSchedule = {
  __typename?: 'RecurringSchedule';
  active: Scalars['Boolean']['output'];
  batchId: Scalars['ID']['output'];
  dayOfWeek: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  roomName?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['String']['output'];
  subjectId?: Maybe<Scalars['ID']['output']>;
  subjectName?: Maybe<Scalars['String']['output']>;
  teacherId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type RequestManualAttendanceInput = {
  attendanceDate: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
};

export type ReviewCycle = {
  __typename?: 'ReviewCycle';
  cycleType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
  submissionDeadline: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type RunPayrollInput = {
  excludedEmployeeIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};

export type SalaryPolicy = {
  __typename?: 'SalaryPolicy';
  basic: Scalars['Float']['output'];
  deductions: Scalars['Float']['output'];
  designation?: Maybe<Scalars['String']['output']>;
  houseRent: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  medical: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  overtimeHourlyRate?: Maybe<Scalars['Float']['output']>;
  tenantId: Scalars['ID']['output'];
  transport: Scalars['Float']['output'];
};

export type SalaryPolicyInput = {
  basic: Scalars['Float']['input'];
  deductions?: InputMaybe<Scalars['Float']['input']>;
  designation?: InputMaybe<Scalars['String']['input']>;
  houseRent: Scalars['Float']['input'];
  isDefault: Scalars['Boolean']['input'];
  medical: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  overtimeHourlyRate?: InputMaybe<Scalars['Float']['input']>;
  transport: Scalars['Float']['input'];
};

export type SalaryStructure = {
  __typename?: 'SalaryStructure';
  allowances?: Maybe<Scalars['Float']['output']>;
  basicSalary: Scalars['Float']['output'];
  deductions?: Maybe<Scalars['Float']['output']>;
  effectiveFrom: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  houseRent?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  medical?: Maybe<Scalars['Float']['output']>;
  netSalary: Scalars['Float']['output'];
  tenantId: Scalars['ID']['output'];
  transport?: Maybe<Scalars['Float']['output']>;
};

export type ScheduleExamInput = {
  assignAllInBatch: Scalars['Boolean']['input'];
  durationMinutes: Scalars['Int']['input'];
  examId: Scalars['ID']['input'];
  manualStudentIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  startAt: Scalars['String']['input'];
};

export enum ScoringMode {
  AllOrNothing = 'ALL_OR_NOTHING',
  PartialCredit = 'PARTIAL_CREDIT'
}

export type SendNotificationInput = {
  body: Scalars['String']['input'];
  recipientStudentId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};

export type Session = {
  __typename?: 'Session';
  batchId: Scalars['ID']['output'];
  cancelReason?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
  examId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  recurringScheduleId?: Maybe<Scalars['ID']['output']>;
  roomName?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['String']['output'];
  status: Scalars['String']['output'];
  substituteTeacherId?: Maybe<Scalars['ID']['output']>;
  teacherId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
  type: Scalars['String']['output'];
};

export type SetLateFinePolicyInput = {
  fineType: Scalars['String']['input'];
  graceDays: Scalars['Int']['input'];
  value: Scalars['Float']['input'];
};

export type SetSalaryStructureInput = {
  basicSalary: Scalars['Float']['input'];
  deductions?: InputMaybe<Scalars['Float']['input']>;
  effectiveFrom: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  houseRent?: InputMaybe<Scalars['Float']['input']>;
  medical?: InputMaybe<Scalars['Float']['input']>;
  transport?: InputMaybe<Scalars['Float']['input']>;
};

export type SetupCenterInput = {
  academicYearStartMonth?: InputMaybe<Scalars['Int']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  establishedYear?: InputMaybe<Scalars['Int']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nameBangla?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  tagline?: InputMaybe<Scalars['String']['input']>;
};

export type SkillTag = {
  __typename?: 'SkillTag';
  employeeId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  proficiencyLevel: Scalars['String']['output'];
  skill: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
};

/**
 * # Phase 4 — Student Management: Profiles, Guardians, Enrollment, Attendance, Document Vault
 *  ─── Types ──────────────────────────────────────────────────────────────────
 */
export type Student = {
  __typename?: 'Student';
  address?: Maybe<Scalars['String']['output']>;
  admissionSource?: Maybe<Scalars['String']['output']>;
  bloodGroup?: Maybe<Scalars['String']['output']>;
  classLevel?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  division?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  firstNameBangla?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  previousInstitution?: Maybe<Scalars['String']['output']>;
  previousResult?: Maybe<Scalars['String']['output']>;
  qualifications?: Maybe<Array<StudentQualification>>;
  referrerId?: Maybe<Scalars['ID']['output']>;
  status: Scalars['String']['output'];
  studentCode: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  upazila?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
  village?: Maybe<Scalars['String']['output']>;
};

export type StudentDocument = {
  __typename?: 'StudentDocument';
  filePath?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  studentId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
  type?: Maybe<Scalars['String']['output']>;
  uploadedAt?: Maybe<Scalars['String']['output']>;
  uploadedBy?: Maybe<Scalars['ID']['output']>;
};

export type StudentInvoice = {
  __typename?: 'StudentInvoice';
  batchId: Scalars['ID']['output'];
  discountAmount: Scalars['Float']['output'];
  dueDate: Scalars['String']['output'];
  fineAmount: Scalars['Float']['output'];
  gracePeriodDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lineItems: Array<LineItem>;
  month: Scalars['String']['output'];
  paidAmount: Scalars['Float']['output'];
  pdfPath?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  studentId: Scalars['ID']['output'];
  subtotal: Scalars['Float']['output'];
  tenantId: Scalars['ID']['output'];
  total: Scalars['Float']['output'];
};

export type StudentPayment = {
  __typename?: 'StudentPayment';
  amount: Scalars['Float']['output'];
  collectedAt: Scalars['String']['output'];
  collectedBy: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  invoiceId: Scalars['ID']['output'];
  method: Scalars['String']['output'];
  receiptNumber?: Maybe<Scalars['String']['output']>;
  receiptPath?: Maybe<Scalars['String']['output']>;
  remarks?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  studentId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
  transactionRef: Scalars['String']['output'];
};

export type StudentQualification = {
  __typename?: 'StudentQualification';
  board?: Maybe<Scalars['String']['output']>;
  exam: Scalars['String']['output'];
  gradeGpa?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  institution: Scalars['String']['output'];
  passingYear?: Maybe<Scalars['String']['output']>;
};

export type StudyMaterial = {
  __typename?: 'StudyMaterial';
  batchId?: Maybe<Scalars['ID']['output']>;
  filePath?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  subjectId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  uploadedAt?: Maybe<Scalars['String']['output']>;
  uploadedBy?: Maybe<Scalars['ID']['output']>;
  videoUrl?: Maybe<Scalars['String']['output']>;
  visibleStudentIds?: Maybe<Array<Scalars['ID']['output']>>;
  visibleToAll: Scalars['Boolean']['output'];
};

/**
 * # Phase 3 — Academic Core: Subjects, Programs, Batches, Sessions, Materials, Assignments
 *  ─── Types ──────────────────────────────────────────────────────────────────
 */
export type Subject = {
  __typename?: 'Subject';
  active: Scalars['Boolean']['output'];
  batchId?: Maybe<Scalars['ID']['output']>;
  classLevel?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nameBangla?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type Submission = {
  __typename?: 'Submission';
  assignmentId: Scalars['ID']['output'];
  feedback?: Maybe<Scalars['String']['output']>;
  feedbackAt?: Maybe<Scalars['String']['output']>;
  filePath?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  late: Scalars['Boolean']['output'];
  linkUrl?: Maybe<Scalars['String']['output']>;
  studentId: Scalars['ID']['output'];
  submittedAt?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type SubmitAnswerInput = {
  attemptId: Scalars['ID']['input'];
  examQuestionId: Scalars['ID']['input'];
  selectedOrders: Array<Scalars['Int']['input']>;
};

export type SubmitOvertimeClaimInput = {
  claimDate: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  hours: Scalars['Float']['input'];
  reason: Scalars['String']['input'];
  sessionId?: InputMaybe<Scalars['ID']['input']>;
};

export type SubmitReviewInput = {
  comments?: InputMaybe<Scalars['String']['input']>;
  cycleId: Scalars['ID']['input'];
  overallScore: Scalars['Int']['input'];
  revieweeId: Scalars['ID']['input'];
  reviewerId: Scalars['ID']['input'];
  reviewerType: Scalars['String']['input'];
};

export type SubscriptionInfo = {
  __typename?: 'SubscriptionInfo';
  features: Array<Scalars['String']['output']>;
  plan: Scalars['String']['output'];
};

/** # Platform / Bongo Portal — Subscription Plans, Tenants, Billing, Feature Flags */
export type SubscriptionPlan = {
  __typename?: 'SubscriptionPlan';
  active: Scalars['Boolean']['output'];
  billingCycle: Scalars['String']['output'];
  featureFlags: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maxBranches: Scalars['Int']['output'];
  maxStaff: Scalars['Int']['output'];
  maxStudents: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  priceBdt: Scalars['Float']['output'];
  smsCredits: Scalars['Int']['output'];
  storageGb: Scalars['Int']['output'];
};

export type Tenant = {
  __typename?: 'Tenant';
  address?: Maybe<Scalars['String']['output']>;
  contactEmail: Scalars['String']['output'];
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  eBIN?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  legalName: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  planId: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tradeLicense?: Maybe<Scalars['String']['output']>;
  trialEndsAt?: Maybe<Scalars['String']['output']>;
};

export type TenantRole = {
  __typename?: 'TenantRole';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
  system: Scalars['Boolean']['output'];
  tenantId: Scalars['ID']['output'];
};

export type UpdateBatchInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  classLevel?: InputMaybe<Scalars['String']['input']>;
  coTeacherIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  courseName?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  feePlans?: InputMaybe<Array<BatchFeePlanInput>>;
  headTeacherId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBranchInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  closeTime?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  managerId?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openTime?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  workingDays?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateDepartmentInput = {
  defaultRoles?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEmployeeInput = {
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  designation?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  employeeId: Scalars['ID']['input'];
  nid?: InputMaybe<Scalars['String']['input']>;
  tin?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePipProgressInput = {
  id: Scalars['ID']['input'];
  progressNotes?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePlanInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  billingCycle?: InputMaybe<Scalars['String']['input']>;
  featureFlags?: InputMaybe<Array<Scalars['String']['input']>>;
  id: Scalars['ID']['input'];
  maxBranches?: InputMaybe<Scalars['Int']['input']>;
  maxStaff?: InputMaybe<Scalars['Int']['input']>;
  maxStudents?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  priceBdt?: InputMaybe<Scalars['Float']['input']>;
  smsCredits?: InputMaybe<Scalars['Int']['input']>;
  storageGb?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProgramInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  durationMonths?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  subjectIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  syllabusPath?: InputMaybe<Scalars['String']['input']>;
  targetLevel?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQuestionInput = {
  defaultMarks: Scalars['Int']['input'];
  difficulty?: InputMaybe<Difficulty>;
  id: Scalars['ID']['input'];
  options: Array<QuestionOptionInput>;
  scoringMode: ScoringMode;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  text: Scalars['String']['input'];
  topic?: InputMaybe<Scalars['String']['input']>;
  type: QuestionType;
};

export type UpdateRecurringScheduleInput = {
  dayOfWeek?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  roomName?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  teacherId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateStudentInput = {
  classLevel?: InputMaybe<Scalars['String']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  division?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  firstNameBangla?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  upazila?: InputMaybe<Scalars['String']['input']>;
  village?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSubjectInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  batchId?: InputMaybe<Scalars['ID']['input']>;
  classLevel?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  nameBangla?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTenantInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  eBIN?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  legalName?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  planId?: InputMaybe<Scalars['ID']['input']>;
  tradeLicense?: InputMaybe<Scalars['String']['input']>;
};

export type UploadEmployeeDocumentInput = {
  documentType: Scalars['String']['input'];
  employeeId: Scalars['ID']['input'];
  filePath: Scalars['String']['input'];
};

export type UploadMaterialInput = {
  batchId: Scalars['ID']['input'];
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
  videoUrl?: InputMaybe<Scalars['String']['input']>;
  visibleStudentIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  visibleToAll: Scalars['Boolean']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActivated: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  profilePicture?: Maybe<Scalars['String']['output']>;
  roles: Array<Scalars['String']['output']>;
};

export type UserImpersonationResult = {
  __typename?: 'UserImpersonationResult';
  sessionId: Scalars['ID']['output'];
  startedAt: Scalars['String']['output'];
  targetUserId: Scalars['ID']['output'];
  targetUserName: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type UserImpersonationStatus = {
  __typename?: 'UserImpersonationStatus';
  active: Scalars['Boolean']['output'];
  adminName?: Maybe<Scalars['String']['output']>;
  adminUserId?: Maybe<Scalars['ID']['output']>;
  asImpersonatedUser: Scalars['Boolean']['output'];
  sessionId?: Maybe<Scalars['ID']['output']>;
  startedAt?: Maybe<Scalars['String']['output']>;
  targetUserId?: Maybe<Scalars['ID']['output']>;
  targetUserName?: Maybe<Scalars['String']['output']>;
};

export type UserInfo = {
  __typename?: 'UserInfo';
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActivated: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  profilePicture?: Maybe<Scalars['String']['output']>;
};

export type UserRegistration = {
  confirmPassword: Scalars['String']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export enum UserType {
  Bongo = 'BONGO',
  Coaching = 'COACHING'
}

export type UserUpdate = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profilePicture?: InputMaybe<Scalars['String']['input']>;
};
