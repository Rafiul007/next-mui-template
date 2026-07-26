// Mirrors com.bongo.bongoedu360.common.domain.vo.Permission exactly -- every
// `value` here MUST be a literal enum constant, since
// TenantRoleService.createCustomRole does Permission.valueOf(name) with no
// fallback. There is no generic READ/WRITE-suffix convention in the backend
// (that was a previous, entirely fictional frontend invention that broke
// custom-role creation for nearly every permission) -- most permissions are
// a single flag implying read+write together; only a handful of domains
// (User, Attendance, Notice/Notification) have genuinely separate discrete
// permissions. `readOnly` mirrors Permission.actions() in the backend: names
// ending in _VIEW or _READ resolve to a single "READ" action there, so we
// compute it the same way here instead of guessing.
//
// Platform-only permissions (PLATFORM_ADMIN, TENANT_MANAGE, BILLING_MANAGE,
// SUPPORT_TICKET_MANAGE, IMPERSONATE_USER) are intentionally excluded --
// they're Bongo-internal and must never be assignable from inside a tenant's
// own custom-role UI.

export type PermissionOption = {
  value: string;
  label: string;
  description: string;
  readOnly: boolean;
};

export type PermissionGroup = {
  key: string;
  title: string;
  description: string;
  options: PermissionOption[];
};

const perm = (value: string, label: string, description: string): PermissionOption => ({
  value,
  label,
  description,
  readOnly: /_VIEW$|_READ$/.test(value),
});

export const permissionGroups: PermissionGroup[] = [
  {
    key: "user-access",
    title: "User & access",
    description: "Employee account lifecycle and role assignment.",
    options: [
      perm("USER_READ", "View users", "View employee and user account details."),
      perm("USER_WRITE", "Edit users", "Create and update employee and user accounts."),
      perm("USER_DELETE", "Delete users", "Remove employee and user accounts."),
      perm("USER_ACTIVATE", "Activate/deactivate users", "Toggle workspace access for user accounts."),
      perm("USER_ROLE_MANAGE", "Manage user roles", "Assign or remove roles from user accounts."),
    ],
  },
  {
    key: "tenant-setup",
    title: "Center setup",
    description: "Core workspace setup and operational controls",
    options: [
      perm("CENTER_MANAGE", "Center details", "Update center profile and contact information."),
      perm("BRANCH_MANAGE", "Branches", "Create, edit, and deactivate branch records."),
      perm("CALENDAR_MANAGE", "Calendar & holidays", "Maintain closure days and calendar overrides."),
      perm("ORG_MANAGE", "Teams & structure", "Manage the internal organization hierarchy."),
      perm("ROLE_MANAGE", "Roles & access", "Create roles and assign them to employees."),
    ],
  },
  {
    key: "academics",
    title: "Academics",
    description: "Programs, batches, and learning operations.",
    options: [
      perm("SUBJECT_MANAGE", "Subjects", "Manage subject catalog configuration."),
      perm("PROGRAM_MANAGE", "Programs", "Manage academic program configuration."),
      perm("BATCH_MANAGE", "Batches", "Create and update batches and class groups."),
      perm("SESSION_MANAGE", "Class schedule", "Manage recurring sessions and class timing."),
      perm("MATERIAL_MANAGE", "Materials", "Create and organize study materials."),
      perm("MATERIAL_UPLOAD", "Upload materials", "Upload files for study materials."),
      perm("ASSIGNMENT_MANAGE", "Assignments", "Assign and review student homework and tasks."),
      perm("EXAM_MANAGE", "Exams", "Create and schedule exams for batches."),
      perm("MARKS_ENTRY", "Marks entry", "Enter marks for exam submissions."),
      perm("RESULT_PUBLISH", "Publish results", "Publish exam results and grades."),
      perm("QUESTION_BANK_MANAGE", "Question bank", "Manage the shared exam question bank."),
      perm("EXAM_APPROVE", "Approve exams", "Approve exams before they go live."),
      perm("EXAM_ATTEMPT", "Attempt exams", "Take exams as a student."),
    ],
  },
  {
    key: "students",
    title: "Students",
    description: "Admissions, enrollment, attendance, and self-service views.",
    options: [
      perm("STUDENT_MANAGE", "Student profiles", "Maintain student records and profile data."),
      perm("STUDENT_ENROLL", "Enroll students", "Enroll students into batches."),
      perm("STUDENT_ADMIT", "Admit students", "Process new student admissions."),
      perm("ATTENDANCE_MARK", "Mark attendance", "Record student attendance."),
      perm("ATTENDANCE_APPROVE", "Approve attendance", "Approve or correct attendance records."),
      perm("ATTENDANCE_VIEW", "View attendance", "View student attendance records."),
      perm("DOCUMENT_MANAGE", "Documents", "Manage student documents and certificates."),
      perm("SCHEDULE_VIEW", "View own schedule", "View own class schedule (student self-service)."),
      perm("RESULT_VIEW", "View own results", "View own exam results (student self-service)."),
      perm("MATERIAL_VIEW", "View materials", "View study materials (student self-service)."),
      perm("ASSIGNMENT_SUBMIT", "Submit assignments", "Submit assignments as a student."),
      perm("FEE_VIEW_OWN", "View own fees", "View own fee and payment records (student self-service)."),
      perm("ENROLLMENT_VIEW_OWN", "View own enrollment", "View own enrollment details (student self-service)."),
    ],
  },
  {
    key: "communication",
    title: "Communication",
    description: "Notices and notifications.",
    options: [
      perm("NOTICE_MANAGE", "Manage notices", "Create and publish notices for students and staff."),
      perm("NOTICE_VIEW", "View notices", "View published notices."),
      perm("NOTIFICATION_SEND", "Send notifications", "Send notifications to students and staff."),
      perm("NOTIFICATION_VIEW", "View notifications", "View received notifications."),
    ],
  },
  {
    key: "finance",
    title: "Finance",
    description: "Financial setup and collection workflows.",
    options: [
      perm("FEE_STRUCTURE_MANAGE", "Fee structures", "Manage fee structures and billing rules."),
      perm("FEE_COLLECT", "Collect payments", "Record and monitor payment collection activity."),
      perm("FEE_INVOICE_MANAGE", "Invoices", "Manage invoices."),
      perm("FEE_WAIVER_APPROVE", "Approve waivers", "Approve fee waivers and discounts."),
    ],
  },
  {
    key: "hr-staff",
    title: "HR & staff",
    description: "Employee accounts, payroll, and leave management.",
    options: [
      perm("HR_EMPLOYEE_MANAGE", "Employee records", "Manage employee HR records."),
      perm("HR_LEAVE_APPROVE", "Approve leave", "Review and approve employee leave requests."),
      perm("HR_PAYROLL_RUN", "Run payroll", "Process employee salary runs."),
      perm("HR_PAYROLL_APPROVE", "Approve payroll", "Approve and disburse payroll runs."),
      perm("HR_PERFORMANCE_MANAGE", "Performance", "Conduct appraisals and track performance reviews."),
      perm("HR_RECRUITMENT", "Recruitment", "Manage vacancies and candidate pipelines."),
    ],
  },
  {
    key: "reporting",
    title: "Reporting & audit",
    description: "Analytics, exports, and audit trail visibility.",
    options: [
      perm("REPORT_VIEW", "View reports", "View analytics and reports."),
      perm("REPORT_EXPORT", "Export reports", "Export reports and analytics data."),
      perm("AUDIT_VIEW", "View audit log", "View the workspace audit trail."),
    ],
  },
];

