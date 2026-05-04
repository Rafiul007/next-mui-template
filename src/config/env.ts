import { toGraphqlApiUrl } from "@/lib/graphql/endpoint";

// Reuse one parser for numeric env values so invalid input falls back safely.
const parseTimeout = (value: string | undefined, fallback: number) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

const runtimeGraphqlUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  "https://bongo-coaching-be.onrender.com/graphiql";

export const env = {
  // Server-side POST routes use this origin to reject cross-site requests.
  appOrigin:
    process.env.APP_ORIGIN ??
    process.env.NEXT_PUBLIC_APP_ORIGIN ??
    "http://localhost:3000",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  apiTimeout: parseTimeout(process.env.NEXT_PUBLIC_API_TIMEOUT, 10000),
  // `NEXT_PUBLIC_GRAPHQL_URL` may point to the GraphiQL UI, but server requests
  // and codegen need the actual GraphQL endpoint.
  graphqlApiUrl:
    process.env.GRAPHQL_API_URL ?? toGraphqlApiUrl(runtimeGraphqlUrl),
  // The browser always talks to the local Next.js proxy, not the external API directly.
  graphqlProxyPath: "/api/graphql",
  // Refresh tokens live longer than access tokens, so keep this configurable.
  authRefreshCookieMaxAgeSeconds: parseTimeout(
    process.env.AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS,
    60 * 60 * 24 * 30,
  ),
} as const;

export default env;
