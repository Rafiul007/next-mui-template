"use client";

import type { ReactNode } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  alpha,
  type CheckboxProps,
  type FormControlProps,
} from "@mui/material";
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

export type RhfCheckboxGroupOption = {
  label: ReactNode;
  value: string;
  disabled?: boolean;
};

type RhfCheckboxGroupProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: ReactNode;
  options: RhfCheckboxGroupOption[];
  helperText?: ReactNode;
  formControlProps?: Omit<FormControlProps, "error" | "disabled">;
} & Omit<
  CheckboxProps,
  "checked" | "defaultChecked" | "name" | "onChange" | "value"
> &
  Omit<ControllerProps<TFieldValues>, "control" | "render" | "name">;

export const RhfCheckboxGroup = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  helperText,
  formControlProps,
  ...checkboxProps
}: RhfCheckboxGroupProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      render={({ field, fieldState: { error } }) => {
        const selectedValues = Array.isArray(field.value)
          ? (field.value as string[])
          : [];

        return (
          <FormControl
            {...formControlProps}
            disabled={disabled}
            error={!!error}
          >
            <FormLabel
              sx={{
                mb: 1.25,
                color: "text.primary",
                typography: "subtitle2",
              }}
            >
              {label}
            </FormLabel>

            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
              }}
            >
              {options.map((option) => {
                const isChecked = selectedValues.includes(option.value);

                return (
                  <Box
                    key={`${name}-${option.value}`}
                    sx={{
                      minWidth: 0,
                      border: "1px solid",
                      borderRadius: 2,
                      borderColor: isChecked ? "primary.main" : "divider",
                      bgcolor: isChecked
                        ? alpha("#10b981", 0.08)
                        : "background.paper",
                      transition: "border-color 120ms ease, background-color 120ms ease",
                    }}
                  >
                    <FormControlLabel
                      sx={{
                        m: 0,
                        px: 1.25,
                        py: 0.75,
                        width: "100%",
                        alignItems: "center",
                        "& .MuiCheckbox-root": {
                          p: 0.75,
                          mr: 0.75,
                        },
                        "& .MuiFormControlLabel-label": {
                          typography: "body2",
                          lineHeight: 1.35,
                          whiteSpace: "normal",
                        },
                      }}
                      control={
                        <Checkbox
                          {...checkboxProps}
                          checked={isChecked}
                          inputRef={field.ref}
                          disabled={disabled || option.disabled}
                          onBlur={field.onBlur}
                          onChange={(_, checked) => {
                            const nextValues = checked
                              ? [...new Set([...selectedValues, option.value])]
                              : selectedValues.filter(
                                  (value) => value !== option.value,
                                );

                            field.onChange(nextValues);
                          }}
                        />
                      }
                      label={option.label}
                    />
                  </Box>
                );
              })}
            </Box>

            <FormHelperText>{error?.message ?? helperText}</FormHelperText>
          </FormControl>
        );
      }}
    />
  );
};

export default RhfCheckboxGroup;
