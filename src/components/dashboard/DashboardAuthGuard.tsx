"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated/index";

export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error } = useQuery(MeDocument, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (error) {
      router.replace("/login");
    }
  }, [error, router]);

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

  if (error) {
    return null;
  }

  return <>{children}</>;
}
