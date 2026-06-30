"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated";
import { isStudentRole, resolveHomePath } from "@/lib/auth/roles";
import { isStudent, resolveHomePath } from "@/lib/auth/roles";

export function StudentAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
  });

  const isStudent = data?.me ? isStudentRole(data.me.roles) : null;

  // Anyone who is not a student gets sent to wherever they actually belong,
  // not blindly to /dashboard, so guards never ping-pong a user between panels.
  const belongsElsewhere = !!data?.me && !isStudent(data.me);

  useEffect(() => {
    if (error) {
      router.replace("/login");
    } else if (belongsElsewhere && data?.me) {
      router.replace(resolveHomePath(data.me));
    }
  }, [error, belongsElsewhere, data, isStudent, router]);

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
