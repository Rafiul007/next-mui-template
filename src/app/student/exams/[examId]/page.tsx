import { ExamAttemptRunner } from "@/components/student/ExamAttemptRunner";

export default async function StudentExamAttemptPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  return <ExamAttemptRunner examId={examId} />;
}
