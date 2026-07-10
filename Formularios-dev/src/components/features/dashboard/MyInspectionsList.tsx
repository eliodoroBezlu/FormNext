"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Skeleton,
  Alert,
  Chip,
  Divider,
  Paper,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Circle,
  OpenInNew,
  Assignment,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  getInspectionsHerraEquipos,
  InspectionResponse,
} from "@/lib/actions/inspection-herra-equipos";
import { InspectionStatus } from "@/components/features/herra-equipos/types/IProps";

interface MyInspectionsListProps {
  username: string;
  area?: string;
}

interface DayGroup {
  label: string;
  inspections: InspectionResponse[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [InspectionStatus.COMPLETED]: {
    label: "Completada",
    color: "#16a34a",
    icon: <CheckCircle sx={{ fontSize: 14, color: "#16a34a" }} />,
  },
  [InspectionStatus.PENDING_APPROVAL]: {
    label: "Pend. Aprobación",
    color: "#d97706",
    icon: <HourglassEmpty sx={{ fontSize: 14, color: "#d97706" }} />,
  },
  [InspectionStatus.APPROVED]: {
    label: "Aprobada",
    color: "#2563eb",
    icon: <CheckCircle sx={{ fontSize: 14, color: "#2563eb" }} />,
  },
  [InspectionStatus.REJECTED]: {
    label: "Rechazada",
    color: "#dc2626",
    icon: <Cancel sx={{ fontSize: 14, color: "#dc2626" }} />,
  },
  [InspectionStatus.DRAFT]: {
    label: "Borrador",
    color: "#6b7280",
    icon: <Circle sx={{ fontSize: 14, color: "#6b7280" }} />,
  },
  [InspectionStatus.IN_PROGRESS]: {
    label: "En Progreso",
    color: "#7c3aed",
    icon: <HourglassEmpty sx={{ fontSize: 14, color: "#7c3aed" }} />,
  },
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDay(inspections: InspectionResponse[]): DayGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = new Map<string, InspectionResponse[]>();

  inspections.forEach((insp) => {
    const date = new Date(insp.submittedAt);
    date.setHours(0, 0, 0, 0);

    let label: string;
    if (date.getTime() === today.getTime()) {
      label = "Hoy";
    } else if (date.getTime() === yesterday.getTime()) {
      label = "Ayer";
    } else if (date >= weekAgo) {
      label = date.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "short" });
    } else {
      label = date.toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
    }

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(insp);
  });

  return Array.from(groups.entries()).map(([label, inspections]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    inspections,
  }));
}

interface KpiData {
  total: number;
  thisMonth: number;
  pending: number;
  rejected: number;
}

function buildKpis(inspections: InspectionResponse[]): KpiData {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    total: inspections.length,
    thisMonth: inspections.filter((i) => new Date(i.submittedAt) >= startOfMonth).length,
    pending: inspections.filter((i) => i.status === InspectionStatus.PENDING_APPROVAL || i.status === InspectionStatus.IN_PROGRESS).length,
    rejected: inspections.filter((i) => i.status === InspectionStatus.REJECTED).length,
  };
}

function KpiCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 90,
        p: 2,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: color + "30",
        bgcolor: color + "08",
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontSize: "28px", fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "11px", color: "text.secondary", mt: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
    </Paper>
  );
}

export function MyInspectionsList({ username, area }: MyInspectionsListProps) {
  const router = useRouter();
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInspections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInspectionsHerraEquipos({ submittedBy: username });
      if (result.success && result.data) {
        // Sort newest first
        const sorted = [...result.data].sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setInspections(sorted);
      } else {
        setError("No se pudo cargar el historial.");
      }
    } catch {
      setError("Error al cargar las inspecciones.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  if (loading) {
    return (
      <Box>
        {/* KPI Skeletons */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ flex: 1, minWidth: 90, borderRadius: 2.5 }} />
          ))}
        </Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={52} sx={{ mb: 1, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  }

  const kpis = buildKpis(inspections);
  const groups = groupByDay(inspections);

  return (
    <Box>
      {/* KPI Row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <KpiCard value={kpis.total} label="Total" color="#6366f1" />
        <KpiCard value={kpis.thisMonth} label="Este mes" color="#2563eb" />
        <KpiCard value={kpis.pending} label="Pendientes" color="#d97706" />
        <KpiCard value={kpis.rejected} label="Rechazadas" color="#dc2626" />
      </Box>

      {/* Area badge */}
      {area && (
        <Typography sx={{ fontSize: "12px", color: "text.secondary", mb: 2 }}>
          Área:{" "}
          <span style={{ fontWeight: 700, color: "#6366f1" }}>{area}</span>
        </Typography>
      )}

      {/* Groups */}
      {groups.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            bgcolor: "rgba(99,102,241,0.03)",
            borderRadius: 3,
            border: "1px dashed rgba(99,102,241,0.2)",
          }}
        >
          <Assignment sx={{ fontSize: 48, color: "#c7d2fe", mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            No has realizado inspecciones aún.
          </Typography>
        </Box>
      ) : (
        groups.map((group) => (
          <Box key={group.label} sx={{ mb: 3 }}>
            {/* Day header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1e3e66",
                  whiteSpace: "nowrap",
                }}
              >
                {group.label}
              </Typography>
              <Chip
                label={`${group.inspections.length} inspección${group.inspections.length !== 1 ? "es" : ""}`}
                size="small"
                sx={{ fontSize: "10px", height: 18, bgcolor: "rgba(30,62,102,0.06)", color: "#1e3e66", fontWeight: 600 }}
              />
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* Inspection rows */}
            {group.inspections.map((insp) => {
              const statusCfg = STATUS_CONFIG[insp.status] || STATUS_CONFIG[InspectionStatus.DRAFT];
              return (
                <Paper
                  key={insp._id}
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 1.2,
                    mb: 0.8,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.06)",
                    bgcolor: "background.paper",
                    gap: 1.5,
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
                  }}
                  onClick={() =>
                    router.push(
                      `/dashboard/form-herra-equipos/${insp.templateCode}?id=${insp._id}&mode=view`
                    )
                  }
                >
                  <Box sx={{ flexShrink: 0 }}>{statusCfg.icon}</Box>

                  {/* Name */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "text.primary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {insp.templateName || insp.templateCode}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", color: "text.disabled", fontFamily: "monospace" }}>
                      {insp.templateCode}
                    </Typography>
                  </Box>

                  {/* Time */}
                  <Typography sx={{ fontSize: "11px", color: "text.secondary", fontWeight: 600, flexShrink: 0 }}>
                    {formatTime(insp.submittedAt)}
                  </Typography>

                  {/* Status chip */}
                  <Chip
                    label={statusCfg.label}
                    size="small"
                    sx={{
                      fontSize: "10px",
                      height: 20,
                      bgcolor: statusCfg.color + "18",
                      color: statusCfg.color,
                      fontWeight: 700,
                      border: "1px solid " + statusCfg.color + "30",
                      flexShrink: 0,
                    }}
                  />

                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/dashboard/form-herra-equipos/${insp.templateCode}?id=${insp._id}&mode=view`
                      );
                    }}
                    sx={{
                      minWidth: 0,
                      p: 0.5,
                      color: "#6366f1",
                      "&:hover": { bgcolor: "rgba(99,102,241,0.08)" },
                    }}
                  >
                    <OpenInNew sx={{ fontSize: 16 }} />
                  </Button>
                </Paper>
              );
            })}
          </Box>
        ))
      )}
    </Box>
  );
}
