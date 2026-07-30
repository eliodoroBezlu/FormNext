"use client";

import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { PlanDeAccion } from "../../domain/models/IProps";
import { PlanCard } from "./PlanCard";

interface PlanCardListProps {
  planes: PlanDeAccion[];
  isLoading: boolean;
  onView: (plan: PlanDeAccion) => void;
  onEdit: (plan: PlanDeAccion) => void;
  onDelete: (planId: string) => void;
}

export function PlanCardList({
  planes,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: PlanCardListProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (planes.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          bgcolor: "#f9f9f9",
          border: "2px dashed #e0e0e0",
        }}
      >
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No hay planes en esta categoría
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crea un nuevo plan o genera uno desde una inspección
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
      {planes.map((plan) => (
        <PlanCard
          key={plan._id}
          plan={plan}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}
