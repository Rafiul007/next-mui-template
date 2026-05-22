"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AddRounded, RepeatRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
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
    keyName: yup
      .string()
      .trim()
      .matches(/^[a-z0-9_]*$/, "Only lowercase letters, numbers and underscores")
      .max(60, "Too long")
      .default(""),
    isRecurring: yup.boolean().required().default(false),
  })
  .required();

type FormValues = yup.InferType<typeof schema>;

type FeeTypesDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function FeeTypesDialog({ open, onClose }: FeeTypesDialogProps) {
  const [isAdding, setIsAdding] = useState(false);

  const { data, loading } = useQuery(GetFeeTypesDocument, {
    fetchPolicy: "cache-and-network",
    skip: !open,
  });

  const [createFeeType, { loading: isCreating }] = useMutation(
    CreateFeeTypeDocument,
    { refetchQueries: [GetFeeTypesDocument] },
  );

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<FormValues>({
      resolver: yupResolver(schema),
      defaultValues: { typeName: "", keyName: "", isRecurring: false },
    });

  const isRecurring = watch("isRecurring");

  const handleCreate = async (values: FormValues) => {
    try {
      await createFeeType({
        variables: {
          input: {
            typeName: values.typeName.trim(),
            keyName: values.keyName?.trim() || undefined,
            isRecurring: values.isRecurring,
          },
        },
      });
      toast.success(`"${values.typeName.trim()}" created.`);
      reset({ typeName: "", keyName: "", isRecurring: false });
      setIsAdding(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create fee type."));
    }
  };

  const feeTypes = data?.getFeeTypes ?? [];

  return (
    <Dialog
      open={open}
      onClose={isCreating ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Fee types</DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading && feeTypes.length === 0 ? (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : feeTypes.length === 0 && !isAdding ? (
          <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No fee types yet. Add one to use in batch fee plans.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {feeTypes.map((ft) => (
              <Stack
                key={ft.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 3, py: 1.5 }}
              >
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={600}>
                    {ft.typeName}
                  </Typography>
                  {ft.keyName && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontFamily: "monospace" }}>
                      {ft.keyName}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    {ft.isRecurring ? (
                      <Chip
                        label="Monthly"
                        size="small"
                        icon={
                          <RepeatRounded
                            sx={{ fontSize: "12px !important" }}
                          />
                        }
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                    ) : (
                      <Chip
                        label="One-time"
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                    )}
                    {!ft.isActive && (
                      <Chip
                        label="Inactive"
                        size="small"
                        color="default"
                        sx={{ fontSize: 11 }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}

        {isAdding ? (
          <Box
            component="form"
            onSubmit={handleSubmit(handleCreate)}
            noValidate
            sx={{
              px: 3,
              py: 2.5,
              borderTop: feeTypes.length > 0 ? "1px solid" : "none",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight={700}>
                New fee type
              </Typography>

              <RhfTextField
                control={control}
                name="typeName"
                label="Name"
                placeholder="e.g. Admission Fee, Monthly Tuition"
                fullWidth
                trim
                autoFocus
              />

              <RhfTextField
                control={control}
                name="keyName"
                label="Key name (optional)"
                placeholder="e.g. admission_fee, monthly_tuition"
                fullWidth
                trim
                helperText="Machine-readable identifier — lowercase, numbers, underscores only"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isRecurring}
                    onChange={(e) => setValue("isRecurring", e.target.checked)}
                  />
                }
                label={
                  <Stack spacing={0}>
                    <Typography variant="body2">Recurring (monthly)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Off = one-time charge
                    </Typography>
                  </Stack>
                }
              />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
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
        ) : (
          <Box sx={{ px: 3, py: 2 }}>
            <Button
              size="small"
              startIcon={<AddRounded />}
              onClick={() => setIsAdding(true)}
              variant="outlined"
              fullWidth
            >
              Add fee type
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
