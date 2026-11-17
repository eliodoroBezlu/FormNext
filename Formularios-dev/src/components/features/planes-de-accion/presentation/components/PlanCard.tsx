"use client";

import { Box, Typography, Chip, IconButton, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AssignmentOutlined, Delete, InfoOutlined } from "@mui/icons-material";
import { PlanDeAccion } from "../../domain/models/IProps";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/lib/routePermissions";
import { ItemsCriticos } from "./ItemsCriticos";
import { diaLegible, etiquetaDeTipo } from "../../domain/tipoInspeccion";
import { estadoDePlan } from "../../domain/estadosVisuales";
import { EstadoChip } from "@/components/ui/feedback/EstadoChip";

interface PlanCardProps {
  plan: PlanDeAccion;
  onView: (plan: PlanDeAccion) => void;
  onDelete: (id: string) => void;
}

export function PlanCard({ plan, onView, onDelete }: PlanCardProps) {
  const { hasRole } = useUserRole();
  const isAdmin = hasRole(Role.ADMIN);

  const estaAprobado =
    plan.tareas.length > 0 && plan.tareas.every((t) => t.aprobado === true);
  const estado = estadoDePlan(
    plan.sinObservaciones ? "sin-observaciones" : estaAprobado ? "aprobado" : plan.estado,
  );
  // El color del estado en el tema (gris de marca para «sin observaciones»).
  const colorDelEstado = estado.color === "default" ? "secondary.main" : `${estado.color}.main`;

  const shortId = `PA-${plan._id.slice(-6).toUpperCase()}`;
  const fecha = new Date(plan.fechaCreacion).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const fechaInspeccion = diaLegible(plan.fechaInspeccion);
  const pct = Math.min(plan.porcentajeCierre, 100);
  // De qué IRO o ISOP sale; un plan sin inspección se creó a mano.
  const origen = plan.tipoInspeccion
    ? etiquetaDeTipo(plan.tipoInspeccion.nombre)
    : plan.instanceId
      ? null
      : "Plan manual";

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderLeft: "4px solid",
        borderLeftColor: colorDelEstado,
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
            {origen && (
              <Chip
                icon={<AssignmentOutlined />}
                label={origen}
                title={plan.tipoInspeccion?.codigo}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: 12,
                  fontWeight: 600,
                  "& .MuiChip-icon": { fontSize: 15 },
                }}
              />
            )}
            <EstadoChip etiqueta={estado.etiqueta} color={estado.color} />
            {/* Sin tareas no hay nada que aprobar. */}
            {!plan.sinObservaciones && (
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
            )}
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
            {/* Las fechas en su propio renglón: la línea de arriba suele
                saltar de renglón y dejaba un «·» al inicio. */}
            <Box component="span" sx={{ flexBasis: "100%" }}>
              {fechaInspeccion && <>Inspección del {fechaInspeccion} · </>}
              Plan del {fecha}
            </Box>
          </Box>

          {plan.sinObservaciones ? (
            // El porqué de la pestaña «Sin observaciones».
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                color: "text.secondary",
              }}
            >
              <InfoOutlined fontSize="small" sx={{ mt: "1px" }} />
              <Typography sx={{ fontSize: 13 }}>
                {plan.motivoSinObservaciones ??
                  "La IRO se terminó sin observaciones que cumplan el criterio."}
              </Typography>
            </Box>
          ) : (
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
                bgcolor: "action.hover",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 6,
                  bgcolor: colorDelEstado,
                  // La barra se llena hasta su avance.
                  transition: "width 0.6s ease-out",
                  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
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
          )}

          {plan.instanceId && <ItemsCriticos texto={plan.itemsCriticos} />}
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
          {/* La cabecera del plan se edita desde su detalle («Ver»). */}
          {isAdmin && (
            <>
              <IconButton
                title="Eliminar plan"
                aria-label="Eliminar plan"
                onClick={() => onDelete(plan._id)}
                sx={(theme) => ({
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: "error.main",
                })}
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
