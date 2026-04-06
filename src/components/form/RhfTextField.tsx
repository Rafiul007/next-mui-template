"use client";

import type { ChangeEvent, FocusEvent } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

type RhfTextFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  onCustomChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  trim?: boolean;
} & Omit<
  TextFieldProps,
  "name" | "value" | "defaultValue" | "onChange" | "error"
> &
  Omit<ControllerProps<TFieldValues>, "control" | "render" | "name">;

export const RhfTextField = <TFieldValues extends FieldValues>({
  control,
  name,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  onBlur,
  onCustomChange,
  helperText,
  size = "small",
  trim = false,
  ...textFieldProps
}: RhfTextFieldProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      render={({ field, fieldState: { error } }) => {
        const handleChange = (
          event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
          field.onChange(event);
          onCustomChange?.(event);
        };

        const handleBlur = (
          event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
          field.onBlur();

          if (trim && typeof field.value === "string") {
            const trimmedValue = field.value.trim().replace(/\s+/g, " ");

            if (trimmedValue !== field.value) {
              field.onChange(trimmedValue);
            }
          }

          onBlur?.(event);
        };

        return (
          <TextField
            {...textFieldProps}
            name={field.name}
            value={field.value ?? ""}
            inputRef={field.ref}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            error={!!error}
            helperText={error?.message ?? helperText}
            size={size}
          />
        );
      }}
    />
  );
};

export default RhfTextField;
