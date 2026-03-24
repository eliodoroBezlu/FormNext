"use client";

import { Box, Typography, Chip } from "@mui/material";
import { ArrowBack, Visibility } from "@mui/icons-material";
import { Button } from "@/components/atoms/button/Button";
import { useRouter } from "next/navigation";

interface ReportPageHeaderProps {
  title: string;
  isViewMode?: boolean;
  onBack?: () => void;
}

export function ReportPageHeader({
  title,
  isViewMode = false,
  onBack,
}: ReportPageHeaderProps) {
  const router = useRouter();

  return (
    <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={2}>
        <Button
          variant="text"
          onClick={onBack ?? (() => router.back())}
          startIcon={<ArrowBack />}
        >
          Volver
        </Button>
        <Typography variant="h5">{title}</Typography>
        {isViewMode && (
          <Chip label="Modo Lectura" icon={<Visibility />} size="small" />
        )}
      </Box>
    </Box>
  );
}