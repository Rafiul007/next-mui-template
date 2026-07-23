"use client";

import { ExamWorkspace } from "@/components/exam/ExamWorkspace";
import { useMyBatches } from "./teacher-shared";

export function TeacherExamsWorkspace() {
  const { myBatches, loading } = useMyBatches();
  return <ExamWorkspace batches={myBatches} batchesLoading={loading} />;
}
