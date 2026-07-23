import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES, clearImpersonateCookie } from "@/lib/auth/session";
import { stopImpersonationCall } from "@/lib/graphql/server-api";
import { rejectDisallowedOrigin } from "@/lib/security/origin";

export async function POST(request: Request) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  const cookieStore = await cookies();
  // Prefer the impersonation token (the impersonated tab calling Stop); fall
  // back to the admin's own token (resuming a dangling session from another tab).
  const impersonateToken = cookieStore.get(AUTH_COOKIE_NAMES.impersonateToken)?.value;
  const accessToken = impersonateToken ?? cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const stopped = await stopImpersonationCall(accessToken);

    const response = NextResponse.json({ success: stopped });
    // Clear unconditionally: whether or not a DB session was found, the browser
    // should stop sending the impersonation cookie so the proxy falls back to
    // the admin's own access token on the next request.
    clearImpersonateCookie(response);

    return response;
  } catch {
    return NextResponse.json(
      { error: "Impersonation service unavailable." },
      { status: 502 },
    );
  }
}
