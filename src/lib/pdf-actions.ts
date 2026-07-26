// Shared View/Download helpers for the real, backend-generated PDFs (invoice,
// receipt, payslip, result slip) — as opposed to the separate client-side
// print-to-HTML helpers (billing-print.ts, payslip-print.ts) that pre-date
// these and re-render their own printable view instead of fetching the
// stored PDF.

export function viewPdf(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function downloadPdf(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
