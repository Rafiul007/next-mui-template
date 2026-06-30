"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated";
import { isStudent, resolveHomePath } from "@/lib/auth/roles";

export function StudentAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
  });

  // Anyone who is not a student gets sent to wherever they actually belong,
  // not blindly to /dashboard, so guards never ping-pong a user between panels.
  const belongsElsewhere = !!data?.me && !isStudent(data.me);

  // Only redirect to login when there is genuinely no authenticated user.
  // errorPolicy: "all" sets `error` for non-fatal partial errors that still
  // return a valid `me`, so keying off `error` alone bounces signed-in users.
  const isAuthFailure = !!error && !data?.me;

  useEffect(() => {
    if (isAuthFailure) {
      router.replace("/login");
    } else if (belongsElsewhere && data?.me) {
      router.replace(resolveHomePath(data.me));
    }
  }, [isAuthFailure, belongsElsewhere, data, router]);

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

  if (isAuthFailure || belongsElsewhere) {
    return null;
  }

  return <>{children}</>;
}
