"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AccessTimeRounded, ArrowBackRounded, CheckCircleRounded } from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  GetMyExamAttemptDocument,
  GetMyScheduledExamsDocument,
  StartExamAttemptDocument,
  SubmitAnswerDocument,
  SubmitAttemptDocument,
  type GetMyExamAttemptQuery,
  type StartExamAttemptMutation,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type AttemptShape =
  | NonNullable<GetMyExamAttemptQuery["getMyExamAttempt"]>
  | StartExamAttemptMutation["startExamAttempt"];

type ExamAttemptRunnerProps = {
  examId: string;
};

// `Date.now()` is impure, so it may only be read from inside a timer callback
// (an external-clock subscription), never directly in the render body or
// synchronously in the effect body itself.
const useCountdown = (deadlineAt: string | null | undefined) => {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!deadlineAt) return;
    const deadline = new Date(deadlineAt).getTime();
    const update = () => setRemainingMs(Math.max(0, deadline - Date.now()));
    const kickoff = setTimeout(update, 0);
    const interval = setInterval(update, 1000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, [deadlineAt]);

  return remainingMs;
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export function ExamAttemptRunner({ examId }: ExamAttemptRunnerProps) {
  const router = useRouter();

  const { data: examListData } = useQuery(GetMyScheduledExamsDocument);
  const examMeta = examListData?.getMyScheduledExams.find((e) => e.id === examId) ?? null;

  const { data: attemptData, loading: attemptLoading } = useQuery(GetMyExamAttemptDocument, {
    variables: { examId },
    fetchPolicy: "network-only",
  });

  const [localAttempt, setLocalAttempt] = useState<AttemptShape | null>(null);
  const attempt: AttemptShape | null = localAttempt ?? attemptData?.getMyExamAttempt ?? null;

  const [startExamAttempt, { loading: starting }] = useMutation(StartExamAttemptDocument);
  const [submitAnswer] = useMutation(SubmitAnswerDocument);
  const [submitAttempt, { loading: submitting }] = useMutation(SubmitAttemptDocument);

  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const remainingMs = useCountdown(attempt?.status === "IN_PROGRESS" ? attempt.deadlineAt : null);
  const isExpired = remainingMs !== null && remainingMs <= 0;

  const handleStart = async () => {
    setStartError(null);
    try {
      const { data } = await startExamAttempt({ variables: { examId } });
      if (data?.startExamAttempt) {
        setLocalAttempt(data.startExamAttempt);
      }
    } catch (err) {
      setStartError(getErrorMessage(err, "Unable to start the exam."));
    }
  };

  const handleAnswerChange = async (examQuestionId: string, selectedOrders: number[]) => {
    if (!attempt) return;
    setAnswers((prev) => ({ ...prev, [examQuestionId]: selectedOrders }));
    setSavingIds((prev) => new Set(prev).add(examQuestionId));
    try {
      await submitAnswer({
        variables: { input: { attemptId: attempt.id, examQuestionId, selectedOrders } },
      });
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save answer."));
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(examQuestionId);
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    try {
      const { data } = await submitAttempt({ variables: { attemptId: attempt.id } });
      if (data?.submitAttempt) {
        setLocalAttempt(data.submitAttempt);
      }
      toast.success("Exam submitted.");
      setConfirmSubmitOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to submit exam."));
      setConfirmSubmitOpen(false);
    }
  };

  const answeredCount = useMemo(() => {
    if (!attempt) return 0;
    return attempt.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;
  }, [attempt, answers]);

  if (attemptLoading && !attempt) {
    return <Typography color="text.secondary">Loading…</Typography>;
  }

  const backButton = (
    <Button
      size="small"
      startIcon={<ArrowBackRounded />}
      onClick={() => router.push("/student/exams")}
      sx={{ alignSelf: "flex-start" }}
    >
      Back to exams
    </Button>
  );

  // Not started yet.
  if (!attempt) {
    return (
      <Stack spacing={3}>
        {backButton}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h4" component="h1">
            {examMeta?.title ?? "Exam"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {examMeta?.totalMarks} marks · pass {examMeta?.passMark}
            {examMeta?.durationMinutes ? ` · ${examMeta.durationMinutes} minutes` : ""}
          </Typography>
          {examMeta?.instructions ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {examMeta.instructions}
            </Alert>
          ) : null}
          {startError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {startError}
            </Alert>
          ) : null}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleStart}
              disabled={starting}
              sx={{ backgroundColor: primaryGradient }}
            >
              Start exam
            </Button>
          </Box>
        </Paper>
      </Stack>
    );
  }

  // Already submitted or expired.
  if (attempt.status !== "IN_PROGRESS") {
    return (
      <Stack spacing={3}>
        {backButton}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleRounded color="success" />
            <Typography variant="h5">
              {attempt.status === "SUBMITTED" ? "Exam submitted" : "Exam expired"}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {attempt.status === "SUBMITTED"
              ? "Your answers have been recorded. Your result will appear once your teacher publishes it."
              : "The time window for this attempt has closed."}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => router.push("/student/results")}>
              View my results
            </Button>
          </Box>
        </Paper>
      </Stack>
    );
  }

  // In progress.
  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="h6">{examMeta?.title ?? "Exam"}</Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              size="small"
              label={`${answeredCount}/${attempt.questions.length} answered`}
              variant="outlined"
            />
            {remainingMs !== null ? (
              <Chip
                icon={<AccessTimeRounded />}
                size="small"
                color={remainingMs < 60_000 ? "error" : "default"}
                label={formatDuration(remainingMs)}
              />
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      {isExpired ? (
        <Alert severity="warning">Time is up — submit now to record your answers.</Alert>
      ) : null}

      <Stack spacing={2}>
        {[...attempt.questions]
          .map((q, index) => ({ q, index }))
          .map(({ q, index }) => (
            <Paper key={q.id} elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
                  {index + 1}. {q.questionTextSnapshot}
                </Typography>
                <Chip size="small" variant="outlined" label={`${q.marks} marks`} />
              </Stack>
              <Box sx={{ mt: 1.5 }}>
                {q.typeSnapshot === "MCQ_SINGLE" ? (
                  <RadioGroup
                    value={String(answers[q.id]?.[0] ?? "")}
                    onChange={(e) => handleAnswerChange(q.id, [parseInt(e.target.value, 10)])}
                  >
                    {q.options.map((opt) => (
                      <FormControlLabel
                        key={opt.order}
                        value={String(opt.order)}
                        control={<Radio />}
                        label={opt.text}
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <Stack>
                    {q.options.map((opt) => {
                      const selected = answers[q.id] ?? [];
                      const checked = selected.includes(opt.order);
                      return (
                        <FormControlLabel
                          key={opt.order}
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...selected, opt.order]
                                  : selected.filter((o) => o !== opt.order);
                                handleAnswerChange(q.id, next);
                              }}
                            />
                          }
                          label={opt.text}
                        />
                      );
                    })}
                  </Stack>
                )}
                {savingIds.has(q.id) ? (
                  <Typography variant="caption" color="text.secondary">
                    Saving…
                  </Typography>
                ) : null}
              </Box>
            </Paper>
          ))}
      </Stack>

      <Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => setConfirmSubmitOpen(true)}
          sx={{ backgroundColor: primaryGradient }}
        >
          Submit exam
        </Button>
      </Box>

      <Dialog open={confirmSubmitOpen} onClose={() => setConfirmSubmitOpen(false)}>
        <DialogTitle>Submit exam?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            You have answered {answeredCount} of {attempt.questions.length} questions. Once
            submitted, you cannot change your answers.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setConfirmSubmitOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
