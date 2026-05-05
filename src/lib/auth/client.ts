"use client";

// Browser-facing auth routes return only a success flag or a safe error message.
type AuthSuccessResponse = {
  success: true;
};

type AuthErrorResponse = {
  error?: string;
};

export type AuthErrorCode =
  | "invalid_credentials"
  | "invalid_request"
  | "service_unavailable"
  | "network_error"
  | "unknown";

export class AuthClientError extends Error {
  code: AuthErrorCode;

  status?: number;

  constructor(message: string, code: AuthErrorCode, status?: number) {
    super(message);
    this.name = "AuthClientError";
    this.code = code;
    this.status = status;
  }
}

const defaultAuthErrorMessage = "Unable to complete the authentication request.";

const parseJsonResponse = async (response: Response) => {
  // Auth endpoints should return JSON, but guard against unexpected upstream or
  // proxy failures so callers still get a predictable error path.
  try {
    return (await response.json()) as AuthSuccessResponse | AuthErrorResponse;
  } catch {
    return null;
  }
};

const isAuthSuccessResponse = (
  payload: AuthSuccessResponse | AuthErrorResponse | null,
): payload is AuthSuccessResponse =>
  payload !== null && "success" in payload && payload.success === true;

const getAuthErrorCode = (status: number): AuthErrorCode => {
  if (status === 400) {
    return "invalid_request";
  }

  if (status === 401) {
    return "invalid_credentials";
  }

  if (status >= 500) {
    return "service_unavailable";
  }

  return "unknown";
};

const throwAuthError = (
  payload: AuthErrorResponse | null,
  fallback: string,
  status?: number,
) => {
  throw new AuthClientError(
    payload?.error ?? fallback,
    typeof status === "number" ? getAuthErrorCode(status) : "unknown",
    status,
  );
};

export const loginWithPassword = async (email: string, password: string) => {
  // Login goes through the dedicated auth route instead of Apollo so tokens can
  // be converted into httpOnly cookies server-side and never reach the browser.
  let response: Response;

  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthClientError(
      "Please check your internet connection and try again.",
      "network_error",
    );
  }

  const payload = await parseJsonResponse(response);

  if (!response.ok || !isAuthSuccessResponse(payload)) {
    throwAuthError(
      isAuthSuccessResponse(payload) ? null : payload,
      "Unable to sign in with those credentials.",
      response.status,
    );
  }

  return payload;
};

export const logoutSession = async () => {
  // Logout is also handled by a dedicated route so the server can clear both
  // auth cookies in one place.
  let response: Response;

  try {
    response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "same-origin",
    });
  } catch {
    throw new AuthClientError(
      "Please check your internet connection and try again.",
      "network_error",
    );
  }

  const payload = await parseJsonResponse(response);

  if (!response.ok || !isAuthSuccessResponse(payload)) {
    throwAuthError(
      isAuthSuccessResponse(payload) ? null : payload,
      defaultAuthErrorMessage,
      response.status,
    );
  }

  return payload;
};
