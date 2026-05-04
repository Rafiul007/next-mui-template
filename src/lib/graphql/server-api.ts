import { env } from "@/config/env";
import {
  LOGIN_MUTATION,
  REFRESH_MUTATION,
} from "@/graphql/mutations/auth/auth.mutations";
import type { AuthTokens } from "@/lib/auth/session";

const LOGIN_FIELD_PATTERN = /\blogin\s*\(/i;
const REFRESH_FIELD_PATTERN = /\brefresh\s*\(/i;
const IMPERSONATE_TENANT_FIELD_PATTERN = /\bimpersonateTenant\s*\(/i;

type GraphqlError = {
  message?: string;
  extensions?: {
    code?: string | null;
  } | null;
};

export type GraphqlPayload = {
  data?: Record<string, unknown> | null;
  errors?: GraphqlError[];
};

export type GraphqlRequestBody = {
  operationName?: string | null;
  query: string;
  variables?: Record<string, unknown>;
};

export type ExternalGraphqlResult = {
  ok: boolean;
  status: number;
  payload: GraphqlPayload | null;
};

// Attach the bearer token only when the proxy already has a valid access token.
const buildHeaders = (accessToken?: string) => ({
  "content-type": "application/json",
  accept: "application/json",
  ...(accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {}),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const parseGraphqlPayload = (rawBody: string) => {
  // Upstream auth failures or outages do not always return valid JSON. Parsing
  // defensively lets the route decide whether to refresh, retry, or fail safely.
  if (!rawBody) {
    return null;
  }

  try {
    const parsedBody = JSON.parse(rawBody) as unknown;

    return isRecord(parsedBody) ? (parsedBody as GraphqlPayload) : null;
  } catch {
    return null;
  }
};

export const executeExternalGraphql = async (
  body: GraphqlRequestBody,
  accessToken?: string,
): Promise<ExternalGraphqlResult> => {
  // All server-side calls to the external GraphQL API go through one helper so
  // headers, cache policy, and response parsing stay consistent.
  const response = await fetch(env.graphqlApiUrl, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const rawBody = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    payload: parseGraphqlPayload(rawBody),
  };
};

const isAuthTokens = (value: unknown): value is AuthTokens => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthTokens>;

  // Accept tokens only when the response matches the expected auth payload shape.
  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.expiresInSeconds === "number" &&
    typeof candidate.tokenType === "string"
  );
};

// Token extraction stays explicit so only the expected auth operations can
// write cookies.
export const extractAuthTokens = (
  payload: GraphqlPayload | null,
  operationName?: string | null,
) => {
  if (!payload?.data || !operationName) {
    return null;
  }

  if (operationName === "Login" && isAuthTokens(payload.data.login)) {
    return payload.data.login;
  }

  if (operationName === "Refresh" && isAuthTokens(payload.data.refresh)) {
    return payload.data.refresh;
  }

  return null;
};

export const isTokenIssuingOperation = (body: GraphqlRequestBody) =>
  body.operationName === "Login" ||
  body.operationName === "Refresh" ||
  body.operationName === "ImpersonateTenant" ||
  LOGIN_FIELD_PATTERN.test(body.query) ||
  REFRESH_FIELD_PATTERN.test(body.query) ||
  IMPERSONATE_TENANT_FIELD_PATTERN.test(body.query);

export const shouldAttemptTokenRefresh = (
  status: number,
  payload: GraphqlPayload | null,
) => {
  // Some backends use HTTP 401, while others return GraphQL errors inside a
  // 200 response. Treat either pattern as an auth-expired signal.
  if (status === 401) {
    return true;
  }

  return (
    payload?.errors?.some((error) => {
      if (error.extensions?.code === "UNAUTHENTICATED") {
        return true;
      }

      return /token|auth|unauthorized/i.test(error.message ?? "");
    }) ?? false
  );
};

export const loginWithCredentials = async (email: string, password: string) => {
  // Login runs only through the dedicated auth route, which converts a token
  // response into secure cookies before anything reaches the browser.
  const result = await executeExternalGraphql({
    operationName: "Login",
    query: LOGIN_MUTATION,
    variables: { email, password },
  });

  return {
    ...result,
    tokens: extractAuthTokens(result.payload, "Login"),
  };
};

// Refresh requests intentionally run server-side so the browser never receives
// the token pair in JSON.
export const refreshAccessToken = async (refreshToken: string) => {
  const result = await executeExternalGraphql(
    {
      operationName: "Refresh",
      query: REFRESH_MUTATION,
      variables: { refreshToken },
    },
    undefined,
  );

  return extractAuthTokens(result.payload, "Refresh");
};
