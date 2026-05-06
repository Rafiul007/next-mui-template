export const toOptionalString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const toOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : undefined;
};

export const formatDate = (value?: string | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);

export const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const statusChipColor = (
  status?: string | null,
): "success" | "warning" | "error" | "default" => {
  const s = status?.toLowerCase() ?? "";
  if (s.includes("active")) return "success";
  if (s.includes("suspend")) return "warning";
  if (s.includes("terminate")) return "error";
  return "default";
};
