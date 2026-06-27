"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated";

export function StudentAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (error) {
      router.replace("/login");
    } else if (data && !data.me?.roles?.includes("USER")) {
      router.replace("/dashboard");
    }
  }, [error, data, router]);

  if (loading) {
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

  if (error || (data && !data.me?.roles?.includes("USER"))) {
    return null;
  }

  return <>{children}</>;
}
