import { NextResponse } from "next/server";
import { env } from "@/config/env";

const getRequestOrigin = (request: Request) => {
  const originHeader = request.headers.get("origin");

  if (originHeader) {
    return originHeader;
  }

  const refererHeader = request.headers.get("referer");

  if (!refererHeader) {
    return null;
  }

  try {
    return new URL(refererHeader).origin;
  } catch {
    return null;
  }
};

// State-changing routes only accept requests originating from the configured app.
export const rejectDisallowedOrigin = (request: Request) => {
  const requestOrigin = getRequestOrigin(request);

  if (requestOrigin === env.appOrigin) {
    return null;
  }

  return NextResponse.json(
    {
      error: "Forbidden request origin.",
    },
    { status: 403 },
  );
};
