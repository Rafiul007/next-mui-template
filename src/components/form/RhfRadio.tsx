"use client";

import type { ChangeEvent, ReactNode } from "react";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  type FormControlProps,
  type FormLabelProps,
  type RadioGroupProps,
} from "@mui/material";
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

export type RhfRadioOption = {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
};

type RhfRadioProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: ReactNode;
  options: RhfRadioOption[];
  helperText?: ReactNode;
  formControlProps?: Omit<FormControlProps, "error" | "disabled">;
  formLabelProps?: FormLabelProps;
  onCustomChange?: (
    event: ChangeEvent<HTMLInputElement>,
    value: string,
  ) => void;
} & Omit<
  RadioGroupProps,
  "name" | "value" | "defaultValue" | "onChange"
> &
  Omit<ControllerProps<TFieldValues>, "control" | "render" | "name">;

export const RhfRadio = <TFieldValues extends FieldValues>({
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
  formLabelProps,
  onCustomChange,
  ...radioGroupProps
}: RhfRadioProps<TFieldValues>) => {
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
          value: string,
        ) => {
          field.onChange(value);
          onCustomChange?.(event, value);
        };

        return (
          <FormControl
            {...formControlProps}
            disabled={disabled}
            error={!!error}
          >
            {label ? <FormLabel {...formLabelProps}>{label}</FormLabel> : null}
            <RadioGroup
              {...radioGroupProps}
              name={field.name}
              value={field.value ?? ""}
              onChange={handleChange}
              onBlur={field.onBlur}
            >
              {options.map((option) => (
                <FormControlLabel
                  key={`${name}-${option.value}`}
                  value={String(option.value)}
                  control={<Radio inputRef={field.ref} />}
                  label={option.label}
                  disabled={option.disabled}
                />
              ))}
            </RadioGroup>
            <FormHelperText>{error?.message ?? helperText}</FormHelperText>
          </FormControl>
        );
      }}
    />
  );
};

export default RhfRadio;
