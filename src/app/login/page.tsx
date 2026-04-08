import Link from "next/link";
import { Box, Stack, Typography } from "@mui/material";

export default function LoginPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Login Page
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Authentication logic is not added yet.
      </Typography>

      <Stack spacing={1}>
        <Link href="/">Go to Home Page</Link>
        <Link href="/signup">Go to Signup Page</Link>
        <Link href="/dashboard">Go to Dashboard Page</Link>
      </Stack>
    </Box>
  );
}
