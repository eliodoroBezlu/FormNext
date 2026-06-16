"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  CardActions,
} from "@mui/material";
import {
  Assignment,
  Science,
  Construction,
} from "@mui/icons-material";

import { getTemplatesHerraEquipos } from "@/lib/actions/template-herra-equipos";
import { getInProgressInspections } from "@/lib/actions/inspection-herra-equipos";
import { FormTemplateHerraEquipos } from "@/components/features/herra-equipos/types/IProps";

export default function NewInspectionTemplates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormTemplateHerraEquipos[]>([]);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SPECIAL_FORMS = ["ARN-001", "ESC-001", "EXT-001"];
  const SCAFFOLD_FORM = "1.02.P06.F30";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [templatesResult, inProgressResult] = await Promise.all([
          getTemplatesHerraEquipos(),
          getInProgressInspections({ templateCode: SCAFFOLD_FORM }),
        ]);

        if (!templatesResult.success) throw new Error(templatesResult.error);

        setTemplates(
          templatesResult.data.map((t) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          }))
        );

        if (inProgressResult.success) {
          setInProgressCount(inProgressResult.data?.length || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar plantillas");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSelectTemplate = (template: FormTemplateHerraEquipos) => {
    router.push(`/dashboard/form-herra-equipos/${template.code}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
        <Typography ml={2}>Cargando formularios...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (templates.length === 0) {
    return (
      <Alert severity="info">
        No hay templates disponibles. Primero debes crear templates en la gestión de templates.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {templates.map((template) => {
        const isScaffold = template.code === SCAFFOLD_FORM;

        return (
          <Grid size={{ xs: 12, md: 4 }} key={template._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: SPECIAL_FORMS.includes(template.code)
                  ? "2px solid #1976d2"
                  : isScaffold
                    ? "2px solid #ed6c02"
                    : "none",
                position: "relative",
              }}
            >
              {isScaffold && inProgressCount > 0 && (
                <Chip
                  label={`${inProgressCount} en uso`}
                  color="warning"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1,
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  {SPECIAL_FORMS.includes(template.code) ? (
                    <Science color="primary" />
                  ) : isScaffold ? (
                    <Construction color="warning" />
                  ) : (
                    <Assignment />
                  )}
                  <Typography variant="h6">{template.name}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Código:</strong> {template.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Revisión:</strong> {template.revision}
                  </Typography>
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label={template.type === "interna" ? "Interna" : "Externa"}
                    size="small"
                    color={template.type === "interna" ? "primary" : "secondary"}
                  />
                  {SPECIAL_FORMS.includes(template.code) && (
                    <Chip
                      label="Especializado"
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                  {isScaffold && (
                    <Chip
                      label="Andamio"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    label={`${template.sections.length} secciones`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, flexDirection: "column", gap: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSelectTemplate(template)}
                  color={isScaffold ? "warning" : "primary"}
                >
                  Nueva Inspección
                </Button>

                {isScaffold && inProgressCount > 0 && (
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    color="warning"
                    onClick={() => router.push("/dashboard/form-herra-equipos/in-progress")}
                  >
                    Ver {inProgressCount} en uso
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
