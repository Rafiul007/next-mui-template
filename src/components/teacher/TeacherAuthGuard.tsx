"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated/index";
import { resolveHomePath } from "@/lib/auth/roles";

// Only teacher-only users may stay here. BONGO admins and center admins are
// redirected to the dashboard that resolveHomePath() picks for them.
export function TeacherAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
  });

  const home = data?.me ? resolveHomePath(data.me) : null;
  const belongsElsewhere = home !== null && home !== "/teacher/dashboard";

  useEffect(() => {
    if (error) {
      router.replace("/login");
    } else if (belongsElsewhere && home) {
      router.replace(home);
    }
  }, [error, belongsElsewhere, home, router]);

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
