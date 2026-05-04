"use client";

// Browser-facing auth routes return only a success flag or a safe error message.
type AuthSuccessResponse = {
  success: true;
};

type AuthErrorResponse = {
  error?: string;
};

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

const throwAuthError = (payload: AuthErrorResponse | null, fallback: string) => {
  throw new Error(payload?.error ?? fallback);
};

export const loginWithPassword = async (email: string, password: string) => {
  // Login goes through the dedicated auth route instead of Apollo so tokens can
  // be converted into httpOnly cookies server-side and never reach the browser.
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseJsonResponse(response);

  if (!response.ok || !isAuthSuccessResponse(payload)) {
    throwAuthError(
      isAuthSuccessResponse(payload) ? null : payload,
      "Unable to sign in with those credentials.",
    );
  }

  return payload;
};

export const logoutSession = async () => {
  // Logout is also handled by a dedicated route so the server can clear both
  // auth cookies in one place.
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "same-origin",
  });

  const payload = await parseJsonResponse(response);

  if (!response.ok || !isAuthSuccessResponse(payload)) {
    throwAuthError(
      isAuthSuccessResponse(payload) ? null : payload,
      defaultAuthErrorMessage,
    );
  }

  return payload;
};
