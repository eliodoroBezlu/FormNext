"use client";

import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

export interface StepConfig {
  label: string;
}

interface FormStepperHeaderProps {
  activeStep: number; // 1 to 5
  steps: StepConfig[];
}

export function FormStepperHeader({ activeStep, steps }: FormStepperHeaderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: isDark ? "divider" : "grey.200",
        bgcolor: isDark ? "background.paper" : "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          width: "100%",
          overflowX: "auto",
          py: 1,
          gap: 2,
        }}
      >
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < activeStep;
          const isActive = stepNum === activeStep;

          // Colors based on state
          let circleBg = "transparent";
          let circleBorder = `2px solid ${isDark ? "#475569" : "#cbd5e1"}`;
          let circleColor = isDark ? "#94a3b8" : "#64748b";
          let labelColor = isDark ? "#94a3b8" : "#64748b";
          let labelWeight = 500;

          if (isCompleted) {
            circleBg = theme.palette.success.main;
            circleBorder = `2px solid ${theme.palette.success.main}`;
            circleColor = "#ffffff";
            labelColor = theme.palette.success.main;
            labelWeight = 600;
          } else if (isActive) {
            circleBg = theme.palette.primary.main;
            circleBorder = `2px solid ${theme.palette.primary.main}`;
            circleColor = "#ffffff";
            labelColor = theme.palette.primary.main;
            labelWeight = 700;
          }

          return (
            <React.Fragment key={idx}>
              {/* Connector line (except for first step) */}
              {idx > 0 && (
                <Box
                  sx={{
                    flexGrow: 1,
                    height: "2px",
                    minWidth: { xs: "20px", sm: "40px" },
                    bgcolor: idx < activeStep ? theme.palette.success.main : (isDark ? "#334155" : "#e2e8f0"),
                    transition: "background-color 0.3s ease",
                  }}
                />
              )}

              {/* Step circle + Label */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: { xs: "70px", sm: "120px" },
                  textAlign: "center",
                }}
              >
                {/* Circle */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: circleBg,
                    border: circleBorder,
                    color: circleColor,
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    mb: 1,
                    boxShadow: isActive ? `0 0 0 4px ${isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isCompleted ? (
                    <CheckIcon sx={{ fontSize: 18 }} />
                  ) : (
                    stepNum
                  )}
                </Box>

                {/* Label */}
                <Typography
                  variant="caption"
                  sx={{
                    color: labelColor,
                    fontWeight: labelWeight,
                    fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                    whiteSpace: "nowrap",
                    transition: "color 0.3s ease",
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            </React.Fragment>
          );
        })}
      </Box>
    </Paper>
  );
}
