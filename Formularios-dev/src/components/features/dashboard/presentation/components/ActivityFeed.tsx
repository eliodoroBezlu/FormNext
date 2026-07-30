"use client";

import React from "react";
import {
  Box,
  Typography,
  Skeleton,
  Button,
  Alert,
} from "@mui/material";
import { AccessTime, OpenInNew } from "@mui/icons-material";
import Link from "next/link";
import { useActivityFeed } from "../../application/hooks/useActivityFeed";
import { InspectionEventCard } from "./InspectionEventCard";

export function ActivityFeed() {
  const { userRole, authLoading, loading, error, inspections, isSupervisorLike } = useActivityFeed();

  if (authLoading || loading) {
    return (
      <Box>
        <SectionHeader userRole={userRole} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 1, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <SectionHeader userRole={userRole} />
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (inspections.length === 0) {
    return (
      <Box>
        <SectionHeader userRole={userRole} />
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            bgcolor: "rgba(99,102,241,0.03)",
            borderRadius: 3,
            border: "1px dashed rgba(99,102,241,0.2)",
          }}
        >
          <AccessTime sx={{ fontSize: 40, color: "#c7d2fe", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No hay actividad reciente en las últimas {isSupervisorLike ? "8" : "24"} horas.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader userRole={userRole} />

      {inspections.map((insp) => (
        <InspectionEventCard
          key={insp._id}
          inspection={insp}
          showApproveButton={isSupervisorLike}
        />
      ))}

      {/* Link to full list */}
      <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
        <Button
          component={Link}
          href={isSupervisorLike ? "/dashboard/form-herra-equipos" : "/dashboard/mis-inspecciones"}
          endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
          sx={{
            fontSize: "12px",
            color: "#6366f1",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "rgba(99,102,241,0.06)" },
          }}
        >
          Ver todas las inspecciones
        </Button>
      </Box>
    </Box>
  );
}

function SectionHeader({ userRole }: { userRole: string | null }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, mt: 1 }}>
      <Box sx={{ width: "12px", height: "2.5px", bgcolor: "#6366f1" }} />
      <Typography
        variant="h3"
        sx={{
          fontSize: "22px",
          fontWeight: 700,
          color: "#1e3e66",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        Actividad Reciente
      </Typography>
      {userRole && (
        <Typography
          sx={{
            fontSize: "11px",
            color: "#6366f1",
            fontWeight: 600,
            bgcolor: "rgba(99,102,241,0.08)",
            px: 1,
            py: 0.3,
            borderRadius: 1,
          }}
        >
          {["supervisor", "admin", "superintendente"].includes(userRole)
            ? "Vista del área"
            : "Mis inspecciones"}
        </Typography>
      )}
      <Box sx={{ flex: 1, height: "1.5px", bgcolor: "rgba(30, 62, 102, 0.15)" }} />
    </Box>
  );
}
