"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Box, CircularProgress } from "@mui/material";
import { MeDocument } from "@/graphql/generated";
import { isCenterAdmin } from "@/lib/auth/roles";

// Wraps the tenant "Profile Setup" section. Only a CENTER_ADMIN may see it, so
// anyone else is bounced back to the main dashboard. Returning null for a
// non-admin means the wrapped workspaces never mount, so their queries never
// fire — the section's APIs stay uncalled for people who cannot use them.
export function CenterAdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
  });

  const me = data?.me ?? null;
  const authorized = !!me && isCenterAdmin(me.roles);
  const denied = (!!error && !me) || (!!me && !authorized);

  useEffect(() => {
    if (denied) {
      router.replace("/dashboard");
    }
  }, [denied, router]);

  // Block only on the first load (no cached user yet); render through background
  // revalidation so authorized admins don't flash a spinner on every visit.
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

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
