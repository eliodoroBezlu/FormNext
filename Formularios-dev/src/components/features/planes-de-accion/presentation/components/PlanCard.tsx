"use client";

import { Box, Typography, Chip, IconButton, Button } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { PlanDeAccion } from "../../domain/models/IProps";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/lib/routePermissions";

interface PlanCardProps {
  plan: PlanDeAccion;
  onView: (plan: PlanDeAccion) => void;
  onEdit: (plan: PlanDeAccion) => void;
  onDelete: (id: string) => void;
}

type EstadoVisual = "abierto" | "en-progreso" | "cerrado" | "aprobado";

const ESTADO_STYLE: Record<
  EstadoVisual,
  { border: string; bg: string; fg: string; label: string }
> = {
  abierto: {
    border: "#3B82F6",
    bg: "rgba(59,130,246,.15)",
    fg: "#2563EB",
    label: "Abierto",
  },
  "en-progreso": {
    border: "#F59E0B",
    bg: "rgba(245,158,11,.15)",
    fg: "#D97706",
    label: "En Progreso",
  },
  cerrado: {
    border: "#10B981",
    bg: "rgba(16,185,129,.15)",
    fg: "#059669",
    label: "Cerrado",
  },
  aprobado: {
    border: "#8B5CF6",
    bg: "rgba(139,92,246,.15)",
    fg: "#7C3AED",
    label: "Aprobado",
  },
};

export function PlanCard({ plan, onView, onEdit, onDelete }: PlanCardProps) {
  const { hasRole } = useUserRole();
  const isAdmin = hasRole(Role.ADMIN);

  const estaAprobado =
    plan.tareas.length > 0 && plan.tareas.every((t) => t.aprobado === true);
  const estadoVisual: EstadoVisual = estaAprobado ? "aprobado" : plan.estado;
  const style = ESTADO_STYLE[estadoVisual];

  const shortId = `PA-${plan._id.slice(-6).toUpperCase()}`;
  const fecha = new Date(plan.fechaCreacion).toLocaleDateString("es-ES");
  const pct = Math.min(plan.porcentajeCierre, 100);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderLeft: `4px solid ${style.border}`,
        borderRadius: 3,
        boxShadow: 1,
        px: 2.75,
        py: 2.25,
        transition: "all .18s",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              mb: 0.75,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "primary.main",
                fontFamily: "monospace",
              }}
            >
              {shortId}
            </Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
              {plan.areaFisica}
            </Typography>
            <Chip
              label={style.label}
              size="small"
              sx={{
                height: 24,
                fontSize: 12,
                fontWeight: 600,
                color: style.fg,
                bgcolor: style.bg,
              }}
            />
            <Chip
              label={
                plan.estadoAprobacion === "aprobado"
                  ? "Aprobado por Superintendente"
                  : "Pendiente Superintendente"
              }
              size="small"
              color={plan.estadoAprobacion === "aprobado" ? "success" : "warning"}
              variant="outlined"
              sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2.25,
              fontSize: 13,
              color: "text.secondary",
              mb: 1.5,
              flexWrap: "wrap",
            }}
          >
            <span>{plan.vicepresidencia}</span>
            <Box component="span" sx={{ color: "text.disabled" }}>
              |
            </Box>
            <span>{plan.superintendenciaSenior}</span>
            <Box component="span" sx={{ color: "text.disabled" }}>
              |
            </Box>
            <span>{plan.superintendencia}</span>
            <Box component="span" sx={{ color: "text.disabled" }}>
              · {fecha}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              maxWidth: 420,
            }}
          >
            <Box
              sx={{
                flex: 1,
                height: 7,
                borderRadius: 6,
                bgcolor: "#F1F5F9",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 6,
                  bgcolor: style.border,
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              {plan.totalTareas} tareas · {plan.tareasCerradas} completadas ·{" "}
              {plan.porcentajeCierre}% avance
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onView(plan)}
            sx={{ height: 36, px: 2, fontSize: 13 }}
          >
            Ver
          </Button>
          {isAdmin && (
            <>
              <IconButton
                title="Editar plan"
                onClick={() => onEdit(plan)}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "9px",
                  bgcolor: "rgba(99,102,241,.12)",
                  color: "primary.main",
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                title="Eliminar plan"
                onClick={() => onDelete(plan._id)}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "9px",
                  bgcolor: "rgba(239,68,68,.12)",
                  color: "#EF4444",
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
