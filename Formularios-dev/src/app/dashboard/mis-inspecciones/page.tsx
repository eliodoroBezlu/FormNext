"use client";

import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Assignment } from "@mui/icons-material";
import { useUserRole } from "@/hooks/useUserRole";
import { MisInspeccionesView } from "@/components/features/dashboard/presentation/components/MisInspeccionesView";

export default function MisInspeccionesPage() {
  const { user, isLoading } = useUserRole();

  if (isLoading || !user) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      {/* Header */}
      <Box sx={{ mb: "4px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "6px" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Assignment sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "-.02em",
                margin: 0,
                color: "text.primary",
              }}
            >
              Mis Inspecciones
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
              {user.fullName || user.username}
              {user.area && (
                <span style={{ color: "#6366f1", fontWeight: 600 }}> · {user.area}</span>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* List */}
      <MisInspeccionesView username={user.username} area={user.area} />
    </Box>
  );
}
