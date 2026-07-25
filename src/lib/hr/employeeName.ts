// Resolves an employee's human-readable name from the linked user account.
// Payroll surfaces (payslips, dropdowns) fall back to the employee code rather
// than a placeholder, so a slip never prints a blank or "No user linked" name.

type EmployeeLike = {
  employeeCode?: string | null;
  userInfo?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export const employeeDisplayName = (emp: EmployeeLike | null | undefined): string => {
  const first = emp?.userInfo?.firstName?.trim();
  if (first) {
    return `${first} ${emp?.userInfo?.lastName?.trim() ?? ""}`.trim();
  }
  return emp?.employeeCode?.trim() || "Unknown employee";
};
