"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { SaveRounded } from "@mui/icons-material";
import { RhfTextField } from "@/components/form";
import { FormGrid, FormSubmitRow, InfoBox, SectionCard } from "@/components/ui";
import type { GetTenantQuery } from "@/graphql/generated";

type TenantRecord = GetTenantQuery["getTenant"];

const tenantLegalSchema = yup
  .object({
    legalName: yup
      .string()
      .trim()
      .required("Legal name is required")
      .max(120, "Legal name must be 120 characters or fewer"),
    contactName: yup
      .string()
      .trim()
      .max(120, "Contact name must be 120 characters or fewer")
      .default(""),
    contactEmail: yup
      .string()
      .trim()
      .email("Enter a valid contact email")
      .required("Contact email is required"),
    contactPhone: yup
      .string()
      .trim()
      .matches(/^$|^[0-9+\-() ]+$/, "Use numbers and simple phone characters only")
      .max(30, "Contact phone must be 30 characters or fewer")
      .default(""),
    address: yup
      .string()
      .trim()
      .max(220, "Address must be 220 characters or fewer")
      .default(""),
    tradeLicense: yup
      .string()
      .trim()
      .max(80, "Trade license must be 80 characters or fewer")
      .default(""),
    eBIN: yup
      .string()
      .trim()
      .max(80, "eBIN must be 80 characters or fewer")
      .default(""),
  })
  .required();

export type TenantLegalFormValues = yup.InferType<typeof tenantLegalSchema>;

type TenantFieldConfig = {
  name:
    | "legalName"
    | "contactName"
    | "contactEmail"
    | "contactPhone"
    | "tradeLicense"
    | "eBIN"
    | "address";
  label: string;
  placeholder?: string;
  type?: "text" | "email";
  trim?: boolean;
  multiline?: boolean;
  minRows?: number;
};

type TenantLegalFormCardProps = {
  embedded?: boolean;
  errorMessage?: string | null;
  hideHeader?: boolean;
  isSubmitting: boolean;
  onSubmit: (values: TenantLegalFormValues) => Promise<void>;
  submitLabel?: string;
  tenant: TenantRecord;
};

const getTenantLegalValues = (tenant: TenantRecord): TenantLegalFormValues => ({
  legalName: tenant?.legalName ?? "",
  contactName: tenant?.contactName ?? "",
  contactEmail: tenant?.contactEmail ?? "",
  contactPhone: tenant?.contactPhone ?? "",
  address: tenant?.address ?? "",
  tradeLicense: tenant?.tradeLicense ?? "",
  eBIN: tenant?.eBIN ?? "",
});

const tenantFieldConfigs: TenantFieldConfig[] = [
  { name: "legalName", label: "Legal name", placeholder: "Bongo Coaching Ltd.", trim: true },
  { name: "contactName", label: "Contact person", placeholder: "Owner or operations lead", trim: true },
  { name: "contactEmail", label: "Contact email", placeholder: "ops@center.com", type: "email", trim: true },
  { name: "contactPhone", label: "Contact phone", placeholder: "+8801XXXXXXXXX", trim: true },
  { name: "tradeLicense", label: "Trade license number", placeholder: "Trade license", trim: true },
  { name: "eBIN", label: "eBIN number", placeholder: "Electronic BIN", trim: true },
  { name: "address", label: "Registered address", placeholder: "Registered office address", trim: true, multiline: true, minRows: 3 },
];

export function TenantLegalFormCard({
  embedded = false,
  errorMessage,
  hideHeader = false,
  isSubmitting,
  onSubmit,
  submitLabel,
  tenant,
}: TenantLegalFormCardProps) {
  const { control, handleSubmit, reset } = useForm<TenantLegalFormValues>({
    resolver: yupResolver(tenantLegalSchema),
    defaultValues: getTenantLegalValues(tenant),
    mode: "onTouched",
  });

  useEffect(() => {
    reset(getTenantLegalValues(tenant));
  }, [reset, tenant]);

  const content = (
    <Stack spacing={3}>
      {!hideHeader ? (
        <Box>
          <Typography variant="h5">Legal and business information</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Maintain the registered identity of the tenant used for billing,
            contracts, and support operations.
          </Typography>
        </Box>
      ) : null}

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <InfoBox>
        <Typography variant="subtitle2">Tenant slug</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {tenant?.slug ?? "Unavailable"}
        </Typography>
      </InfoBox>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormGrid>
          {tenantFieldConfigs.map((fieldConfig) => (
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
          ))}

          <FormSubmitRow>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveRounded />}
              disabled={isSubmitting}
            >
              {submitLabel ?? "Save legal information"}
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
