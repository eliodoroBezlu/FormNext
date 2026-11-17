"use client";

import React from "react";
import { Box, Typography, Chip, Button, Paper } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { EditNote, OpenInNew, ThumbUp } from "@mui/icons-material";
import { EstadoChip } from "@/components/ui/feedback/EstadoChip";
import { estadoDeInspeccion } from "@/components/features/herra-equipos/domain/models/estadosVisuales";
import { ICONO_DE_ESTADO } from "@/components/features/herra-equipos/common/InspectionStatusChip";
import { useRouter } from "next/navigation";
import type { InspectionResponse } from "../../infrastructure/adapters/dashboardAdapter";
import { InspectionStatus } from "@/components/features/herra-equipos/types/IProps";

import { codigoInspeccionado } from "@/components/features/herra-equipos/types/IProps";
interface InspectionEventCardProps {
  inspection: InspectionResponse;
  showApproveButton?: boolean;
  compact?: boolean;
}

export function InspectionEventCard({
  inspection,
  showApproveButton = false,
  compact = false,
}: InspectionEventCardProps) {
  const router = useRouter();
  // Etiqueta y color de la misma tabla que el chip del formulario y el reporte.
  const estado = estadoDeInspeccion(inspection.status);
  const tono = estado.color === "default" ? "secondary" : estado.color;

  const handleView = () => {
    router.push(
      `/dashboard/form-herra-equipos/${inspection.templateCode}/${inspection._id}?mode=view&step=5`,
    );
  };

  const handleApprove = () => {
    router.push(
      `/dashboard/form-herra-equipos/${inspection.templateCode}/${inspection._id}?mode=approval`,
    );
  };

  // Qué equipo se inspeccionó. Es lo primero que se busca al mirar una
  // notificación: el formulario dice «de qué tipo», el código dice «cuál».
  const codigoEquipo = codigoInspeccionado(inspection);

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
        borderColor: "divider",
        bgcolor: (theme) => alpha(theme.palette[tono].main, 0.06),
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          boxShadow: 2,
          borderColor: (theme) => alpha(theme.palette[tono].main, 0.35),
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Left: Status icon + Info */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
            flex: 1,
            minWidth: 0,
          }}
        >
          <Box sx={{ mt: 0.3, flexShrink: 0, display: "flex", color: `${tono}.main`, "& svg": { fontSize: 15 } }}>
            {ICONO_DE_ESTADO[inspection.status] ?? <EditNote />}
          </Box>
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

            <Typography
              sx={{ fontSize: "11px", color: "text.secondary", mt: 0.3 }}
            >
              {inspectorName}
              {inspection.area && (
                <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
                  {" "}
                  · {inspection.area}
                </Box>
              )}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 0.8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <EstadoChip etiqueta={estado.etiqueta} color={estado.color} />
              {codigoEquipo && (
                <Chip
                  label={codigoEquipo}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "10px",
                    height: 20,
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "text.disabled",
                  fontFamily: "monospace",
                }}
              >
                {inspection.templateCode}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: Action buttons */}
        {!compact && (
          <Box sx={{ display: "flex", gap: 0.5, ml: 1, flexShrink: 0 }}>
            {showApproveButton &&
              inspection.status === InspectionStatus.PENDING_APPROVAL && (
                <Button
                  type="button"
                  size="small"
                  variant="contained"
                  startIcon={<ThumbUp sx={{ fontSize: 13 }} />}
                  onClick={handleApprove}
                  sx={{ fontSize: "11px", py: 0.5, px: 1.2, borderRadius: 1.5, fontWeight: 700, minWidth: 0 }}
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
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                fontWeight: 700,
                textTransform: "none",
                minWidth: 0,
                "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16) },
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
