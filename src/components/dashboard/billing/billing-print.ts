// Opens a print-ready receipt/invoice in a new window. Used by the Invoices and
// Transactions screens so every printed document looks identical.

import dayjs from "dayjs";

type LineItem = { description: string; amount: number };

export type PrintableInvoice = {
  month: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  fineAmount: number;
  total: number;
  paidAmount: number;
  lineItems: LineItem[];
};

export type PrintPayment = {
  amount: number;
  method: string;
  transactionRef?: string | null;
  receiptNumber?: string | null;
  collectedAt?: string | null;
};

const fmt = (n: number) =>
  `৳${(n ?? 0).toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;

export function printInvoiceReceipt(params: {
  invoice: PrintableInvoice;
  studentName: string;
  studentCode: string;
  batchName: string;
  centerName: string;
  payment?: PrintPayment | null;
  documentTitle?: string;
}) {
  const {
    invoice,
    studentName,
    studentCode,
    batchName,
    centerName,
    payment,
    documentTitle,
  } = params;

  const win = window.open("", "_blank", "width=820,height=960");
  if (!win) return;

  const monthText = dayjs(invoice.month, "YYYY-MM").format("MMMM YYYY");
  const printedOn = dayjs().format("DD MMM YYYY, h:mm A");
  const heading = documentTitle ?? (payment ? "Payment Receipt" : "Fee Invoice");

  const remaining = Math.max(0, invoice.total - invoice.paidAmount);
  const isSettled = remaining <= 0 || invoice.status === "WAIVED";
  const statusText =
    invoice.status === "WAIVED"
      ? "Waived"
      : isSettled
        ? "Paid"
        : invoice.paidAmount > 0
          ? "Partially Paid"
          : "Unpaid";

  const badge = isSettled
    ? invoice.status === "WAIVED"
      ? { bg: "#e0f2fe", fg: "#0369a1", border: "#bae6fd" }
      : { bg: "#dbeafe", fg: "#1d4ed8", border: "#bfdbfe" }
    : { bg: "#fef9c3", fg: "#a16207", border: "#fde68a" };

  const lineItemsHtml = invoice.lineItems.length
    ? `<table>
        <thead><tr><th>Description</th><th class="right">Amount</th></tr></thead>
        <tbody>
          ${invoice.lineItems
            .map(
              (li) =>
                `<tr><td>${li.description}</td><td class="right">${fmt(li.amount)}</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>`
    : "";

  const paymentBlock = payment
    ? `<div class="meta-box">
         <div class="meta-label">Payment Method</div>
         <div class="meta-value">${payment.method}</div>
         ${payment.transactionRef ? `<div class="meta-sub">Ref: ${payment.transactionRef}</div>` : ""}
       </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${heading} – ${studentName} – ${monthText}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;padding:48px;max-width:640px;margin:0 auto}
    .header{text-align:center;padding-bottom:20px;border-bottom:2px solid #e2e8f0;margin-bottom:28px}
    .center-name{font-size:22px;font-weight:700;color:#0f172a}
    .receipt-label{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#94a3b8;margin-top:5px}
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px}
    .meta-box{padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
    .meta-label{font-size:10px;text-transform:uppercase;letter-spacing:0.6px;color:#94a3b8;margin-bottom:3px}
    .meta-value{font-size:14px;font-weight:600;color:#0f172a}
    .meta-sub{font-size:12px;color:#64748b;margin-top:2px}
    table{width:100%;border-collapse:collapse;margin-bottom:24px}
    th{font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;padding:8px 12px;background:#f1f5f9;text-align:left;border-bottom:1px solid #e2e8f0}
    th.right{text-align:right}
    td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155}
    td.right{text-align:right;font-weight:600}
    .totals{margin-left:auto;width:280px;margin-bottom:24px}
    .tr{display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:14px;color:#475569}
    .tr.grand{font-weight:700;font-size:16px;color:#0f172a;border-top:2px solid #e2e8f0;padding-top:12px;margin-top:6px}
    .tr.paid-row{color:#1d4ed8;font-weight:600}
    .tr.due-row{color:#b91c1c;font-weight:700}
    .tr.disc{color:#2563eb}
    .tr.fine{color:#ef4444}
    .badge{display:inline-block;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;background:${badge.bg};color:${badge.fg};border:1px solid ${badge.border}}
    .footer{margin-top:36px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6}
    @media print{body{padding:24px}@page{margin:16mm}}
  </style>
</head>
<body>
  <div class="header">
    <div class="center-name">${centerName}</div>
    <div class="receipt-label">${heading}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <div class="meta-label">Student</div>
      <div class="meta-value">${studentName}</div>
      <div class="meta-sub">${studentCode}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Batch</div>
      <div class="meta-value">${batchName}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Invoice Period</div>
      <div class="meta-value">${monthText}</div>
    </div>
    ${
      paymentBlock ||
      `<div class="meta-box">
        <div class="meta-label">Printed On</div>
        <div class="meta-value">${printedOn}</div>
      </div>`
    }
  </div>

  ${lineItemsHtml}

  <div class="totals">
    <div class="tr"><span>Subtotal</span><span>${fmt(invoice.subtotal)}</span></div>
    ${invoice.discountAmount > 0 ? `<div class="tr disc"><span>Discount</span><span>−${fmt(invoice.discountAmount)}</span></div>` : ""}
    ${invoice.fineAmount > 0 ? `<div class="tr fine"><span>Late fine</span><span>+${fmt(invoice.fineAmount)}</span></div>` : ""}
    <div class="tr grand"><span>Total</span><span>${fmt(invoice.total)}</span></div>
    <div class="tr paid-row"><span>Amount Paid</span><span>${fmt(invoice.paidAmount)}</span></div>
    ${remaining > 0 && invoice.status !== "WAIVED" ? `<div class="tr due-row"><span>Balance Due</span><span>${fmt(remaining)}</span></div>` : ""}
  </div>

  <div class="badge">${statusText}</div>

  <div class="footer">
    This is a computer-generated document. No signature is required.<br/>
    ${centerName} · Generated ${printedOn}
  </div>

  <script>window.onload=()=>{window.print()}</script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}
