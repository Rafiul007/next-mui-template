import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasAuthSession } from "@/lib/auth/session";

const LoginLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies();

  // Skip the login screen for users who already have an active auth session.
  if (hasAuthSession(cookieStore)) {
    redirect("/dashboard");
  }

  return children;
};

export default LoginLayout;
