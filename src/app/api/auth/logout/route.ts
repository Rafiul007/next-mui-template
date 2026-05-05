import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/session";
import { rejectDisallowedOrigin } from "@/lib/security/origin";

export async function POST(request: Request) {
  const originError = rejectDisallowedOrigin(request);

  if (originError) {
    return originError;
  }

  const response = NextResponse.json({ success: true });

  clearAuthCookies(response);

  return response;
}
