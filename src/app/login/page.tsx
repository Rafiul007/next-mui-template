"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Card, Typography, alpha } from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { RhfTextField } from "@/components/form";
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

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: alpha("#ffffff", 0.72),
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues,
    mode: "onTouched",
  });

  const handleLogin = () => {
    router.push("/dashboard");
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
              <RhfTextField
                control={control}
                name="email"
                label="Email"
                type="email"
                fullWidth
                autoComplete="email"
                placeholder="name@company.com"
                sx={textFieldSx}
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
                sx={textFieldSx}
              />

              <Button type="submit" variant="contained" size="large" fullWidth>
                Sign in
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
