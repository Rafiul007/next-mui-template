"use client";

import { AddRounded, DeleteRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export type EditableOption = {
  text: string;
  correct: boolean;
};

type QuestionOptionEditorProps = {
  options: EditableOption[];
  onChange: (options: EditableOption[]) => void;
  singleCorrect: boolean;
};

// Shared editor for question-bank options and inline exam-question options.
// `order` is always the row index — the backend assigns it from array position.
export function QuestionOptionEditor({
  options,
  onChange,
  singleCorrect,
}: QuestionOptionEditorProps) {
  const addOption = () => onChange([...options, { text: "", correct: false }]);

  const removeOption = (index: number) =>
    onChange(options.filter((_, i) => i !== index));

  const updateText = (index: number, text: string) =>
    onChange(options.map((o, i) => (i === index ? { ...o, text } : o)));

  const toggleCorrect = (index: number) =>
    onChange(
      options.map((o, i) => {
        if (singleCorrect) {
          return { ...o, correct: i === index };
        }
        return i === index ? { ...o, correct: !o.correct } : o;
      }),
    );

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">
        Options {singleCorrect ? "(select one correct answer)" : "(select all correct answers)"}
      </Typography>
      {options.map((option, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={option.correct}
                onChange={() => toggleCorrect(index)}
                sx={{ "&.Mui-checked": { color: "success.main" } }}
              />
            }
            label=""
            sx={{ m: 0 }}
          />
          <TextField
            size="small"
            fullWidth
            placeholder={`Option ${index + 1}`}
            value={option.text}
            onChange={(e) => updateText(index, e.target.value)}
          />
          <IconButton
            size="small"
            onClick={() => removeOption(index)}
            disabled={options.length <= 2}
          >
            <DeleteRounded fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Box>
        <Button size="small" startIcon={<AddRounded />} onClick={addOption}>
          Add option
        </Button>
      </Box>
    </Stack>
  );
}
