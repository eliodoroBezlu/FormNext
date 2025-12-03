import { ListItem, Box, Typography, Chip } from "@mui/material";
import { Instancia, Formulario } from "../../types/Iprops";
import {
  obtenerArea,
  formatearFecha,
  obtenerFechaInspeccion,
} from "../../utils/InspectionForm.utils";

interface ModalInstanciaItemProps {
  instancia: Instancia;
  formulario: Formulario;
  onProgramarClick: (formulario: Formulario, instancia: Instancia) => void;
}

export const ModalInstanciaItem = ({ instancia }: ModalInstanciaItemProps) => {
  const area = obtenerArea(instancia);
  const fecha = formatearFecha(obtenerFechaInspeccion(instancia));

  return (
    <ListItem divider sx={{ px: 2, py: 1.5 }}>
      <Box sx={{ width: "100%" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle2" component="div" fontWeight="500">
            {area}
          </Typography>
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
            variant="outlined"
          />
        </Box>
      </Box>
    </ListItem>
  );
};
