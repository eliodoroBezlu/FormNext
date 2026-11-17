"use client";

import { Box, LinearProgress, Paper, Skeleton, Typography, useMediaQuery } from "@mui/material";
import { PlanDeAccion } from "../../domain/models/IProps";
import { PlanCard } from "./PlanCard";

interface PlanCardListProps {
  planes: PlanDeAccion[];
  isLoading: boolean;
  onView: (plan: PlanDeAccion) => void;
  onDelete: (planId: string) => void;
}

/** Una tarjeta vacía con la forma de `PlanCard`, mientras llegan los planes. */
function TarjetaEsqueleto({ animacion }: { animacion: "wave" | false }) {
  return (
    <Box
      aria-hidden
      sx={{
        bgcolor: "background.paper",
        borderLeft: "4px solid",
        borderLeftColor: "divider",
        borderRadius: 3,
        boxShadow: 1,
        px: 2.75,
        py: 2.25,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.25 }}>
        <Skeleton animation={animacion} width={80} height={20} />
        <Skeleton animation={animacion} width={70} height={22} />
        <Skeleton animation={animacion} variant="rounded" width={150} height={24} />
        <Skeleton animation={animacion} variant="rounded" width={90} height={24} />
        <Skeleton animation={animacion} variant="rounded" width={64} height={36} sx={{ ml: "auto" }} />
      </Box>
      <Skeleton animation={animacion} width="70%" height={18} />
      <Skeleton animation={animacion} width="35%" height={18} sx={{ mb: 1.5 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, maxWidth: 420 }}>
        <Skeleton animation={animacion} variant="rounded" height={7} sx={{ flex: 1 }} />
        <Skeleton animation={animacion} width={160} height={18} />
      </Box>
    </Box>
  );
}

export function PlanCardList({
  planes,
  isLoading,
  onView,
  onDelete,
}: PlanCardListProps) {
  const sinMovimiento = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Primera carga: la forma de lo que viene, en vez de un círculo girando.
  if (isLoading && planes.length === 0) {
    return (
      <Box
        role="status"
        aria-label="Cargando planes"
        sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}
      >
        {[0, 1, 2].map((i) => (
          <TarjetaEsqueleto key={i} animacion={sinMovimiento ? false : "wave"} />
        ))}
      </Box>
    );
  }

  if (planes.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          bgcolor: "action.hover",
          border: "2px dashed",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No hay planes en esta categoría
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pruebe con otra pestaña o cambie los filtros.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
      {/* Una acción en curso no borra la lista: solo una barra fina arriba. */}
      <LinearProgress
        aria-label="Actualizando"
        sx={{ height: 3, borderRadius: 2, visibility: isLoading ? "visible" : "hidden" }}
      />
      {planes.map((plan) => (
        <PlanCard
          key={plan._id}
          plan={plan}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}
