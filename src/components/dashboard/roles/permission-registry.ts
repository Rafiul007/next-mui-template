export type PermissionOption = {
  value: string;
  label: string;
  description: string;
};

export type PermissionGroup = {
  key: string;
  title: string;
  description: string;
  options: PermissionOption[];
};

export const permissionGroups: PermissionGroup[] = [
  {
    key: "tenant-setup",
    title: "Center setup",
    description: "Core workspace setup and operational controls.",
    options: [
      {
        value: "CENTER_MANAGE",
        label: "Center details",
        description: "Update center profile and contact information.",
      },
      {
        value: "BRANCH_MANAGE",
        label: "Branches",
        description: "Create, edit, and deactivate branch records.",
      },
      {
        value: "HOLIDAY_MANAGE",
        label: "Calendar & holidays",
        description: "Maintain closure days and calendar overrides.",
      },
      {
        value: "ORG_CHART_MANAGE",
        label: "Teams & structure",
        description: "Manage the internal organization hierarchy.",
      },
      {
        value: "ROLE_MANAGE",
        label: "Roles & access",
        description: "Create roles and assign them to employees.",
      },
    ],
  },
  {
    key: "academics",
    title: "Academics",
    description: "Programs, batches, and learning operations.",
    options: [
      {
        value: "PROGRAM_MANAGE",
        label: "Programs & subjects",
        description: "Manage academic catalog configuration.",
      },
      {
        value: "BATCH_MANAGE",
        label: "Batches",
        description: "Create and update batches and class groups.",
      },
      {
        value: "SCHEDULE_MANAGE",
        label: "Schedules",
        description: "Manage recurring sessions and class timing.",
      },
    ],
  },
  {
    key: "students",
    title: "Students",
    description: "Admissions, enrollment, and attendance workflows.",
    options: [
      {
        value: "STUDENT_MANAGE",
        label: "Student profiles",
        description: "Maintain student records and profile data.",
      },
      {
        value: "ENROLLMENT_MANAGE",
        label: "Enrollments",
        description: "Control student enrollment and batch placement.",
      },
      {
        value: "ATTENDANCE_MANAGE",
        label: "Attendance",
        description: "Track attendance and attendance corrections.",
      },
    ],
  },
  {
    key: "billing",
    title: "Billing",
    description: "Financial setup and collection workflows.",
    options: [
      {
        value: "BILLING_MANAGE",
        label: "Invoices & fee setup",
        description: "Manage fee structures, invoices, and billing rules.",
      },
      {
        value: "PAYMENT_MANAGE",
        label: "Payments",
        description: "Record and monitor payment collection activity.",
      },
    ],
  },
  {
    key: "staff",
    title: "People",
    description: "Employee account access inside the tenant workspace.",
    options: [
      {
        value: "USER_MANAGE",
        label: "Employee accounts",
        description: "Activate employees and assign workspace roles.",
      },
    ],
  },
];

export const permissionLookup = new Map(
  permissionGroups.flatMap((group) =>
    group.options.map((option) => [option.value, option]),
  ),
);

export const formatPermissionLabel = (permission: string) => {
  return (
    permissionLookup.get(permission)?.label ??
    permission
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};
