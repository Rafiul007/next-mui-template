"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Typography,
  alpha,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as yup from "yup";
import { RhfTextField } from "@/components/form";
import { AuthClientError, loginWithPassword } from "@/lib/auth/client";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

const loginSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: yup
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })
  .required();

type LoginFormValues = yup.InferType<typeof loginSchema>;

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues,
    mode: "onTouched",
  });

  const getLoginToastMessage = (error: unknown) => {
    if (!(error instanceof AuthClientError)) {
      return "Unable to sign in right now. Please try again.";
    }

    if (error.code === "invalid_credentials") {
      return "Incorrect email or password.";
    }

    if (error.code === "invalid_request") {
      return "Please review your login details and try again.";
    }

    if (error.code === "service_unavailable") {
      return "Authentication service is temporarily unavailable.";
    }

    if (error.code === "network_error") {
      return error.message;
    }

    return error.message;
  };

  const handleLogin = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await loginWithPassword(values.email, values.password);
      toast.success("Signed in successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to sign in.");

      setErrorMessage(message);
      toast.error(getLoginToastMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(16,185,129,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(15,23,42,0.16), transparent 22%)",
          pointerEvents: "none",
        }}
      />

      <Card
        sx={{
          width: "100%",
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            color: "#ffffff",
            background: primaryGradient,
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -80,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              bgcolor: alpha("#ffffff", 0.12),
              filter: "blur(12px)",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gap: 3,
            }}
          >
            <Box
              component={Link}
              href="/"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.5,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  mt: 0.25,
                  color: "#ffffff",
                  fontWeight: 800,
                  letterSpacing: -0.8,
                }}
              >
                BongoEdu360
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                maxWidth: 360,
                color: alpha("#ffffff", 0.82),
                lineHeight: 1.8,
              }}
            >
              Manage your coaching center with ease.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            display: "flex",
            alignItems: "center",
            bgcolor: alpha("#ffffff", 0.76),
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(handleLogin)}
            noValidate
            sx={{ width: "100%", maxWidth: 420 }}
          >
            <Typography variant="h4" component="h1">
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Use your account credentials to enter the dashboard.
            </Typography>

            <Box
              sx={{
                mt: 4,
                display: "grid",
                gap: 2.5,
              }}
            >
              {errorMessage ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errorMessage}
                </Alert>
              ) : null}

              <RhfTextField
                control={control}
                name="email"
                label="Email"
                type="email"
                fullWidth
                autoComplete="email"
                placeholder="name@company.com"
                trim
              />
              <RhfTextField
                control={control}
                name="password"
                label="Password"
                type="password"
                fullWidth
                autoComplete="current-password"
                placeholder="Enter your password"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress color="inherit" size={22} />
                ) : (
                  "Sign in"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
