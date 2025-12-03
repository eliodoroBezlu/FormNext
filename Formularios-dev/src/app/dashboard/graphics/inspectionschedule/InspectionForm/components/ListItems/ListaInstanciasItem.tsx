import { ListItem, Box, Typography, Chip, Button } from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";
import { Instancia, Formulario } from "../../types/Iprops";
import {
  formatearFecha,
  obtenerFechaInspeccion,
} from "../../utils/InspectionForm.utils";

interface ListaInstanciasItemProps {
  instancia: Instancia | null;
  formulario: Formulario;
  onProgramarClick: (
    formulario: Formulario,
    instancia: Instancia | null,
    esSegundoSemestre: boolean,
    area?: string
  ) => void;
  esSegundoSemestre: boolean;
  area: string;
}

export const ListaInstanciasItem = ({
  instancia,
  formulario,
  onProgramarClick,
  esSegundoSemestre,
  area,
}: ListaInstanciasItemProps) => {
  const fecha = instancia
    ? formatearFecha(obtenerFechaInspeccion(instancia))
    : null;
  const semestre = esSegundoSemestre ? "Segundo Semestre" : "Primer Semestre";

  return (
    <ListItem
      sx={{
        width: "200px",
        height: "100px",
        px: 1,
        py: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Typography variant="caption" fontWeight="bold" component="div">
          {area}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          {semestre}
        </Typography>
      </Box>

      {instancia ? (
        <Box sx={{ width: "100%" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="caption" component="div">
              {fecha}
            </Typography>
            <Chip
              label={instancia.status}
              size="small"
              color={
                instancia.status === "completado"
                  ? "success"
                  : instancia.status === "aprobado"
                    ? "primary"
                    : "default"
              }
            />
          </Box>

          <Button
            size="small"
            variant="outlined"
            startIcon={<CalendarMonth />}
            onClick={() =>
              onProgramarClick(formulario, instancia, esSegundoSemestre)
            }
            sx={{ fontSize: "0.6rem" }}
            fullWidth
          >
            ya inspeccionado
          </Button>
        </Box>
      ) : (
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            Sin inspecciones
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<CalendarMonth />}
            onClick={() => onProgramarClick(formulario, null, esSegundoSemestre, area)}
            sx={{ fontSize: "0.6rem" }}
            fullWidth
          >
            inspeccionar
          </Button>
        </Box>
      )}
    </ListItem>
  );
};