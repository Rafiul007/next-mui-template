import type { NextResponse } from "next/server";
import { env } from "@/config/env";

// Keep cookie names centralized so auth routes, guards, and the GraphQL proxy
// all refer to the same session keys.
export const AUTH_COOKIE_NAMES = {
  accessToken: "bongo.access-token",
  refreshToken: "bongo.refresh-token",
  // Stored when a platform admin impersonates a tenant. Checked by the proxy
  // before the regular access token so admin cookies are untouched.
  impersonateToken: "bongo.impersonate-token",
} as const;

// Matches the token bundle returned by the backend login/refresh mutations.
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  tokenType: string;
};

type CookieReader = {
  has: (name: string) => boolean;
};

// Shared cookie policy for every auth cookie we write. `httpOnly` keeps tokens
// out of client-side JavaScript, and `secure` is enabled automatically in production.
const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// Treat either token as evidence of an existing session. The proxy can use a
// refresh token to recover when the short-lived access token has expired.
export const hasAuthSession = (cookieStore: CookieReader) =>
  cookieStore.has(AUTH_COOKIE_NAMES.accessToken) ||
  cookieStore.has(AUTH_COOKIE_NAMES.refreshToken);

export const setAuthCookies = (response: NextResponse, tokens: AuthTokens) => {
  // Access tokens should expire close to the backend-provided lifetime so the
  // server proxy knows when a refresh cycle is likely needed.
  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: Math.max(tokens.expiresInSeconds, 60),
  });

  // Refresh tokens live longer and are managed separately from access-token expiry.
  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: env.authRefreshCookieMaxAgeSeconds,
  });
};

// Store a short-lived impersonation access token in its own cookie so the
// platform admin's session cookies are left intact.
export const setImpersonateCookie = (response: NextResponse, accessToken: string) => {
  response.cookies.set(AUTH_COOKIE_NAMES.impersonateToken, accessToken, {
    ...baseCookieOptions,
    maxAge: 3600, // impersonation tokens are short-lived; re-impersonate when expired
  });
};

export const clearImpersonateCookie = (response: NextResponse) => {
  response.cookies.set(AUTH_COOKIE_NAMES.impersonateToken, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
};

export const clearAuthCookies = (response: NextResponse) => {
  // Overwrite all cookies with an immediate expiry to remove the whole session.
  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });

  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });

  response.cookies.set(AUTH_COOKIE_NAMES.impersonateToken, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
};
