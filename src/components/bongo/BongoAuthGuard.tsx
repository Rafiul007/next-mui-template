"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated/index";

export function BongoAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "network-only",
  });

  // Only redirect to login when there is genuinely no authenticated user.
  // errorPolicy: "all" sets `error` for non-fatal partial errors that still
  // return a valid `me`, so keying off `error` alone bounces signed-in users.
  const isAuthFailure = !!error && !data?.me;

  useEffect(() => {
    if (isAuthFailure) {
      router.replace("/login");
    } else if (data?.me && data.me.userType !== "BONGO") {
      router.replace("/dashboard");
    }
  }, [isAuthFailure, data, router]);

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

  if (isAuthFailure || (data?.me && data.me.userType !== "BONGO")) {
    return null;
  }

  return <>{children}</>;
}
