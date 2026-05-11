import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES, setImpersonateCookie } from "@/lib/auth/session";
import { impersonateAsAdminUser } from "@/lib/graphql/server-api";
import { rejectDisallowedOrigin } from "@/lib/security/origin";

export async function POST(request: Request) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  let body: { tenantId?: string };

  try {
    body = (await request.json()) as { tenantId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body?.tenantId || typeof body.tenantId !== "string") {
    return NextResponse.json({ error: "Missing tenantId." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const adminToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  if (!adminToken) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const result = await impersonateAsAdminUser(body.tenantId, adminToken);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to impersonate tenant." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      tenantId: result.tenantId,
      tenantSlug: result.tenantSlug,
    });

    setImpersonateCookie(response, result.accessToken);

    return response;
  } catch {
    return NextResponse.json(
      { error: "Impersonation service unavailable." },
      { status: 502 },
    );
  }
}
