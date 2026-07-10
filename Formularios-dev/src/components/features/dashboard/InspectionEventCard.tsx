"use client";

import React from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Circle,
  OpenInNew,
  ThumbUp,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { InspectionResponse } from "@/lib/actions/inspection-herra-equipos";
import { InspectionStatus } from "@/components/features/herra-equipos/types/IProps";

interface InspectionEventCardProps {
  inspection: InspectionResponse;
  showApproveButton?: boolean;
  compact?: boolean;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "hace un momento";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffH < 24) return `hace ${diffH}h`;
  if (diffD === 1) return "ayer";
  return `hace ${diffD} días`;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  [InspectionStatus.COMPLETED]: {
    label: "Completada",
    color: "#16a34a",
    bg: "#f0fdf4",
    icon: <CheckCircle sx={{ fontSize: 15, color: "#16a34a" }} />,
  },
  [InspectionStatus.PENDING_APPROVAL]: {
    label: "Pend. Aprobación",
    color: "#d97706",
    bg: "#fffbeb",
    icon: <HourglassEmpty sx={{ fontSize: 15, color: "#d97706" }} />,
  },
  [InspectionStatus.APPROVED]: {
    label: "Aprobada",
    color: "#2563eb",
    bg: "#eff6ff",
    icon: <CheckCircle sx={{ fontSize: 15, color: "#2563eb" }} />,
  },
  [InspectionStatus.REJECTED]: {
    label: "Rechazada",
    color: "#dc2626",
    bg: "#fef2f2",
    icon: <Cancel sx={{ fontSize: 15, color: "#dc2626" }} />,
  },
  [InspectionStatus.DRAFT]: {
    label: "Borrador",
    color: "#6b7280",
    bg: "#f9fafb",
    icon: <Circle sx={{ fontSize: 15, color: "#6b7280" }} />,
  },
  [InspectionStatus.IN_PROGRESS]: {
    label: "En Progreso",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: <HourglassEmpty sx={{ fontSize: 15, color: "#7c3aed" }} />,
  },
};

export function InspectionEventCard({
  inspection,
  showApproveButton = false,
  compact = false,
}: InspectionEventCardProps) {
  const router = useRouter();
  const status = STATUS_CONFIG[inspection.status] || STATUS_CONFIG[InspectionStatus.DRAFT];

  const handleView = () => {
    router.push(
      `/dashboard/form-herra-equipos/${inspection.templateCode}?id=${inspection._id}&mode=view`
    );
  };

  const handleApprove = () => {
    router.push(
      `/dashboard/form-herra-equipos/${inspection.templateCode}?id=${inspection._id}&mode=approval`
    );
  };

  const inspectorName =
    (inspection.inspectorSignature?.inspectorName as string) ||
    (inspection.inspectorSignature?.name as string) ||
    inspection.submittedBy ||
    "Inspector";

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 1.5 : 2,
        mb: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.06)",
        bgcolor: status.bg,
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderColor: status.color + "40",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Left: Status icon + Info */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
          <Box sx={{ mt: 0.3, flexShrink: 0 }}>{status.icon}</Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: compact ? "12px" : "13px",
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {inspection.templateName || inspection.templateCode}
            </Typography>

            <Typography sx={{ fontSize: "11px", color: "text.secondary", mt: 0.3 }}>
              {inspectorName}
              {inspection.area && (
                <span style={{ color: "#6366f1", fontWeight: 600 }}>
                  {" "}· {inspection.area}
                </span>
              )}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mt: 0.8, alignItems: "center", flexWrap: "wrap" }}>
              <Chip
                label={status.label}
                size="small"
                sx={{
                  fontSize: "10px",
                  height: 20,
                  bgcolor: status.color + "18",
                  color: status.color,
                  fontWeight: 700,
                  border: "1px solid " + status.color + "30",
                }}
              />
              <Typography sx={{ fontSize: "10px", color: "text.disabled" }}>
                {formatRelativeTime(inspection.submittedAt)}
              </Typography>
              <Typography sx={{ fontSize: "10px", color: "text.disabled", fontFamily: "monospace" }}>
                {inspection.templateCode}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: Action buttons */}
        {!compact && (
          <Box sx={{ display: "flex", gap: 0.5, ml: 1, flexShrink: 0 }}>
            {showApproveButton && inspection.status === InspectionStatus.PENDING_APPROVAL && (
              <Button
                size="small"
                startIcon={<ThumbUp sx={{ fontSize: 13 }} />}
                onClick={handleApprove}
                sx={{
                  fontSize: "11px",
                  py: 0.5,
                  px: 1.2,
                  borderRadius: 1.5,
                  bgcolor: "#d97706",
                  color: "#fff",
                  fontWeight: 700,
                  textTransform: "none",
                  minWidth: 0,
                  "&:hover": { bgcolor: "#b45309" },
                }}
              >
                Aprobar
              </Button>
            )}
            <Button
              size="small"
              startIcon={<OpenInNew sx={{ fontSize: 13 }} />}
              onClick={handleView}
              sx={{
                fontSize: "11px",
                py: 0.5,
                px: 1.2,
                borderRadius: 1.5,
                bgcolor: "rgba(99,102,241,0.08)",
                color: "#6366f1",
                fontWeight: 700,
                textTransform: "none",
                minWidth: 0,
                "&:hover": { bgcolor: "rgba(99,102,241,0.16)" },
              }}
            >
              Ver
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
