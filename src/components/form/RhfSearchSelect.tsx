"use client";

import type { ReactNode } from "react";
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { SearchSelect, type SearchSelectOption } from "./SearchSelect";

type RhfSearchSelectProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: SearchSelectOption[];
  placeholder?: string;
  helperText?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  /** Fires after the field value changes — for side effects on selection. */
  onValueChange?: (value: string) => void;
} & Omit<
  ControllerProps<TFieldValues>,
  "control" | "render" | "name" | "defaultValue"
>;

/**
 * RHF-bound searchable single-select. Drop-in replacement for `RhfSelect` when
 * the option list is long enough that a dropdown is painful.
 */
export const RhfSearchSelect = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  helperText,
  disabled,
  loading,
  size = "small",
  fullWidth = true,
  onValueChange,
  rules,
  shouldUnregister,
}: RhfSearchSelectProps<TFieldValues>) => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    shouldUnregister={shouldUnregister}
    disabled={disabled}
    render={({ field, fieldState: { error } }) => (
      <SearchSelect
        options={options}
        value={(field.value as string) ?? ""}
        onChange={(val) => {
          field.onChange(val);
          onValueChange?.(val);
        }}
        onBlur={field.onBlur}
        inputRef={field.ref}
        name={field.name}
        label={label}
        placeholder={placeholder}
        disabled={disabled}
        loading={loading}
        size={size}
        fullWidth={fullWidth}
        error={!!error}
        helperText={error?.message ?? helperText}
      />
    )}
  />
);

export default RhfSearchSelect;
