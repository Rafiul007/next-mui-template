"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  GetMyBatchesDocument,
  type GetMyBatchesQuery,
} from "@/graphql/generated";
import { GetMyEmployeeProfileDocument } from "@/graphql/hr-extended";

export type TeacherBatch = GetMyBatchesQuery["getMyBatches"][number];

// Resolves the signed-in teacher's employee record and the batches they teach.
// Batch scoping is done server-side by the teacher-scoped `getMyBatches` query,
// which returns exactly the batches the signed-in teacher is assigned to (head,
// co-teacher, or via a recurring schedule slot).
export function useMyBatches() {
  const { data: profileData, loading: profileLoading } = useQuery(
    GetMyEmployeeProfileDocument,
    { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );

  const profile = profileData?.getMyEmployeeProfile;
  const employeeId = profile?.id ?? null;

  const { data: batchesData, loading: batchesLoading } = useQuery(
    GetMyBatchesDocument,
    { fetchPolicy: "cache-and-network" },
  );

  const myBatches = useMemo(
    () => batchesData?.getMyBatches ?? [],
    [batchesData],
  );

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
