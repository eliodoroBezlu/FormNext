"use client";

import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LinkNext from "next/link";

interface FormBreadcrumbsProps {
  formName: string;
}

export function FormBreadcrumbs({ formName }: FormBreadcrumbsProps) {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: "text.secondary" }} />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link
        component={LinkNext}
        underline="hover"
        color="text.secondary"
        href="/dashboard"
        sx={{ display: "flex", alignItems: "center", fontSize: "0.875rem", fontWeight: 500 }}
      >
        Dashboard
      </Link>
      <Link
        component={LinkNext}
        underline="hover"
        color="text.secondary"
        href="/dashboard/form-herra-equipos"
        sx={{ display: "flex", alignItems: "center", fontSize: "0.875rem", fontWeight: 500 }}
      >
        Herramientas y Equipos
      </Link>
      <Typography
        color="text.primary"
        sx={{ display: "flex", alignItems: "center", fontSize: "0.875rem", fontWeight: 600 }}
      >
        {formName}
      </Typography>
    </Breadcrumbs>
  );
}
