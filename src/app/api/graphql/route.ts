import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAMES,
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/auth/session";
import {
  executeExternalGraphql,
  isTokenIssuingOperation,
  refreshAccessToken,
  shouldAttemptTokenRefresh,
  type GraphqlRequestBody,
} from "@/lib/graphql/server-api";
import { rejectDisallowedOrigin } from "@/lib/security/origin";

// This route keeps all browser GraphQL traffic on the app's own origin. That
// lets the server attach httpOnly auth cookies, rotate tokens when needed, and
// keep token-bearing auth mutations out of browser-visible JSON responses.
const invalidRequestResponse = () =>
  NextResponse.json(
    {
      errors: [{ message: "Invalid GraphQL request body." }],
    },
    { status: 400 },
  );

const authOperationResponse = () =>
  NextResponse.json(
    {
      errors: [
        {
          message: "Authentication operations must use the dedicated auth routes.",
        },
      ],
    },
    { status: 400 },
  );

const invalidUpstreamResponse = () =>
  NextResponse.json(
    {
      errors: [{ message: "The GraphQL service returned an invalid response." }],
    },
    { status: 502 },
  );

const unavailableUpstreamResponse = () =>
  NextResponse.json(
    {
      errors: [{ message: "The GraphQL service is temporarily unavailable." }],
    },
    { status: 502 },
  );

const expiredSessionResponse = () => {
  const response = NextResponse.json(
    {
      errors: [{ message: "Session expired. Please sign in again." }],
    },
    { status: 401 },
  );

  clearAuthCookies(response);

  return response;
};

export async function POST(request: Request) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return NextResponse.json(
      {
        errors: [{ message: "Forbidden request origin." }],
      },
      { status: 403 },
    );
  }

  let body: GraphqlRequestBody;

  try {
    body = (await request.json()) as GraphqlRequestBody;
  } catch {
    return invalidRequestResponse();
  }

  if (!body?.query || typeof body.query !== "string") {
    return invalidRequestResponse();
  }

  if (isTokenIssuingOperation(body)) {
    return authOperationResponse();
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value;

  try {
    let result = await executeExternalGraphql(body, accessToken);

    if (shouldAttemptTokenRefresh(result.status, result.payload)) {
      if (!refreshToken) {
        return expiredSessionResponse();
      }

      const refreshedTokens = await refreshAccessToken(refreshToken);

      if (!refreshedTokens) {
        return expiredSessionResponse();
      }

      result = await executeExternalGraphql(body, refreshedTokens.accessToken);

      if (!result.payload) {
        return result.status === 401
          ? expiredSessionResponse()
          : invalidUpstreamResponse();
      }

      if (shouldAttemptTokenRefresh(result.status, result.payload)) {
        return expiredSessionResponse();
      }

      const response = NextResponse.json(result.payload, {
        status: result.status,
      });

      setAuthCookies(response, refreshedTokens);

      return response;
    }

    if (!result.payload) {
      return invalidUpstreamResponse();
    }

    return NextResponse.json(result.payload, {
      status: result.status,
    });
  } catch {
    return unavailableUpstreamResponse();
  }
}
