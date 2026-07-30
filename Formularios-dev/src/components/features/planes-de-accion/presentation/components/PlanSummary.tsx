"use client";

import { Box, Typography } from "@mui/material";
import {
  FolderOutlined,
  RadioButtonUncheckedOutlined,
  AccessTimeOutlined,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import { PlanSummary as PlanSummaryType } from "../../domain/models/IProps";

interface PlanSummaryProps {
  summary: PlanSummaryType;
}

export function PlanSummary({ summary }: PlanSummaryProps) {
  const metrics = [
    {
      label: "Total Planes",
      value: summary.totalPlanes,
      color: "#6366F1",
      icon: FolderOutlined,
    },
    {
      label: "Abiertos",
      value: summary.planesAbiertos,
      color: "#3B82F6",
      icon: RadioButtonUncheckedOutlined,
    },
    {
      label: "En Progreso",
      value: summary.planesEnProgreso,
      color: "#F59E0B",
      icon: AccessTimeOutlined,
    },
    {
      label: "Cerrados",
      value: summary.planesCerrados,
      color: "#10B981",
      icon: CheckCircleOutlineOutlined,
    },
  ];

  const pctText = `${summary.porcentajeCierre.toFixed(1)}%`;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 2.5,
          mb: 1.75,
        }}
      >
        {metrics.map(({ label, value, color, icon: Icon }) => (
          <Box
            key={label}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 4,
              boxShadow: 1,
              p: 2.75,
              borderBottom: `3px solid ${color}`,
              background: `linear-gradient(135deg, ${color}14, #fff)`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}
              >
                {label}
              </Typography>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: `${color}14`,
                }}
              >
                <Icon sx={{ color, fontSize: 24 }} />
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: 30,
                fontWeight: 800,
                color: "text.primary",
                mt: 1,
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3.5,
          boxShadow: 1,
          px: 2.5,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}
          >
            Tasa de cierre
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>
            {pctText}
          </Typography>
        </Box>
        <Box
          sx={{
            height: 8,
            borderRadius: 6,
            bgcolor: "#F1F5F9",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${Math.min(summary.porcentajeCierre, 100)}%`,
              borderRadius: 6,
              background: "linear-gradient(90deg, #10B981, #34D399)",
              transition: "width .3s ease",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
