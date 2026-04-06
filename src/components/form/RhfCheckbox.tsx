"use client";

import type { ChangeEvent, ReactNode } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  type CheckboxProps,
  type FormControlProps,
} from "@mui/material";
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPathByValue,
  type FieldValues,
} from "react-hook-form";

type RhfCheckboxProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPathByValue<TFieldValues, boolean | null | undefined>;
  label: ReactNode;
  helperText?: ReactNode;
  formControlProps?: Omit<FormControlProps, "error" | "disabled">;
  onCustomChange?: (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
} & Omit<
  CheckboxProps,
  "name" | "checked" | "defaultChecked" | "onChange" | "value"
> &
  Omit<ControllerProps<TFieldValues>, "control" | "render" | "name">;

export const RhfCheckbox = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  helperText,
  formControlProps,
  onCustomChange,
  ...checkboxProps
}: RhfCheckboxProps<TFieldValues>) => {
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
          event: ChangeEvent<HTMLInputElement>,
          checked: boolean,
        ) => {
          field.onChange(checked);
          onCustomChange?.(event, checked);
        };

        return (
          <FormControl
            {...formControlProps}
            disabled={disabled}
            error={!!error}
          >
            <FormControlLabel
              label={label}
              control={
                <Checkbox
                  {...checkboxProps}
                  name={field.name}
                  checked={!!field.value}
                  inputRef={field.ref}
                  onChange={handleChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                />
              }
            />
            <FormHelperText>{error?.message ?? helperText}</FormHelperText>
          </FormControl>
        );
      }}
    />
  );
};

export default RhfCheckbox;
