import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/session";
import { loginWithCredentials } from "@/lib/graphql/server-api";
import { rejectDisallowedOrigin } from "@/lib/security/origin";

type LoginRequestBody = {
  email: string;
  password: string;
};

const invalidRequestResponse = () =>
  NextResponse.json(
    {
      error: "Invalid login request.",
    },
    { status: 400 },
  );

const invalidCredentialsResponse = () =>
  NextResponse.json(
    {
      error: "Unable to sign in with those credentials.",
    },
    { status: 401 },
  );

const authenticationServiceErrorResponse = () =>
  NextResponse.json(
    {
      error: "Authentication service is temporarily unavailable.",
    },
    { status: 502 },
  );

const isLoginRequestBody = (value: unknown): value is LoginRequestBody => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LoginRequestBody>;

  return (
    typeof candidate.email === "string" &&
    candidate.email.trim().length > 0 &&
    typeof candidate.password === "string" &&
    candidate.password.length > 0
  );
};

export async function POST(request: Request) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  let requestBody: unknown;

  try {
    requestBody = (await request.json()) as unknown;
  } catch {
    return invalidRequestResponse();
  }

  if (!isLoginRequestBody(requestBody)) {
    return invalidRequestResponse();
  }

  try {
    const result = await loginWithCredentials(
      requestBody.email.trim(),
      requestBody.password,
    );

    if (result.tokens) {
      const response = NextResponse.json({ success: true });

      setAuthCookies(response, result.tokens);

      return response;
    }

    if (!result.payload || result.status >= 500) {
      return authenticationServiceErrorResponse();
    }

    return invalidCredentialsResponse();
  } catch {
    return authenticationServiceErrorResponse();
  }
}
