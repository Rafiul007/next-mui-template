const parseTimeout = (value: string | undefined, fallback: number) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  apiTimeout: parseTimeout(process.env.NEXT_PUBLIC_API_TIMEOUT, 10000),
} as const;

export default env;
