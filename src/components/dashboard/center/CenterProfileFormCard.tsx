"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { SaveRounded } from "@mui/icons-material";
import {
  RhfSelect,
  RhfTextField,
  type RhfSelectOption,
} from "@/components/form";
import { FormGrid, FormSubmitRow, SectionCard } from "@/components/ui";
import type { GetCenterQuery } from "@/graphql/generated";
import { LogoUploader } from "./LogoUploader";

type CenterRecord = GetCenterQuery["getCenter"];

const monthOptions: RhfSelectOption[] = [
  { label: "Not set", value: "" },
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const centerProfileSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Center name is required")
      .max(120, "Center name must be 120 characters or fewer"),
    nameBangla: yup
      .string()
      .trim()
      .max(120, "Bangla name must be 120 characters or fewer")
      .default(""),
    tagline: yup
      .string()
      .trim()
      .max(160, "Tagline must be 160 characters or fewer")
      .default(""),
    logo: yup.string().default(""),
    establishedYear: yup
      .string()
      .trim()
      .matches(/^$|^\d{4}$/, "Use a four-digit year")
      .default(""),
    academicYearStartMonth: yup
      .string()
      .oneOf(["", ...monthOptions.slice(1).map((option) => String(option.value))])
      .default(""),
    email: yup
      .string()
      .trim()
      .email("Enter a valid email address")
      .default(""),
    phone: yup
      .string()
      .trim()
      .matches(/^$|^[0-9+\-() ]+$/, "Use numbers and simple phone characters only")
      .max(30, "Phone number must be 30 characters or fewer")
      .default(""),
    address: yup
      .string()
      .trim()
      .max(220, "Address must be 220 characters or fewer")
      .default(""),
  })
  .required();

export type CenterProfileFormValues = yup.InferType<typeof centerProfileSchema>;

type CenterProfileFormCardProps = {
  center: CenterRecord;
  embedded?: boolean;
  errorMessage?: string | null;
  hideHeader?: boolean;
  isSubmitting: boolean;
  onSubmit: (values: CenterProfileFormValues) => Promise<void>;
  submitLabel?: string;
};

type CenterFieldConfig =
  | {
      kind: "text";
      name:
        | "name"
        | "nameBangla"
        | "tagline"
        | "email"
        | "phone"
        | "address"
        | "establishedYear";
      label: string;
      placeholder?: string;
      type?: "text" | "email" | "number";
      trim?: boolean;
      multiline?: boolean;
      minRows?: number;
    }
  | {
      kind: "select";
      name: "academicYearStartMonth";
      label: string;
      options: RhfSelectOption[];
    };

const getCenterProfileValues = (center: CenterRecord): CenterProfileFormValues => ({
  name: center?.name ?? "",
  nameBangla: center?.nameBangla ?? "",
  tagline: center?.tagline ?? "",
  logo: center?.logo ?? "",
  establishedYear: center?.establishedYear ? String(center.establishedYear) : "",
  academicYearStartMonth: center?.academicYearStartMonth
    ? String(center.academicYearStartMonth)
    : "",
  email: center?.email ?? "",
  phone: center?.phone ?? "",
  address: center?.address ?? "",
});

const centerFieldConfigs: CenterFieldConfig[] = [
  { kind: "text", name: "name", label: "Center name", placeholder: "Bongo Coaching Center", trim: true },
  { kind: "text", name: "nameBangla", label: "Center name (Bangla)", placeholder: "বাংলা নাম", trim: true },
  { kind: "text", name: "tagline", label: "Tagline", placeholder: "Helping students learn with confidence", trim: true },
  { kind: "text", name: "establishedYear", label: "Established year", placeholder: "2018", type: "number" },
  { kind: "select", name: "academicYearStartMonth", label: "Academic year starts in", options: monthOptions },
  { kind: "text", name: "email", label: "Center email", placeholder: "info@center.com", type: "email", trim: true },
  { kind: "text", name: "phone", label: "Center phone", placeholder: "+8801XXXXXXXXX", trim: true },
  { kind: "text", name: "address", label: "Address", placeholder: "Road, area, city", trim: true, multiline: true, minRows: 3 },
];

export function CenterProfileFormCard({
  center,
  embedded = false,
  errorMessage,
  hideHeader = false,
  isSubmitting,
  onSubmit,
  submitLabel,
}: CenterProfileFormCardProps) {
  const { control, handleSubmit, reset, setValue } =
    useForm<CenterProfileFormValues>({
      resolver: yupResolver(centerProfileSchema),
      defaultValues: getCenterProfileValues(center),
      mode: "onTouched",
    });

  const logoValue = useWatch({ control, name: "logo" });

  useEffect(() => {
    reset(getCenterProfileValues(center));
  }, [center, reset]);

  const content = (
    <Stack spacing={3}>
      {!hideHeader ? (
        <Box>
          <Typography variant="h5">
            {center ? "Center profile" : "Set up your center"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Keep your center identity, academic calendar baseline, and public
            contact details up to date.
          </Typography>
        </Box>
      ) : null}

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <LogoUploader
        logoValue={logoValue}
        onLogoChange={(dataUrl) =>
          setValue("logo", dataUrl, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
      />

      <RhfTextField
        control={control}
        name="logo"
        label="Logo URL or image data"
        placeholder="https://example.com/logo.png"
        fullWidth
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormGrid>
          {centerFieldConfigs.map((fieldConfig) =>
            fieldConfig.kind === "select" ? (
              <RhfSelect
                key={fieldConfig.name}
                control={control}
                name={fieldConfig.name}
                label={fieldConfig.label}
                options={fieldConfig.options}
                fullWidth
              />
            ) : (
              <RhfTextField
                key={fieldConfig.name}
                control={control}
                name={fieldConfig.name}
                label={fieldConfig.label}
                placeholder={fieldConfig.placeholder}
                type={fieldConfig.type}
                trim={fieldConfig.trim}
                multiline={fieldConfig.multiline}
                minRows={fieldConfig.minRows}
                fullWidth
                sx={
                  fieldConfig.name === "address"
                    ? { gridColumn: { md: "1 / -1" } }
                    : undefined
                }
              />
            ),
          )}

          <FormSubmitRow>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveRounded />}
              disabled={isSubmitting}
            >
              {submitLabel ??
                (center ? "Save center profile" : "Create center profile")}
            </Button>
          </FormSubmitRow>
        </FormGrid>
      </Box>
    </Stack>
  );

  if (embedded) {
    return content;
  }

  return <SectionCard sx={{ p: { xs: 3, md: 4 } }}>{content}</SectionCard>;
}
