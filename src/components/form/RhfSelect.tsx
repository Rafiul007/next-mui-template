"use client";

import type { ReactNode } from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type FormControlProps,
  type SelectChangeEvent,
  type SelectProps,
} from "@mui/material";
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

export type RhfSelectOption = {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
};

type RhfSelectProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: RhfSelectOption[];
  helperText?: ReactNode;
  placeholder?: ReactNode;
  formControlProps?: Omit<
    FormControlProps,
    "error" | "disabled" | "fullWidth" | "size"
  >;
  onCustomChange?: (event: SelectChangeEvent<string>) => void;
} & Omit<
  SelectProps<string>,
  "name" | "value" | "defaultValue" | "onChange" | "label"
> &
  Omit<ControllerProps<TFieldValues>, "control" | "render" | "name">;

export const RhfSelect = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  helperText,
  placeholder,
  size = "small",
  fullWidth = true,
  displayEmpty,
  formControlProps,
  onCustomChange,
  ...selectProps
}: RhfSelectProps<TFieldValues>) => {
  const labelId = `${name}-label`;

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      render={({ field, fieldState: { error } }) => {
        const handleChange = (event: SelectChangeEvent<string>) => {
          field.onChange(event.target.value);
          onCustomChange?.(event);
        };

        return (
          <FormControl
            {...formControlProps}
            fullWidth={fullWidth}
            size={size}
            disabled={disabled}
            error={!!error}
          >
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select
              {...selectProps}
              labelId={labelId}
              label={label}
              name={field.name}
              value={field.value ?? ""}
              inputRef={field.ref}
              onChange={handleChange}
              onBlur={field.onBlur}
              displayEmpty={displayEmpty ?? !!placeholder}
            >
              {placeholder ? (
                <MenuItem value="" disabled>
                  {placeholder}
                </MenuItem>
              ) : null}
              {options.map((option) => (
                <MenuItem
                  key={`${name}-${option.value}`}
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{error?.message ?? helperText}</FormHelperText>
          </FormControl>
        );
      }}
    />
  );
};

export default RhfSelect;
