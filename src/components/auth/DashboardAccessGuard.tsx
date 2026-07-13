"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import type { WatchQueryFetchPolicy } from "@apollo/client";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated";
import {
  dashboardCanAccess,
  resolveHomePath,
  type DashboardKey,
} from "@/lib/auth/roles";

type DashboardAccessGuardProps = {
  dashboardKey: DashboardKey;
  children: ReactNode;
  fetchPolicy?: WatchQueryFetchPolicy;
};

// One guard for every dashboard. Authorizes against the role registry and
// redirects the user wherever they actually belong, so guards never ping-pong a
// signed-in user between panels.
export function DashboardAccessGuard({
  dashboardKey,
  children,
  fetchPolicy = "cache-and-network",
}: DashboardAccessGuardProps) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, { fetchPolicy });

  const me = data?.me ?? null;
  const authorized = !!me && dashboardCanAccess(me, dashboardKey);

  // Only redirect to login when there is genuinely no authenticated user.
  // errorPolicy: "all" sets `error` for non-fatal partial errors that still
  // return a valid `me`, so keying off `error` alone bounces signed-in users.
  const isAuthFailure = !!error && !me;

  useEffect(() => {
    if (isAuthFailure) {
      router.replace("/login");
    } else if (me && !authorized) {
      router.replace(resolveHomePath(me));
    }
  }, [isAuthFailure, me, authorized, router]);

  // Block only on the first load (no cached user yet); render through background
  // revalidation so authorized users don't flash a spinner on every visit.
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

  if (isAuthFailure || (me && !authorized)) {
    return null;
  }

  return <>{children}</>;
}
