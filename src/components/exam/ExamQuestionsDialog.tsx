"use client";

import { useState } from "react";
import { AddRounded, DeleteRounded } from "@mui/icons-material";
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
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  AddInlineQuestionDocument,
  AddQuestionsFromBankDocument,
  GetQuestionsByTenantDocument,
  GetSubjectsDocument,
  QuestionType,
  RemoveExamQuestionDocument,
  ScoringMode,
  SetQuestionMarksDocument,
  type GetExamsByBatchQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { QuestionOptionEditor, type EditableOption } from "./QuestionOptionEditor";

type ExamRecord = GetExamsByBatchQuery["getExamsByBatch"][number];

type ExamQuestionsDialogProps = {
  open: boolean;
  exam: ExamRecord | null;
  onClose: () => void;
  onChanged: () => Promise<unknown>;
};

const emptyInlineOptions: EditableOption[] = [
  { text: "", correct: false },
  { text: "", correct: false },
];

export function ExamQuestionsDialog({
  open,
  exam,
  onClose,
  onChanged,
}: ExamQuestionsDialogProps) {
  const [tab, setTab] = useState<"current" | "bank" | "inline">("current");
  const { data: bankData } = useQuery(GetQuestionsByTenantDocument, { skip: !open });
  const { data: subjectsData } = useQuery(GetSubjectsDocument, { skip: !open });
  const subjects = subjectsData?.getSubjects ?? [];
  const subjectName = new Map(subjects.map((s) => [s.id, s.name]));

  const [bankSubjectFilter, setBankSubjectFilter] = useState("");
  const [bankTopicFilter, setBankTopicFilter] = useState("");

  const bankQuestions = (bankData?.getQuestionsByTenant ?? [])
    .filter((q) => q.active)
    .filter((q) => !bankSubjectFilter || q.subjectId === bankSubjectFilter)
    .filter(
      (q) =>
        !bankTopicFilter.trim() ||
        (q.topic ?? "").toLowerCase().includes(bankTopicFilter.trim().toLowerCase()),
    );

  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [addQuestionsFromBank, { loading: addingFromBank }] = useMutation(
    AddQuestionsFromBankDocument,
  );

  const [inlineText, setInlineText] = useState("");
  const [inlineType, setInlineType] = useState<QuestionType>(QuestionType.McqSingle);
  const [inlineScoringMode, setInlineScoringMode] = useState<ScoringMode>(
    ScoringMode.AllOrNothing,
  );
  const [inlineMarks, setInlineMarks] = useState("5");
  const [inlineOptions, setInlineOptions] = useState<EditableOption[]>(emptyInlineOptions);
  const [addInlineQuestion, { loading: addingInline }] = useMutation(AddInlineQuestionDocument);

  const [removeExamQuestion] = useMutation(RemoveExamQuestionDocument);
  const [setQuestionMarks] = useMutation(SetQuestionMarksDocument);

  const [error, setError] = useState<string | null>(null);

  const resetInline = () => {
    setInlineText("");
    setInlineType(QuestionType.McqSingle);
    setInlineScoringMode(ScoringMode.AllOrNothing);
    setInlineMarks("5");
    setInlineOptions(emptyInlineOptions);
  };

  const handleClose = () => {
    setTab("current");
    setSelectedBankIds([]);
    setBankSubjectFilter("");
    setBankTopicFilter("");
    resetInline();
    setError(null);
    onClose();
  };

  const handleAddFromBank = async () => {
    if (!exam || selectedBankIds.length === 0) return;
    setError(null);
    try {
      await addQuestionsFromBank({
        variables: {
          input: {
            examId: exam.id,
            selections: selectedBankIds.map((questionId) => ({ questionId })),
          },
        },
      });
      toast.success(`${selectedBankIds.length} question(s) added.`);
      setSelectedBankIds([]);
      await onChanged();
      setTab("current");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to add questions from bank."));
    }
  };

  const handleAddInline = async () => {
    if (!exam) return;
    setError(null);
    const validOptions = inlineOptions.filter((o) => o.text.trim());
    if (!inlineText.trim()) {
      setError("Question text is required.");
      return;
    }
    if (validOptions.length < 2) {
      setError("At least two options are required.");
      return;
    }
    if (!validOptions.some((o) => o.correct)) {
      setError("Mark at least one option as correct.");
      return;
    }
    const marks = parseInt(inlineMarks, 10);
    if (!marks || marks < 1) {
      setError("Marks must be at least 1.");
      return;
    }
    try {
      await addInlineQuestion({
        variables: {
          input: {
            examId: exam.id,
            marks,
            text: inlineText.trim(),
            type: inlineType,
            scoringMode: inlineScoringMode,
            options: validOptions.map((o, index) => ({
              text: o.text.trim(),
              correct: o.correct,
              order: index,
            })),
          },
        },
      });
      toast.success("Question added.");
      resetInline();
      await onChanged();
      setTab("current");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to add question."));
    }
  };

  const handleRemove = async (examQuestionId: string) => {
    if (!exam) return;
    try {
      await removeExamQuestion({ variables: { examId: exam.id, examQuestionId } });
      toast.success("Question removed.");
      await onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to remove question."));
    }
  };

  const handleMarksChange = async (examQuestionId: string, marks: number) => {
    if (!exam || !marks || marks < 1) return;
    try {
      await setQuestionMarks({ variables: { examId: exam.id, examQuestionId, marks } });
      await onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to update marks."));
    }
  };

  const totalMarks = (exam?.examQuestions ?? []).reduce((sum, q) => sum + q.marks, 0);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        Questions — {exam?.title ?? ""}
        <Typography variant="body2" color="text.secondary" component="div">
          {exam?.examQuestions.length ?? 0} question(s) · {totalMarks} total marks
        </Typography>
      </DialogTitle>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Tab value="current" label="Current questions" />
        <Tab value="bank" label="Add from bank" />
        <Tab value="inline" label="Add new (inline)" />
      </Tabs>
      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {tab === "current" ? (
          (exam?.examQuestions.length ?? 0) === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No questions yet. Add questions from the bank or create one inline.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {[...(exam?.examQuestions ?? [])]
                .sort((a, b) => a.order - b.order)
                .map((q) => (
                  <Box
                    key={q.id}
                    sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {q.order + 1}. {q.questionTextSnapshot}
                        </Typography>
                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={q.typeSnapshot === "MCQ_MULTI" ? "Multi-select" : "Single-select"}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              q.scoringModeSnapshot === "PARTIAL_CREDIT"
                                ? "Partial credit"
                                : "All or nothing"
                            }
                          />
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          type="number"
                          label="Marks"
                          defaultValue={q.marks}
                          onBlur={(e) =>
                            handleMarksChange(q.id, parseInt(e.target.value, 10))
                          }
                          sx={{ width: 90 }}
                          slotProps={{ htmlInput: { min: 1 } }}
                        />
                        <IconButton size="small" color="error" onClick={() => handleRemove(q.id)}>
                          <DeleteRounded fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
            </Stack>
          )
        ) : null}

        {tab === "bank" ? (
          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Subject</InputLabel>
                <Select
                  label="Subject"
                  value={bankSubjectFilter}
                  displayEmpty
                  onChange={(e) => setBankSubjectFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All subjects</em>
                  </MenuItem>
                  {subjects.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Search topic"
                size="small"
                value={bankTopicFilter}
                onChange={(e) => setBankTopicFilter(e.target.value)}
                sx={{ flex: 1 }}
              />
            </Stack>

            {bankQuestions.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                {bankSubjectFilter || bankTopicFilter
                  ? "No questions match this filter."
                  : "No active questions in the bank yet."}
              </Typography>
            ) : (
              bankQuestions.map((q) => (
                <Stack
                  key={q.id}
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
                >
                  <Checkbox
                    checked={selectedBankIds.includes(q.id)}
                    onChange={(e) =>
                      setSelectedBankIds((prev) =>
                        e.target.checked ? [...prev, q.id] : prev.filter((id) => id !== q.id),
                      )
                    }
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{q.text}</Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                      <Typography variant="caption" color="text.secondary">
                        {q.defaultMarks} marks ·{" "}
                        {q.type === "MCQ_MULTI" ? "Multi-select" : "Single-select"}
                      </Typography>
                      {q.subjectId ? (
                        <Chip size="small" variant="outlined" label={subjectName.get(q.subjectId) ?? "—"} />
                      ) : null}
                      {q.topic ? <Chip size="small" variant="outlined" label={q.topic} /> : null}
                    </Stack>
                  </Box>
                </Stack>
              ))
            )}
          </Stack>
        ) : null}

        {tab === "inline" ? (
          <Stack spacing={2.5}>
            <TextField
              label="Question text"
              value={inlineText}
              onChange={(e) => setInlineText(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr 1fr" }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={inlineType}
                  onChange={(e) => setInlineType(e.target.value as QuestionType)}
                >
                  <MenuItem value="MCQ_SINGLE">Single-select</MenuItem>
                  <MenuItem value="MCQ_MULTI">Multi-select</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Scoring mode</InputLabel>
                <Select
                  label="Scoring mode"
                  value={inlineScoringMode}
                  onChange={(e) => setInlineScoringMode(e.target.value as ScoringMode)}
                >
                  <MenuItem value="ALL_OR_NOTHING">All or nothing</MenuItem>
                  <MenuItem value="PARTIAL_CREDIT">Partial credit</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Marks"
                type="number"
                size="small"
                value={inlineMarks}
                onChange={(e) => setInlineMarks(e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Box>
            <QuestionOptionEditor
              options={inlineOptions}
              onChange={setInlineOptions}
              singleCorrect={inlineType === "MCQ_SINGLE"}
            />
          </Stack>
        ) : null}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={handleClose}>
          Close
        </Button>
        {tab === "bank" ? (
          <Button
            variant="contained"
            disabled={selectedBankIds.length === 0 || addingFromBank}
            onClick={handleAddFromBank}
            startIcon={<AddRounded />}
          >
            Add {selectedBankIds.length || ""} question(s)
          </Button>
        ) : null}
        {tab === "inline" ? (
          <Button
            variant="contained"
            disabled={addingInline}
            onClick={handleAddInline}
            startIcon={<AddRounded />}
          >
            Add question
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
