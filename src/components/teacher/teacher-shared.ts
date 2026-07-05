"use client";

import { useEffect, useMemo, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  GetBatchesByBranchDocument,
  GetMyRoutineDocument,
  type GetBatchesByBranchQuery,
} from "@/graphql/generated";
import { GetMyEmployeeProfileDocument } from "@/graphql/hr-extended";

export type TeacherBatch =
  GetBatchesByBranchQuery["getBatchesByBranch"][number];

// Resolves the signed-in teacher's employee record and the batches they teach.
// A teacher counts as teaching a batch when they are its head/co-teacher OR when
// they are assigned to any of its recurring schedule slots (RecurringSchedule.
// teacherId). Batch teacher fields may store either the employee id or the user
// id, so both are matched.
//
// Batches are sourced from the teacher's own branch (getBatchesByBranch), not the
// admin-only getAllBatches which returns nothing for a TEACHER-role account. This
// is a stopgap until the backend exposes a teacher-scoped `getMyBatches`.
export function useMyBatches() {
  const client = useApolloClient();
  const { data: profileData, loading: profileLoading } = useQuery(
    GetMyEmployeeProfileDocument,
    { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );

  const profile = profileData?.getMyEmployeeProfile;
  const employeeId = profile?.id ?? null;
  const userId = profile?.userId ?? null;
  const branchId = profile?.branchId ?? null;

  const { data: batchesData, loading: batchesLoading } = useQuery(
    GetBatchesByBranchDocument,
    {
      variables: { branchId: branchId ?? "" },
      skip: !branchId,
      fetchPolicy: "cache-and-network",
    },
  );

  const allBatches = useMemo(
    () => batchesData?.getBatchesByBranch ?? [],
    [batchesData],
  );

  // Batches where the teacher owns a recurring schedule slot. `myRoutine` is
  // teacher-scoped server-side, so a non-empty result means they teach there.
  const [taughtBatchIds, setTaughtBatchIds] = useState<Set<string>>(new Set());

  const idKey = [employeeId, userId].filter(Boolean).join("|");

  useEffect(() => {
    if (allBatches.length === 0) return;
    let cancelled = false;
    // No synchronous setState here — the only update runs after the await below.
    void (async () => {
      const matches = new Set<string>();
      await Promise.all(
        allBatches.map(async (b) => {
          try {
            const res = await client.query({
              query: GetMyRoutineDocument,
              variables: { batchId: b.id },
              fetchPolicy: "cache-first",
            });
            if ((res.data?.myRoutine ?? []).length > 0) matches.add(b.id);
          } catch {
            // Ignore per-batch failures; the batch simply won't be listed.
          }
        }),
      );
      if (!cancelled) setTaughtBatchIds(matches);
    })();
    return () => {
      cancelled = true;
    };
    // idKey re-runs the probe when the signed-in teacher changes.
  }, [client, allBatches, idKey]);

  const myBatches = useMemo(() => {
    const ids = new Set([employeeId, userId].filter(Boolean) as string[]);
    return allBatches.filter(
      (b) =>
        (b.headTeacherId && ids.has(b.headTeacherId)) ||
        (b.coTeacherIds ?? []).some((id) => ids.has(id)) ||
        taughtBatchIds.has(b.id),
    );
  }, [allBatches, employeeId, userId, taughtBatchIds]);

  return {
    profile,
    employeeId,
    myBatches,
    loading: profileLoading || batchesLoading,
  };
}

// ── Day-of-week normalisation ────────────────────────────────────────────────

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Order used to display a weekly grid (Saturday-first is common in BD coaching).
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

// Accepts numbers (0-6), numeric strings, or day names ("SATURDAY").
export const dayIndex = (dow: string | number | null | undefined): number => {
  if (dow === null || dow === undefined) return -1;
  if (typeof dow === "number") return dow % 7;
  const s = String(dow).trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10) % 7;
  return DAY_LABELS.findIndex((d) => d.toLowerCase() === s.toLowerCase());
};

export const dayLabel = (dow: string | number | null | undefined): string => {
  const i = dayIndex(dow);
  return i >= 0 ? DAY_LABELS[i] : String(dow ?? "—");
};

// ── Attendance status ────────────────────────────────────────────────────────

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "#2563eb",
  ABSENT: "#ef4444",
  LATE: "#f59e0b",
};

// Backend times are usually "HH:mm" or "HH:mm:ss"; trim to a friendly form.
export const formatTime = (t?: string | null): string => {
  if (!t) return "—";
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
};
