"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AddRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-hot-toast";
import { RhfTextField } from "@/components/form";
import { getErrorMessage } from "@/lib/errors";
import {
  CreateFeeTypeDocument,
  GetFeeTypesDocument,
} from "@/graphql/generated";

const schema = yup
  .object({
    typeName: yup
      .string()
      .trim()
      .required("Name is required")
      .max(80, "Too long"),
    isRecurring: yup.boolean().required().default(false),
  })
  .required();

type FormValues = yup.InferType<typeof schema>;

export function FeeTypesSection() {
  const [isAdding, setIsAdding] = useState(false);

  const { data, loading } = useQuery(GetFeeTypesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const [createFeeType, { loading: isCreating }] = useMutation(
    CreateFeeTypeDocument,
    { refetchQueries: [GetFeeTypesDocument] },
  );

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<FormValues>({
      resolver: yupResolver(schema),
      defaultValues: { typeName: "", isRecurring: false },
    });

  const isRecurring = watch("isRecurring");

  const handleCreate = async (values: FormValues) => {
    try {
      await createFeeType({
        variables: {
          input: {
            typeName: values.typeName.trim(),
            isRecurring: values.isRecurring,
          },
        },
      });
      toast.success(`"${values.typeName.trim()}" created.`);
      reset({ typeName: "", isRecurring: false });
      setIsAdding(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create fee type."));
    }
  };

  const feeTypes = data?.getFeeTypes ?? [];

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 2.5,
          py: 1.75,
          bgcolor: "#ffffff",
          borderBottom: "1px solid",
          borderColor: alpha("#0f172a", 0.08),
        }}
      >
        <Stack spacing={0.25}>
          <Typography variant="subtitle2" fontWeight={700}>
            Fee types
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Reusable fee categories assigned to batch fee plans.
          </Typography>
        </Stack>
        {!isAdding && (
          <Button
            size="small"
            startIcon={<AddRounded />}
            variant="outlined"
            onClick={() => setIsAdding(true)}
          >
            Add fee type
          </Button>
        )}
      </Stack>

      {/* Inline create form */}
      {isAdding && (
        <>
          <Box
            component="form"
            onSubmit={handleSubmit(handleCreate)}
            noValidate
            sx={{ px: 2.5, py: 2, bgcolor: alpha("#f8fafc", 0.8) }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "flex-start" }}
            >
              <Box sx={{ flex: 1 }}>
                <RhfTextField
                  control={control}
                  name="typeName"
                  label="Fee type name"
                  placeholder="e.g. Admission Fee, Monthly Tuition"
                  fullWidth
                  trim
                  autoFocus
                />
              </Box>
              <FormControlLabel
                sx={{ mt: { xs: 0, sm: 0.75 }, flexShrink: 0 }}
                control={
                  <Switch
                    checked={isRecurring}
                    onChange={(e) => setValue("isRecurring", e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    {isRecurring ? "Monthly" : "One-time"}
                  </Typography>
                }
              />
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexShrink: 0, mt: { xs: 0, sm: 0.75 } }}
              >
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    setIsAdding(false);
                    reset({ typeName: "", isRecurring: false });
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="submit"
                  variant="contained"
                  disabled={isCreating}
                  sx={{ minWidth: 72 }}
                >
                  {isCreating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </Stack>
            </Stack>
          </Box>
          <Divider />
        </>
      )}

      {/* Fee types list */}
      {loading && feeTypes.length === 0 ? (
        <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      ) : feeTypes.length === 0 ? (
        <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No fee types yet. Add one to use in batch fee plans.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Table header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 100px",
              px: 2.5,
              py: 1.25,
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.06),
            }}
          >
            {["Name", "Billing", "Status"].map((h) => (
              <Typography
                key={h}
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: alpha("#0f172a", 0.52),
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {h}
              </Typography>
            ))}
          </Box>

          {feeTypes.map((ft, index) => (
            <Box
              key={ft.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 100px",
                px: 2.5,
                py: 1.5,
                bgcolor: "#ffffff",
                borderBottom:
                  index < feeTypes.length - 1 ? "1px solid" : "none",
                borderColor: alpha("#0f172a", 0.06),
                "&:hover": { bgcolor: alpha("#f8fafc", 0.9) },
                transition: "background-color 120ms ease",
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ alignSelf: "center" }}>
                {ft.typeName}
              </Typography>
              <Box sx={{ alignSelf: "center" }}>
                <Chip
                  label={ft.isRecurring ? "Monthly" : "One-time"}
                  size="small"
                  color={ft.isRecurring ? "primary" : "default"}
                  variant="outlined"
                  sx={{ fontSize: 11 }}
                />
              </Box>
              <Box sx={{ alignSelf: "center" }}>
                <Chip
                  label={ft.isActive ? "Active" : "Inactive"}
                  size="small"
                  color={ft.isActive ? "success" : "default"}
                  variant={ft.isActive ? "filled" : "outlined"}
                  sx={{ fontSize: 11 }}
                />
              </Box>
            </Box>
          ))}
        </>
      )}
    </Paper>
  );
}
