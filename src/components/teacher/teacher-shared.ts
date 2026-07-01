"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  GetAllBatchesDocument,
  type GetAllBatchesQuery,
} from "@/graphql/generated";
import { GetMyEmployeeProfileDocument } from "@/graphql/hr-extended";

export type TeacherBatch = GetAllBatchesQuery["getAllBatches"][number];

// Resolves the signed-in teacher's employee record and the batches they teach
// (as head or co-teacher). Batch teacher fields may store either the employee id
// or the user id, so both are matched.
export function useMyBatches() {
  const { data: profileData, loading: profileLoading } = useQuery(
    GetMyEmployeeProfileDocument,
    { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );
  const { data: batchesData, loading: batchesLoading } = useQuery(
    GetAllBatchesDocument,
    { fetchPolicy: "cache-and-network" },
  );

  const profile = profileData?.getMyEmployeeProfile;
  const employeeId = profile?.id ?? null;
  const userId = profile?.userId ?? null;

  const myBatches = useMemo(() => {
    const all = batchesData?.getAllBatches ?? [];
    const ids = new Set([employeeId, userId].filter(Boolean) as string[]);
    if (ids.size === 0) return [];
    return all.filter(
      (b) =>
        (b.headTeacherId && ids.has(b.headTeacherId)) ||
        (b.coTeacherIds ?? []).some((id) => ids.has(id)),
    );
  }, [batchesData, employeeId, userId]);

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
