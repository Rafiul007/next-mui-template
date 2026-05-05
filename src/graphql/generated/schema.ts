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

export type AddGuardianInput = {
  name: Scalars['String']['input'];
  nid?: InputMaybe<Scalars['String']['input']>;
  occupation?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  relationship: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};

/**  ─── Inputs ────────────────────────────────────────────────────────────────── */
export type AdmitStudentInput = {
  admissionSource?: InputMaybe<Scalars['String']['input']>;
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
  phone?: InputMaybe<Scalars['String']['input']>;
  previousInstitution?: InputMaybe<Scalars['String']['input']>;
  previousResult?: InputMaybe<Scalars['String']['input']>;
  referrerId?: InputMaybe<Scalars['ID']['input']>;
  upazila?: InputMaybe<Scalars['String']['input']>;
  village?: InputMaybe<Scalars['String']['input']>;
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

export type Batch = {
  __typename?: 'Batch';
  branchId?: Maybe<Scalars['ID']['output']>;
  capacity: Scalars['Int']['output'];
  classLevel?: Maybe<Scalars['String']['output']>;
  coTeacherIds?: Maybe<Array<Scalars['ID']['output']>>;
  endDate?: Maybe<Scalars['String']['output']>;
  enrolledCount: Scalars['Int']['output'];
  headTeacherId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  programId?: Maybe<Scalars['ID']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
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
  classLevel?: InputMaybe<Scalars['String']['input']>;
  coTeacherIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  headTeacherId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  programId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
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

export type CreateDiscountInput = {
  applicableRuleJson?: InputMaybe<Scalars['String']['input']>;
  discountType: Scalars['String']['input'];
  isPercentage: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  value: Scalars['Float']['input'];
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
  typeName: Scalars['String']['input'];
};

export type CreateHolidayInput = {
  branchId?: InputMaybe<Scalars['ID']['input']>;
  date: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
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

export type CreateRecurringScheduleInput = {
  batchId: Scalars['ID']['input'];
  dayOfWeek: Scalars['String']['input'];
  endTime: Scalars['String']['input'];
  roomName?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['String']['input'];
  teacherId?: InputMaybe<Scalars['ID']['input']>;
};

/**  ─── Inputs ────────────────────────────────────────────────────────────────── */
export type CreateSubjectInput = {
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

export type Discount = {
  __typename?: 'Discount';
  applicableRuleJson?: Maybe<Scalars['String']['output']>;
  discountType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPercentage: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['ID']['output'];
  value: Scalars['Float']['output'];
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
  tenantId: Scalars['ID']['output'];
  typeName: Scalars['String']['output'];
};

export type Guardian = {
  __typename?: 'Guardian';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nid?: Maybe<Scalars['String']['output']>;
  occupation?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  relationship?: Maybe<Scalars['String']['output']>;
  studentId: Scalars['ID']['output'];
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

export type LateFinePolicy = {
  __typename?: 'LateFinePolicy';
  fineType: Scalars['String']['output'];
  graceDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
  value: Scalars['Float']['output'];
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

export type Mutation = {
  __typename?: 'Mutation';
  activateTenant: Tenant;
  addGuardian: Guardian;
  addOneOffSession: Session;
  addOrgNode: OrgNode;
  addRole?: Maybe<User>;
  admitStudent: Student;
  approveWaiver: StudentInvoice;
  assignRoleToUser: TenantRole;
  assignSubstitute: Session;
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
  createDiscount: Discount;
  createFeePlan: FeePlan;
  createFeeType: FeeType;
  createHoliday: Holiday;
  createProgram: Program;
  createRecurringSchedule: RecurringSchedule;
  createSubject: Subject;
  createSubscriptionPlan: SubscriptionPlan;
  createTenant: Tenant;
  deactivateBranch: Branch;
  deleteUser?: Maybe<Scalars['Boolean']['output']>;
  dropEnrollment: Enrollment;
  enrollStudent: Enrollment;
  generateMonthlyInvoices: Array<Invoice>;
  generateMonthlyStudentInvoices: Array<StudentInvoice>;
  giveFeedback: Submission;
  impersonateTenant: ImpersonationResult;
  inviteBongoUser: User;
  login: AuthResponse;
  logout: Scalars['Boolean']['output'];
  markAttendance: Array<Attendance>;
  reEnroll: Enrollment;
  recordPayment: PaymentResult;
  recordStudentPayment: StudentPayment;
  refresh: AuthResponse;
  requestWaiver: StudentInvoice;
  resendOtp?: Maybe<OtpResendStatus>;
  setActiveStatus?: Maybe<User>;
  setFeatureFlag: FeatureFlag;
  setLateFinePolicy: LateFinePolicy;
  setupCenter: Center;
  submitAssignment: Submission;
  suspendTenant: Tenant;
  terminateTenant: Tenant;
  updateBatch: Batch;
  updateBranch: Branch;
  updateCenter: Center;
  updateProfile?: Maybe<User>;
  updateProgram: Program;
  updateStudent: Student;
  updateSubject: Subject;
  updateSubscriptionPlan: SubscriptionPlan;
  updateTenant: Tenant;
  uploadMaterial: StudyMaterial;
  userRegistration?: Maybe<User>;
  verifyUser?: Maybe<User>;
};


export type MutationActivateTenantArgs = {
  tenantId: Scalars['ID']['input'];
};


export type MutationAddGuardianArgs = {
  guardian: AddGuardianInput;
};


export type MutationAddOneOffSessionArgs = {
  session: CreateOneOffSessionInput;
};


export type MutationAddOrgNodeArgs = {
  node: CreateOrgNodeInput;
};


export type MutationAddRoleArgs = {
  id: Scalars['String']['input'];
  roles: Array<Scalars['String']['input']>;
};


export type MutationAdmitStudentArgs = {
  student: AdmitStudentInput;
};


export type MutationApproveWaiverArgs = {
  invoiceId: Scalars['ID']['input'];
};


export type MutationAssignRoleToUserArgs = {
  roleName: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationAssignSubstituteArgs = {
  sessionId: Scalars['ID']['input'];
  substituteTeacherId: Scalars['ID']['input'];
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


export type MutationCreateDiscountArgs = {
  input: CreateDiscountInput;
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


export type MutationCreateProgramArgs = {
  program: CreateProgramInput;
};


export type MutationCreateRecurringScheduleArgs = {
  schedule: CreateRecurringScheduleInput;
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


export type MutationDeleteUserArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDropEnrollmentArgs = {
  enrollmentId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEnrollStudentArgs = {
  batchId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationGenerateMonthlyStudentInvoicesArgs = {
  batchId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
};


export type MutationGiveFeedbackArgs = {
  assignmentId: Scalars['ID']['input'];
  feedback: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationImpersonateTenantArgs = {
  tenantId: Scalars['ID']['input'];
};


export type MutationInviteBongoUserArgs = {
  user: InviteBongoUserInput;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationLogoutArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationMarkAttendanceArgs = {
  entries: Array<MarkAttendanceInput>;
};


export type MutationReEnrollArgs = {
  newBatchId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
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


export type MutationRequestWaiverArgs = {
  invoiceId: Scalars['ID']['input'];
};


export type MutationResendOtpArgs = {
  email: Scalars['String']['input'];
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


export type MutationSetupCenterArgs = {
  center: SetupCenterInput;
};


export type MutationSubmitAssignmentArgs = {
  assignmentId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationSuspendTenantArgs = {
  tenantId: Scalars['ID']['input'];
};


export type MutationTerminateTenantArgs = {
  tenantId: Scalars['ID']['input'];
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


export type MutationUpdateProfileArgs = {
  user?: InputMaybe<UserUpdate>;
};


export type MutationUpdateProgramArgs = {
  program: UpdateProgramInput;
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

export type Query = {
  __typename?: 'Query';
  getAcademicYears: Array<AcademicYear>;
  getAllBatches: Array<Batch>;
  getAssignmentsByBatch: Array<Assignment>;
  getAttendanceBySession: Array<Attendance>;
  getAttendanceSummary: AttendanceSummary;
  getBatchesByBranch: Array<Batch>;
  getBranch?: Maybe<Branch>;
  getBranches: Array<Branch>;
  getCenter?: Maybe<Center>;
  getDiscounts: Array<Discount>;
  getEnrollmentsByBatch: Array<Enrollment>;
  getEnrollmentsByStudent: Array<Enrollment>;
  getFeatureFlags: Array<FeatureFlag>;
  getFeePlans: Array<FeePlan>;
  getFeeTypes: Array<FeeType>;
  getGuardians: Array<Guardian>;
  getHolidays: Array<Holiday>;
  getInvoice?: Maybe<Invoice>;
  getInvoices: Array<Invoice>;
  getLateFinePolicy?: Maybe<LateFinePolicy>;
  getMaterialsByBatch: Array<StudyMaterial>;
  getOrgChart: Array<OrgNode>;
  getPaymentsByInvoice: Array<StudentPayment>;
  getPrograms: Array<Program>;
  getSchedulesByBatch: Array<RecurringSchedule>;
  getSessionsByBatch: Array<Session>;
  getStudent: Student;
  getStudentDocuments: Array<StudentDocument>;
  getStudentInvoice: StudentInvoice;
  getStudentInvoices: Array<StudentInvoice>;
  getStudents: Array<Student>;
  getSubjects: Array<Subject>;
  getSubmissions: Array<Submission>;
  getSubscriptionPlan?: Maybe<SubscriptionPlan>;
  getSubscriptionPlans: Array<SubscriptionPlan>;
  getTenant?: Maybe<Tenant>;
  getTenantRoles: Array<TenantRole>;
  getTenants: Array<Tenant>;
  getUser?: Maybe<User>;
  getUsers: Array<Maybe<User>>;
  isFeatureEnabled: Scalars['Boolean']['output'];
  me: User;
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


export type QueryGetBatchesByBranchArgs = {
  branchId: Scalars['ID']['input'];
};


export type QueryGetBranchArgs = {
  branchId: Scalars['ID']['input'];
};


export type QueryGetBranchesArgs = {
  centerId: Scalars['ID']['input'];
};


export type QueryGetEnrollmentsByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetEnrollmentsByStudentArgs = {
  studentId: Scalars['ID']['input'];
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


export type QueryGetMaterialsByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetPaymentsByInvoiceArgs = {
  invoiceId: Scalars['ID']['input'];
};


export type QueryGetSchedulesByBatchArgs = {
  batchId: Scalars['ID']['input'];
};


export type QueryGetSessionsByBatchArgs = {
  batchId: Scalars['ID']['input'];
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
  teacherId?: Maybe<Scalars['ID']['output']>;
  tenantId: Scalars['ID']['output'];
};

export type Session = {
  __typename?: 'Session';
  batchId: Scalars['ID']['output'];
  cancelReason?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
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

/**
 * # Phase 4 — Student Management: Profiles, Guardians, Enrollment, Attendance, Document Vault
 *  ─── Types ──────────────────────────────────────────────────────────────────
 */
export type Student = {
  __typename?: 'Student';
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
  phone?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  previousInstitution?: Maybe<Scalars['String']['output']>;
  previousResult?: Maybe<Scalars['String']['output']>;
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
  receiptPath?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  studentId: Scalars['ID']['output'];
  tenantId: Scalars['ID']['output'];
  transactionRef: Scalars['String']['output'];
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
  studentId: Scalars['ID']['output'];
  submittedAt?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['ID']['output'];
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
  endDate?: InputMaybe<Scalars['String']['input']>;
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

export type UserRegistration = {
  confirmPassword: Scalars['String']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type UserUpdate = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profilePicture?: InputMaybe<Scalars['String']['input']>;
};
