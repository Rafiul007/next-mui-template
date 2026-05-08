import type { RhfCheckboxGroupOption, RhfSelectOption } from "@/components/form";

/**
 * Generic form field config types. Each workspace specialises the TName
 * parameter to its own form-values keyof so that RHF name props stay
 * type-safe at the call-site.
 */

export type TextFieldCfg<TName extends string = string> = {
  kind: "text";
  name: TName;
  label: string;
  placeholder?: string;
  type?: string;
  helperText?: string;
  trim?: boolean;
  multiline?: boolean;
  minRows?: number;
  fullSpan?: boolean;
};

export type SelectFieldCfg<TName extends string = string> = {
  kind: "select";
  name: TName;
  label: string;
  options: RhfSelectOption[];
  placeholder?: string;
  fullSpan?: boolean;
};

export type DateFieldCfg<TName extends string = string> = {
  kind: "date";
  name: TName;
  label: string;
  helperText?: string;
  fullSpan?: boolean;
};

export type CheckboxGroupCfg<TName extends string = string> = {
  kind: "checkboxGroup";
  name: TName;
  label: string;
  options: RhfCheckboxGroupOption[];
  fullSpan?: boolean;
};

export type FormSection<TField = unknown> = {
  key: string;
  label: string;
  fields: TField[];
};
