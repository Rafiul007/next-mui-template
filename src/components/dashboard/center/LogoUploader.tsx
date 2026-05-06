"use client";

import { useRef, type ChangeEvent } from "react";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import { CloudUploadRounded, ImageRounded } from "@mui/icons-material";
import { InfoBox } from "@/components/ui";
import { primaryGradient } from "@/theme/theme";

type LogoUploaderProps = {
  logoValue: string;
  onLogoChange: (dataUrl: string) => void;
};

export function LogoUploader({ logoValue, onLogoChange }: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Unable to read the logo file."));
      reader.readAsDataURL(file);
    });

    onLogoChange(dataUrl);
    event.target.value = "";
  };

  return (
    <InfoBox>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Avatar
          src={logoValue || undefined}
          sx={{
            width: 72,
            height: 72,
            background: logoValue ? undefined : primaryGradient,
          }}
        >
          {!logoValue ? <ImageRounded /> : null}
        </Avatar>

        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2">Center logo</Typography>
          <Typography variant="body2" color="text.secondary">
            Paste a logo URL or upload an image from your device. The image is
            stored as a string in the current API model.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadRounded />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ alignSelf: "flex-start" }}
            >
              Upload logo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Stack>
        </Stack>
      </Stack>
    </InfoBox>
  );
}
