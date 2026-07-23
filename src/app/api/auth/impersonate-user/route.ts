import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES, setImpersonateCookie } from "@/lib/auth/session";
import { startImpersonationAsAdmin } from "@/lib/graphql/server-api";
import { rejectDisallowedOrigin } from "@/lib/security/origin";

export async function POST(request: Request) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  let body: { userId?: string };

  try {
    body = (await request.json()) as { userId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body?.userId || typeof body.userId !== "string") {
    return NextResponse.json({ error: "Missing userId." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const adminToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (!adminToken) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const result = await startImpersonationAsAdmin(body.userId, adminToken);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to impersonate user." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      targetUserId: result.targetUserId,
      targetUserName: result.targetUserName,
    });

    setImpersonateCookie(response, result.token);

    return response;
  } catch {
    return NextResponse.json(
      { error: "Impersonation service unavailable." },
      { status: 502 },
    );
  }
}
