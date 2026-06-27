"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated";

export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (error) {
      router.replace("/login");
    } else if (data?.me?.userType === "BONGO") {
      router.replace("/bongo/dashboard");
    } else if (data?.me?.userType === "COACHING") {
      router.replace("/student");
    }
  }, [error, data, router]);

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

  if (error || data?.me?.userType === "BONGO" || data?.me?.userType === "COACHING") {
    return null;
  }

  return <>{children}</>;
}
