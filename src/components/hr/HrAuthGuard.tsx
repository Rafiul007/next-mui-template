"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated/index";
import { isAdminRole, isCenterAdmin, isHrRole, resolveHomePath } from "@/lib/auth/roles";

// HR staff own this portal. Center admins are also allowed in (they oversee HR).
// Everyone else (students, teachers, bongo admins) is sent to the dashboard
// resolveHomePath() picks for them.
export function HrAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
  });

  const me = data?.me ?? null;
  const allowed =
    !!me &&
    (isHrRole(me.roles) || isCenterAdmin(me.roles) || isAdminRole(me.roles));

  // Only redirect to login when there is genuinely no authenticated user.
  const isAuthFailure = !!error && !me;

  useEffect(() => {
    if (isAuthFailure) {
      router.replace("/login");
    } else if (me && !allowed) {
      router.replace(resolveHomePath(me));
    }
  }, [isAuthFailure, me, allowed, router]);

  if (loading && !data) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthFailure || (me && !allowed)) {
    return null;
  }

  return <>{children}</>;
}
