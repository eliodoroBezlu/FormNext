"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { PlayArrow, Schedule } from "@mui/icons-material";
import {
  getInProgressInspections,
  InProgressInspection,
} from "@/lib/actions/inspection-herra-equipos";

interface InProgressInspectionsListProps {
  filterByTemplateCode?: string;
  onActionSuccess?: (message: string) => void;
}

export function InProgressInspectionsList({
  filterByTemplateCode,
}: InProgressInspectionsListProps) {
  const router = useRouter();
  const [inspections, setInspections] = useState<InProgressInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getInProgressInspections(
          filterByTemplateCode
            ? { templateCode: filterByTemplateCode }
            : undefined,
        );
        if (!result.success) throw new Error(result.error);
        setInspections(result.data ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar inspecciones en progreso",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filterByTemplateCode]);

  const handleContinue = (inspection: InProgressInspection) => {
    router.push(
      `/dashboard/form-herra-equipos/${inspection.templateCode}/${inspection._id}`,
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (inspections.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="text.secondary">
          No hay inspecciones en progreso.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} p={2}>
      {inspections.map((inspection) => {
        const verif = inspection.verification ?? {};
        const location =
          (verif.ubicacion as string) ||
          (verif.area as string) ||
          (verif.location as string) ||
          "—";
        const updatedAt = inspection.updatedAt
          ? new Date(inspection.updatedAt).toLocaleDateString("es-CL")
          : "—";

        return (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={inspection._id}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Schedule color="warning" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight="bold">
                    {inspection.templateName || inspection.templateCode}
                  </Typography>
                  <Chip
                    label="En Progreso"
                    color="warning"
                    size="small"
                    sx={{ ml: "auto" }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Ubicación:</strong> {location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Última modificación:</strong> {updatedAt}
                </Typography>
                {inspection.submittedBy && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Inspector:</strong> {inspection.submittedBy}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<PlayArrow />}
                  fullWidth
                  onClick={() => handleContinue(inspection)}
                >
                  Continuar Inspección
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
