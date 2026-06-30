"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated";
import { resolveHomePath } from "@/lib/auth/roles";

export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
  });

  // BONGO admins and teacher-only users belong in their own dashboards.
  const home = data?.me ? resolveHomePath(data.me) : null;
  const belongsElsewhere = home !== null && home !== "/dashboard";

  useEffect(() => {
    if (error) {
      router.replace("/login");
    } else if (belongsElsewhere && home) {
      router.replace(home);
    }
  }, [error, belongsElsewhere, home, router]);

  // Only block on the very first load (no cached user yet). Background
  // revalidation keeps `loading` true while `data` is present — render through
  // it so the dashboard doesn't flash a spinner on every visit.
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

  if (error || belongsElsewhere) {
    return null;
  }

  return <>{children}</>;
}
