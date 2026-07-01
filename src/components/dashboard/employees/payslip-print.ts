// Opens a print-ready payslip in a new window. Shared by the Payroll workspace
// (admin) and the My Profile self-service page.

import dayjs from "dayjs";

type PayslipData = {
  basicSalary: number;
  allowances: number;
  deductions: number;
  taxableIncome: number;
  taxes: number;
  netAmount: number;
};

const fmt = (n: number) =>
  `৳${(n ?? 0).toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;

export function printPayslip(params: {
  payslip: PayslipData;
  employeeName: string;
  employeeCode: string;
  designation?: string | null;
  period?: string | null;
  centerName: string;
}) {
  const { payslip, employeeName, employeeCode, designation, period, centerName } =
    params;
  const win = window.open("", "_blank", "width=820,height=960");
  if (!win) return;

  const printedOn = dayjs().format("DD MMM YYYY, h:mm A");

  const earnings = [
    ["Basic salary", payslip.basicSalary],
    ["Allowances", payslip.allowances],
  ] as const;
  const deductions = [
    ["Deductions", payslip.deductions],
    ["Taxes", payslip.taxes],
  ] as const;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Payslip – ${employeeName}${period ? ` – ${period}` : ""}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;padding:48px;max-width:680px;margin:0 auto}
    .header{text-align:center;padding-bottom:20px;border-bottom:2px solid #e2e8f0;margin-bottom:28px}
    .center-name{font-size:22px;font-weight:700;color:#0f172a}
    .label{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#94a3b8;margin-top:5px}
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px}
    .meta-box{padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
    .meta-label{font-size:10px;text-transform:uppercase;letter-spacing:0.6px;color:#94a3b8;margin-bottom:3px}
    .meta-value{font-size:14px;font-weight:600;color:#0f172a}
    .cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
    .col h3{font-size:12px;text-transform:uppercase;letter-spacing:0.6px;color:#64748b;padding-bottom:8px;border-bottom:1px solid #e2e8f0;margin-bottom:8px}
    .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#334155}
    .row.sub{font-weight:700;border-top:1px solid #e2e8f0;margin-top:6px;padding-top:10px}
    .net{margin-top:8px;padding:16px 20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;display:flex;justify-content:space-between;align-items:center}
    .net .lbl{font-size:13px;text-transform:uppercase;letter-spacing:0.6px;color:#1d4ed8;font-weight:700}
    .net .amt{font-size:24px;font-weight:800;color:#1d4ed8}
    .footer{margin-top:36px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6}
    @media print{body{padding:24px}@page{margin:16mm}}
  </style>
</head>
<body>
  <div class="header">
    <div class="center-name">${centerName}</div>
    <div class="label">Salary Payslip</div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <div class="meta-label">Employee</div>
      <div class="meta-value">${employeeName}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Employee Code</div>
      <div class="meta-value">${employeeCode}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Designation</div>
      <div class="meta-value">${designation || "—"}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">${period ? "Pay Period" : "Generated"}</div>
      <div class="meta-value">${period || printedOn}</div>
    </div>
  </div>

  <div class="cols">
    <div class="col">
      <h3>Earnings</h3>
      ${earnings.map(([l, v]) => `<div class="row"><span>${l}</span><span>${fmt(v)}</span></div>`).join("")}
      <div class="row sub"><span>Gross</span><span>${fmt(payslip.basicSalary + payslip.allowances)}</span></div>
    </div>
    <div class="col">
      <h3>Deductions</h3>
      ${deductions.map(([l, v]) => `<div class="row"><span>${l}</span><span>${fmt(v)}</span></div>`).join("")}
      <div class="row sub"><span>Total deductions</span><span>${fmt(payslip.deductions + payslip.taxes)}</span></div>
    </div>
  </div>

  <div class="net">
    <span class="lbl">Net Pay</span>
    <span class="amt">${fmt(payslip.netAmount)}</span>
  </div>

  <div class="footer">
    This is a computer-generated payslip. No signature is required.<br/>
    ${centerName} · Generated ${printedOn}
  </div>

  <script>window.onload=()=>{window.print()}</script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}
