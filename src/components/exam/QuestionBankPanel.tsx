"use client";

import { useState } from "react";
import { AddRounded, BlockRounded, EditNoteRounded } from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  CreateQuestionDocument,
  DeactivateQuestionDocument,
  Difficulty,
  GetQuestionsByTenantDocument,
  GetSubjectsDocument,
  QuestionType,
  ScoringMode,
  UpdateQuestionDocument,
  type GetQuestionsByTenantQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import { QuestionOptionEditor, type EditableOption } from "./QuestionOptionEditor";

type QuestionRecord = GetQuestionsByTenantQuery["getQuestionsByTenant"][number];

type QuestionFormState = {
  subjectId: string;
  topic: string;
  type: QuestionType;
  text: string;
  difficulty: Difficulty | "";
  defaultMarks: string;
  scoringMode: ScoringMode;
  options: EditableOption[];
};

const emptyForm: QuestionFormState = {
  subjectId: "",
  topic: "",
  type: QuestionType.McqSingle,
  text: "",
  difficulty: "",
  defaultMarks: "5",
  scoringMode: ScoringMode.AllOrNothing,
  options: [
    { text: "", correct: false },
    { text: "", correct: false },
  ],
};

type QuestionBankPanelProps = {
  canManage: boolean;
};

export function QuestionBankPanel({ canManage }: QuestionBankPanelProps) {
  const { data, loading, refetch } = useQuery(GetQuestionsByTenantDocument, {
    fetchPolicy: "cache-and-network",
  });
  const { data: subjectsData } = useQuery(GetSubjectsDocument);

  const [createQuestion, { loading: creating }] = useMutation(CreateQuestionDocument);
  const [updateQuestion, { loading: updating }] = useMutation(UpdateQuestionDocument);
  const [deactivateQuestion] = useMutation(DeactivateQuestionDocument);

  const questions = data?.getQuestionsByTenant ?? [];
  const subjects = subjectsData?.getSubjects ?? [];
  const subjectName = new Map(subjects.map((s) => [s.id, s.name]));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (q: QuestionRecord) => {
    setEditingId(q.id);
    setForm({
      subjectId: q.subjectId ?? "",
      topic: q.topic ?? "",
      type: q.type as QuestionType,
      text: q.text,
      difficulty: (q.difficulty as Difficulty) ?? "",
      defaultMarks: String(q.defaultMarks),
      scoringMode: q.scoringMode as ScoringMode,
      options: q.options.map((o) => ({ text: o.text, correct: o.correct })),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (creating || updating) return;
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!form.text.trim()) {
      setFormError("Question text is required.");
      return;
    }
    const validOptions = form.options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      setFormError("At least two options are required.");
      return;
    }
    if (!validOptions.some((o) => o.correct)) {
      setFormError("Mark at least one option as correct.");
      return;
    }
    const marks = parseInt(form.defaultMarks, 10);
    if (!marks || marks < 1) {
      setFormError("Default marks must be at least 1.");
      return;
    }

    const optionsInput = validOptions.map((o, index) => ({
      text: o.text.trim(),
      correct: o.correct,
      order: index,
    }));

    const input = {
      subjectId: form.subjectId || undefined,
      topic: form.topic.trim() || undefined,
      type: form.type,
      text: form.text.trim(),
      difficulty: form.difficulty || undefined,
      defaultMarks: marks,
      scoringMode: form.scoringMode,
      options: optionsInput,
    };

    try {
      if (editingId) {
        await updateQuestion({ variables: { question: { id: editingId, ...input } } });
        toast.success("Question updated.");
      } else {
        await createQuestion({ variables: { question: input } });
        toast.success("Question added to bank.");
      }
      await refetch();
      setDialogOpen(false);
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to save question."));
    }
  };

  const handleDeactivate = async (questionId: string) => {
    try {
      await deactivateQuestion({ variables: { questionId } });
      toast.success("Question deactivated.");
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to deactivate question."));
    }
  };

  const columns: MRT_ColumnDef<QuestionRecord>[] = [
    {
      accessorKey: "text",
      header: "Question",
      size: 320,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {row.original.text}
        </Typography>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      size: 160,
      Cell: ({ row }) => (
        <Typography variant="body2" color={!row.original.subjectId ? "text.disabled" : undefined}>
          {row.original.subjectId ? (subjectName.get(row.original.subjectId) ?? "—") : "General"}
        </Typography>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 120,
      Cell: ({ cell }) => (
        <Chip
          size="small"
          variant="outlined"
          label={cell.getValue<string>() === "MCQ_MULTI" ? "Multi-select" : "Single-select"}
        />
      ),
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      size: 110,
      Cell: ({ cell }) => cell.getValue<string | null>() ?? "—",
    },
    {
      accessorKey: "defaultMarks",
      header: "Marks",
      size: 90,
    },
    {
      accessorKey: "scoringMode",
      header: "Scoring",
      size: 150,
      Cell: ({ cell }) =>
        cell.getValue<string>() === "PARTIAL_CREDIT" ? "Partial credit" : "All or nothing",
    },
    {
      accessorKey: "active",
      header: "Status",
      size: 100,
      Cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <Chip label="Active" color="success" size="small" />
        ) : (
          <Chip label="Inactive" size="small" variant="outlined" />
        ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: "Actions",
            size: 160,
            enableSorting: false,
            Cell: ({ row }: { row: { original: QuestionRecord } }) => (
              <Stack direction="row" spacing={0.75}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditNoteRounded />}
                  onClick={() => openEdit(row.original)}
                >
                  Edit
                </Button>
                {row.original.active ? (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<BlockRounded />}
                    onClick={() => handleDeactivate(row.original.id)}
                  >
                    Deactivate
                  </Button>
                ) : null}
              </Stack>
            ),
          } satisfies MRT_ColumnDef<QuestionRecord>,
        ]
      : []),
  ];

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Reusable bank of questions for building exams. {questions.length} question
          {questions.length !== 1 ? "s" : ""}.
        </Typography>
        {canManage ? (
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreate}
            sx={{ backgroundColor: primaryGradient, alignSelf: { xs: "flex-start", sm: "auto" } }}
          >
            New question
          </Button>
        ) : null}
      </Stack>

      <MaterialReactTable
        columns={columns}
        data={questions}
        enableColumnFilters={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
        getRowId={(row) => row.id}
        localization={{ noRecordsToDisplay: "No questions in the bank yet" }}
        state={{ isLoading: loading, showProgressBars: loading }}
        muiTableContainerProps={{ sx: { maxHeight: 560 } }}
      />

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit question" : "New question"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <TextField
              label="Question text"
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Subject (optional)</InputLabel>
                <Select
                  label="Subject (optional)"
                  value={form.subjectId}
                  displayEmpty
                  onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>General</em>
                  </MenuItem>
                  {subjects.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Topic (optional)"
                size="small"
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              />
            </Box>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr 1fr" }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as QuestionType }))
                  }
                >
                  <MenuItem value="MCQ_SINGLE">Single-select</MenuItem>
                  <MenuItem value="MCQ_MULTI">Multi-select</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  label="Difficulty"
                  value={form.difficulty}
                  displayEmpty
                  onChange={(e) =>
                    setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))
                  }
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="EASY">Easy</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HARD">Hard</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Default marks"
                type="number"
                size="small"
                value={form.defaultMarks}
                onChange={(e) => setForm((f) => ({ ...f, defaultMarks: e.target.value }))}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Box>
            <FormControl size="small" fullWidth>
              <InputLabel>Scoring mode</InputLabel>
              <Select
                label="Scoring mode"
                value={form.scoringMode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scoringMode: e.target.value as ScoringMode }))
                }
              >
                <MenuItem value="ALL_OR_NOTHING">All or nothing (exact match required)</MenuItem>
                <MenuItem value="PARTIAL_CREDIT">Partial credit (per-option +/-)</MenuItem>
              </Select>
            </FormControl>
            <QuestionOptionEditor
              options={form.options}
              onChange={(options) => setForm((f) => ({ ...f, options }))}
              singleCorrect={form.type === "MCQ_SINGLE"}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={closeDialog} disabled={creating || updating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={creating || updating}>
            {editingId ? "Save changes" : "Add question"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
