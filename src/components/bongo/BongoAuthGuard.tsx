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

  useEffect(() => {
    if (error) {
      router.replace("/login");
    } else if (data && data.me?.userType !== "BONGO") {
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

  if (error || (data && data.me?.userType !== "BONGO")) {
    return null;
  }

  return <>{children}</>;
}