export const permissionLookup = new Map(
  permissionGroups.flatMap((group) => group.options.map((option) => [option.value, option] as const)),
);

export const formatPermissionLabel = (permission: string): string => {
  const opt = permissionLookup.get(permission);
  if (opt) return opt.label;
  return permission
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export type RoleTemplate = {
  id: string;
  label: string;
  permissions: string[];
};

// Mirrors com.bongo.bongoedu360.common.infrastructure.security.RolePermissions
// system-role sets, so a template starts from a real, already-working
// permission combination instead of a guessed one.
export const roleTemplates: RoleTemplate[] = [
  {
    id: "admin",
    label: "Admin",
    permissions: permissionGroups.flatMap((g) => g.options.map((o) => o.value)),
  },
  {
    id: "hr",
    label: "HR",
    permissions: [
      "USER_READ", "USER_WRITE", "USER_ACTIVATE", "USER_ROLE_MANAGE",
      "HR_EMPLOYEE_MANAGE", "HR_LEAVE_APPROVE", "HR_PAYROLL_RUN",
      "HR_PERFORMANCE_MANAGE", "HR_RECRUITMENT", "REPORT_VIEW", "REPORT_EXPORT",
    ],
  },
  {
    id: "accountant",
    label: "Accountant",
    permissions: [
      "USER_READ", "FEE_STRUCTURE_MANAGE", "FEE_COLLECT",
      "FEE_INVOICE_MANAGE", "FEE_WAIVER_APPROVE", "REPORT_VIEW", "REPORT_EXPORT",
      "HR_PAYROLL_APPROVE",
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    permissions: [
      "USER_READ", "MATERIAL_MANAGE", "MATERIAL_UPLOAD", "ASSIGNMENT_MANAGE",
      "MARKS_ENTRY", "ATTENDANCE_MARK", "NOTIFICATION_SEND",
      "QUESTION_BANK_MANAGE", "EXAM_MANAGE",
    ],
  },
  {
    id: "student",
    label: "Student",
    permissions: [
      "USER_READ", "USER_WRITE", "ATTENDANCE_VIEW", "SCHEDULE_VIEW", "RESULT_VIEW",
      "NOTICE_VIEW", "NOTIFICATION_VIEW", "MATERIAL_VIEW", "ASSIGNMENT_SUBMIT",
      "FEE_VIEW_OWN", "ENROLLMENT_VIEW_OWN", "EXAM_ATTEMPT",
    ],
  },
];
