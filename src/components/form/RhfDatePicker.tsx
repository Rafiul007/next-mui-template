"use client";

import { useState, type FocusEvent, type ReactNode } from "react";
import type { Dayjs } from "dayjs";
import type { TextFieldProps } from "@mui/material";
import {
  DatePicker,
  type DatePickerProps,
} from "@mui/x-date-pickers/DatePicker";
import type { DateValidationError } from "@mui/x-date-pickers/models";
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPathByValue,
  type FieldValues,
} from "react-hook-form";

type RhfDatePickerProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPathByValue<TFieldValues, Dayjs | null | undefined>;
  helperText?: ReactNode;
  textFieldProps?: Omit<
    TextFieldProps,
    "name" | "value" | "defaultValue" | "onChange" | "error" | "helperText"
  >;
  onCustomChange?: (value: Dayjs | null) => void;
} & Omit<
  DatePickerProps,
  "value" | "defaultValue" | "onChange" | "name" | "inputRef" | "slotProps"
> &
  Omit<ControllerProps<TFieldValues>, "control" | "render" | "name">;

const getDatePickerErrorMessage = (error: DateValidationError) => {
  switch (error) {
    case "invalidDate":
      return "Enter a valid date";
    case "disableFuture":
      return "Future dates are not allowed";
    case "disablePast":
      return "Past dates are not allowed";
    case "minDate":
      return "Date is earlier than allowed";
    case "maxDate":
      return "Date is later than allowed";
    case "shouldDisableDate":
    case "shouldDisableMonth":
    case "shouldDisableYear":
      return "This date is not available";
    default:
      return null;
  }
};

export const RhfDatePicker = <TFieldValues extends FieldValues>({
  control,
  name,
  defaultValue,
  rules,
  shouldUnregister,
  disabled,
  helperText,
  textFieldProps,
  onCustomChange,
  onError,
  ...datePickerProps
}: RhfDatePickerProps<TFieldValues>) => {
  const [pickerError, setPickerError] = useState<DateValidationError>(null);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      render={({ field, fieldState: { error } }) => {
        const handleChange = (value: Dayjs | null) => {
          field.onChange(value);
          onCustomChange?.(value);
        };

        const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
          field.onBlur();
          textFieldProps?.onBlur?.(event);
        };

        const handleError = (
          nextError: DateValidationError,
          value: Dayjs | null,
        ) => {
          setPickerError(nextError);
          onError?.(nextError, value);
        };

        return (
          <DatePicker
            {...datePickerProps}
            value={field.value ?? null}
            disabled={disabled}
            name={field.name}
            inputRef={field.ref}
            onChange={handleChange}
            onError={handleError}
            slotProps={{
              textField: {
                ...textFieldProps,
                onBlur: handleBlur,
                error: !!error || !!pickerError,
                helperText:
                  error?.message ??
                  getDatePickerErrorMessage(pickerError) ??
                  helperText ??
                  textFieldProps?.helperText,
                fullWidth: textFieldProps?.fullWidth ?? true,
                size: textFieldProps?.size ?? "small",
              },
            }}
          />
        );
      }}
    />
  );
};

export default RhfDatePicker;
