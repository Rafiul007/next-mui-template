"use client";

import type { ReactNode, Ref } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  createFilterOptions,
  type SxProps,
  type Theme,
} from "@mui/material";

/**
 * Option for a searchable entity picker.
 *
 * `keywords` holds the unique/secondary fields you want typeahead matching on
 * (student code, phone, employee code, …) without showing them as the label.
 */
export type SearchSelectOption = {
  value: string;
  label: string;
  description?: ReactNode;
  /** Extra text matched while filtering — codes, phone, email, etc. */
  keywords?: string;
  disabled?: boolean;
};

const filterOptions = createFilterOptions<SearchSelectOption>({
  trim: true,
  stringify: (o) =>
    `${o.label} ${typeof o.description === "string" ? o.description : ""} ${o.keywords ?? ""}`,
});

export type SearchSelectProps = {
  options: SearchSelectOption[];
  /** Selected option value. `""` means nothing selected. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  size?: "small" | "medium";
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  name?: string;
};

/**
 * Searchable single-select built on Autocomplete. Use instead of a plain
 * `<Select>` when the list can be long (students, employees, batches): the user
 * types a name or a unique code and the list filters down.
 */
export function SearchSelect({
  options,
  value,
  onChange,
  label,
  placeholder,
  loading = false,
  disabled = false,
  error = false,
  helperText,
  size = "small",
  fullWidth = true,
  sx,
  onBlur,
  inputRef,
  name,
}: SearchSelectProps) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Autocomplete<SearchSelectOption>
      options={options}
      value={selected}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      sx={sx}
      autoHighlight
      filterOptions={filterOptions}
      getOptionLabel={(o) => o.label}
      getOptionDisabled={(o) => !!o.disabled}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      onChange={(_, opt) => onChange(opt?.value ?? "")}
      onBlur={onBlur}
      renderOption={(props, o) => (
        <Box component="li" {...props} key={o.value}>
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={600}>
              {o.label}
            </Typography>
            {o.description ? (
              <Typography variant="caption" color="text.secondary">
                {o.description}
              </Typography>
            ) : null}
          </Stack>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          placeholder={placeholder}
          size={size}
          error={error}
          helperText={helperText}
          inputRef={inputRef}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default SearchSelect;
