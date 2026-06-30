"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated";
import { isStudentRole, resolveHomePath } from "@/lib/auth/roles";

export function StudentAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "network-only",
  });

  const isStudent = data?.me ? isStudentRole(data.me.roles) : null;

  useEffect(() => {
    if (error) {
      router.replace("/login");
    } else if (data?.me && !isStudent) {
      router.replace(resolveHomePath(data.me));
    }
  }, [error, data, isStudent, router]);

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

  if (error || (data?.me && !isStudent)) {
    return null;
  }

  return <>{children}</>;
}
