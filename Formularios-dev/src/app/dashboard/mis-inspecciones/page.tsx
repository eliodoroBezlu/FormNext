"use client";

import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { superficieDeMarca } from "@/styles/marca";
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
              bgcolor: (theme) => superficieDeMarca(theme.palette.mode),
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
              Carpeta virtual de inspecciones
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
              {user.fullName || user.username}
              {user.area && (
                <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}> · {user.area}</Box>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* List */}
      <MisInspeccionesView
        usuario={{ username: user.username, nombre: user.fullName || user.username, area: user.area }}
        area={user.area}
      />
    </Box>
  );
}
