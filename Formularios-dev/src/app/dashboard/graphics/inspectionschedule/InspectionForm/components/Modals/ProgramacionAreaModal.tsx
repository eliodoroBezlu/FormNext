import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Formulario } from "../../types/Iprops";
import { Programacion } from "../../../ManagementProgramming/types/IProps";
import GestionProgramaciones from "../../../ManagementProgramming/GestionProgramaciones";

interface ProgramacionAreaModalProps {
  open: boolean;
  onClose: () => void;
  formularioSeleccionado: Formulario;
  areaSeleccionada: string;
  programaciones: Programacion[];
  onProgramacionesChange: () => void;
}

export const ProgramacionAreaModal = ({
  open,
  onClose,
  formularioSeleccionado,
  areaSeleccionada,
  programaciones,
  onProgramacionesChange,
}: ProgramacionAreaModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            Programación para {areaSeleccionada} - {formularioSeleccionado?.nombreFormulario}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <GestionProgramaciones
          templateId={formularioSeleccionado?.formularioId}
          templateName={formularioSeleccionado?.nombreFormulario}
          año={formularioSeleccionado?.año}
          programaciones={programaciones}
          onProgramacionesChange={onProgramacionesChange}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};