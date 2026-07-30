"use client";

import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Notifications,
  NotificationsNone,
  CheckCircleOutline,
} from "@mui/icons-material";
import { useNotificationBell } from "../../application/hooks/useNotificationBell";
import { InspectionEventCard } from "./InspectionEventCard";

export function NotificationBell() {
  // ✅ TODOS los hooks PRIMERO — nunca después de un return condicional
  const { user, isSupervisorLike, notifications, unreadCount, loading, openAndRefresh } =
    useNotificationBell();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // ✅ Early return DESPUÉS de todos los hooks
  if (!isSupervisorLike) return null;

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    openAndRefresh();
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        id="notification-bell-button"
        color="inherit"
        onClick={handleOpen}
        size="medium"
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} nuevas` : ""}`}
        sx={{ position: "relative" }}
      >
        <Badge
          badgeContent={unreadCount}
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: "#ef4444",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              animation: unreadCount > 0 ? "pulse-bell 1.5s ease-in-out infinite" : "none",
              "@keyframes pulse-bell": {
                "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(239,68,68,0.4)" },
                "50%": { transform: "scale(1.15)", boxShadow: "0 0 0 4px rgba(239,68,68,0)" },
              },
            },
          }}
        >
          {unreadCount > 0 ? (
            <Notifications sx={{ fontSize: 22 }} />
          ) : (
            <NotificationsNone sx={{ fontSize: 22 }} />
          )}
        </Badge>
      </IconButton>

      <Popover
        id="notification-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 380,
            maxWidth: "95vw",
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            border: "1px solid rgba(99,102,241,0.15)",
            overflow: "hidden",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Notifications sx={{ color: "#fff", fontSize: 20 }} />
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>
              Notificaciones
            </Typography>
          </Box>
          {user?.area && (
            <Typography
              sx={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.8)",
                bgcolor: "rgba(255,255,255,0.15)",
                px: 1.2,
                py: 0.3,
                borderRadius: 1,
                fontWeight: 600,
              }}
            >
              {user.area}
            </Typography>
          )}
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#6366f1" }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CheckCircleOutline sx={{ fontSize: 44, color: "#c7d2fe", mb: 1 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Todo al día
              </Typography>
              <Typography variant="caption" color="text.disabled">
                No hay actividad en las últimas 8 horas
              </Typography>
            </Box>
          ) : (
            notifications.map((insp) => (
              <InspectionEventCard
                key={insp._id}
                inspection={insp}
                showApproveButton
                compact={false}
              />
            ))
          )}
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "flex-end" }}>
          <Button
            href="/dashboard/form-herra-equipos/pending-approval"
            size="small"
            sx={{
              fontSize: "12px",
              textTransform: "none",
              color: "#6366f1",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(99,102,241,0.06)" },
            }}
          >
            Ver pendientes de aprobación →
          </Button>
        </Box>
      </Popover>
    </>
  );
}
