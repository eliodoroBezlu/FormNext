import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { Programacion } from "../types/IProps";
import { EstadoSemestre } from "./EstadoSemestre";

interface ProgramacionTableProps {
  programaciones: Programacion[];
  onEditar: (programacion: Programacion) => void;
  onEliminar: (id: string) => void;
}

export const ProgramacionTable = ({
  programaciones,
  onEditar,
  onEliminar,
}: ProgramacionTableProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Grid container spacing={2}>
        {programaciones.map((programacion) => (
          <Grid size={{ xs: 12 }} key={programacion._id}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {programacion.area}
                  </Typography>
                  <Chip
                    label={programacion.status}
                    color={
                      programacion.status === "active" ? "success" : "default"
                    }
                    size="small"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Primer Semestre
                    </Typography>
                    <EstadoSemestre
                      dueDate={programacion.firstSemesterDueDate}
                      completionDate={programacion.firstSemesterCompletionDate}
                      esPrimerSemestre={true}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Segundo Semestre
                    </Typography>
                    <EstadoSemestre
                      dueDate={programacion.secondSemesterDueDate}
                      completionDate={programacion.secondSemesterCompletionDate}
                      esPrimerSemestre={false}
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onEditar(programacion)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEliminar(programacion._id!)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            <Grid
              container
              sx={{ borderBottom: 1, borderColor: "divider", py: 2, px: 3 }}
            >
              <Grid size={{ xs: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Área
                </Typography>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  Primer Semestre
                </Typography>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  Segundo Semestre
                </Typography>
              </Grid>
              <Grid size={{ xs: 2 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  Estado General
                </Typography>
              </Grid>
              <Grid size={{ xs: 2 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  align="center"
                >
                  Acciones
                </Typography>
              </Grid>
            </Grid>

            {programaciones.map((programacion) => (
              <Grid
                key={programacion._id}
                container
                sx={{
                  py: 2,
                  px: 3,
                  borderBottom: 1,
                  borderColor: "divider",
                  "&:last-child": { borderBottom: 0 },
                }}
                alignItems="center"
              >
                <Grid size={{ xs: 2 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {programacion.area}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Box display="flex" justifyContent="center">
                    <EstadoSemestre
                      dueDate={programacion.firstSemesterDueDate}
                      completionDate={programacion.firstSemesterCompletionDate}
                      esPrimerSemestre={true}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Box display="flex" justifyContent="center">
                    <EstadoSemestre
                      dueDate={programacion.secondSemesterDueDate}
                      completionDate={programacion.secondSemesterCompletionDate}
                      esPrimerSemestre={false}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 2 }}>
                  <Box display="flex" justifyContent="center">
                    <Chip
                      label={programacion.status}
                      color={
                        programacion.status === "active" ? "success" : "default"
                      }
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 2 }}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => onEditar(programacion)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEliminar(programacion._id!)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
