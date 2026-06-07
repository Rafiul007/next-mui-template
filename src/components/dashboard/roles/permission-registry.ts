export type PermissionOption = {
  value: string;
  label: string;
  description: string;
  readKey: string;
  writeKey: string;
};

export type PermissionGroup = {
  key: string;
  title: string;
  description: string;
  options: PermissionOption[];
};

const perm = (
  value: string,
  label: string,
  description: string,
): PermissionOption => ({
  value,
  label,
  description,
  readKey: `${value}_READ`,
  writeKey: `${value}_WRITE`,
});

export const permissionGroups: PermissionGroup[] = [
  {
    key: "tenant-setup",
    title: "Center setup",
    description: "Core workspace setup and operational controls",
    options: [
      perm("CENTER_MANAGE", "Center details", "Update center profile and contact information."),
      perm("BRANCH_MANAGE", "Branches", "Create, edit, and deactivate branch records."),
      perm("HOLIDAY_MANAGE", "Calendar & holidays", "Maintain closure days and calendar overrides."),
      perm("ORG_CHART_MANAGE", "Teams & structure", "Manage the internal organization hierarchy."),
      perm("ROLE_MANAGE", "Roles & access", "Create roles and assign them to employees."),
    ],
  },
  {
    key: "academics",
    title: "Academics",
    description: "Programs, batches, and learning operations.",
    options: [
      perm("PROGRAM_MANAGE", "Programs & subjects", "Manage academic catalog configuration."),
      perm("BATCH_MANAGE", "Batches", "Create and update batches and class groups."),
      perm("SCHEDULE_MANAGE", "Schedules", "Manage recurring sessions and class timing."),
      perm("HOMEWORK_MANAGE", "Homework & tasks", "Assign and review student homework and tasks."),
    ],
  },
  {
    key: "students",
    title: "Students",
    description: "Admissions, enrollment, and attendance workflows.",
    options: [
      perm("STUDENT_MANAGE", "Student profiles", "Maintain student records and profile data."),
      perm("ENROLLMENT_MANAGE", "Enrollments", "Control student enrollment and batch placement."),
      perm("ATTENDANCE_MANAGE", "Attendance", "Track attendance and attendance corrections."),
      perm("STUDENT_DOCUMENT_MANAGE", "Documents", "Manage student documents and certificates."),
    ],
  },
  {
    key: "hr-staff",
    title: "HR & staff",
    description: "Employee accounts, payroll, and leave management.",
    options: [
      perm("USER_MANAGE", "Employee accounts", "Activate employees and assign workspace roles."),
      perm("PAYROLL_MANAGE", "Payroll", "Process and manage employee salary records."),
      perm("LEAVE_MANAGE", "Leave management", "Review and approve employee leave requests."),
      perm("PERFORMANCE_MANAGE", "Performance", "Conduct appraisals and track performance reviews."),
    ],
  },
  {
    key: "finance",
    title: "Finance",
    description: "Financial setup and collection workflows.",
    options: [
      perm("BILLING_MANAGE", "Invoices & fee setup", "Manage fee structures, invoices, and billing rules."),
      perm("PAYMENT_MANAGE", "Payments", "Record and monitor payment collection activity."),
      perm("EXPENSE_MANAGE", "Expenses", "Track and approve operational expenses."),
    ],
  },
  {
    key: "communication",
    title: "Communication",
    description: "Notices, announcements, and messaging.",
    options: [
      perm("NOTICE_MANAGE", "Notices", "Create and publish notices for students and staff."),
      perm("ANNOUNCEMENT_MANAGE", "Announcements", "Broadcast announcements across the workspace."),
      perm("MESSAGE_MANAGE", "Messaging", "Send direct messages to students and parents."),
    ],
  },
  {
    key: "exams",
    title: "Exams & results",
    description: "Exam setup, grading, and result publication.",
    options: [
      perm("EXAM_MANAGE", "Exams", "Create and schedule exams for batches."),
      perm("RESULT_MANAGE", "Results", "Enter and publish exam results and grades."),
      perm("REPORT_CARD_MANAGE", "Report cards", "Generate and distribute student report cards."),
    ],
  },
];

export const permissionLookup = new Map(
  permissionGroups.flatMap((group) =>
    group.options.flatMap((option) => [
      [option.value, option] as const,
      [option.readKey, option] as const,
      [option.writeKey, option] as const,
    ]),
  ),
);

export const formatPermissionLabel = (permission: string): string => {
  const isRead = permission.endsWith("_READ");
  const isWrite = permission.endsWith("_WRITE");
  const opt = permissionLookup.get(permission);
  if (opt) {
    const suffix = isRead ? " · Read" : isWrite ? " · Write" : "";
    return `${opt.label}${suffix}`;
  }
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

const permsFor = (groupKey: string) =>
  permissionGroups.find((g) => g.key === groupKey)?.options ?? [];

export const roleTemplates: RoleTemplate[] = [
  {
    id: "admin",
    label: "Admin",
    permissions: permissionGroups.flatMap((g) =>
      g.options.flatMap((o) => [o.readKey, o.writeKey]),
    ),
  },
  {
    id: "hr",
    label: "HR",
    permissions: [
      ...permsFor("hr-staff").flatMap((o) => [o.readKey, o.writeKey]),
      ...permsFor("students").map((o) => o.readKey),
      ...permsFor("academics").map((o) => o.readKey),
      ...permsFor("finance").map((o) => o.readKey),
    ],
  },
  {
    id: "accountant",
    label: "Accountant",
    permissions: [
      ...permsFor("finance").flatMap((o) => [o.readKey, o.writeKey]),
      ...permsFor("students").map((o) => o.readKey),
      ...permsFor("academics").map((o) => o.readKey),
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    permissions: [
      ...permsFor("academics").flatMap((o) => [o.readKey, o.writeKey]),
      ...permsFor("students").flatMap((o) => [o.readKey, o.writeKey]),
      ...permsFor("exams").flatMap((o) => [o.readKey, o.writeKey]),
      ...permsFor("communication").map((o) => o.readKey),
    ],
  },
  {
    id: "student",
    label: "Student",
    permissions: [
      ...permsFor("academics").map((o) => o.readKey),
      ...permsFor("exams").map((o) => o.readKey),
    ],
  },
];
