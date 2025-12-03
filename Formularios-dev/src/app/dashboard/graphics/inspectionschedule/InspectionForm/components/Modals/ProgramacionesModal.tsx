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
import GestionProgramaciones from "../../../ManagementProgramming/GestionProgramaciones";

interface ProgramacionesModalProps {
  open: boolean;
  onClose: () => void;
  formularioSeleccionado: Formulario;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  programaciones: any[];
  onProgramacionesChange: () => void;
}

export const ProgramacionesModal = ({
  open,
  onClose,
  formularioSeleccionado,
  programaciones,
  onProgramacionesChange,
}: ProgramacionesModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            FORMULARIO DE {formularioSeleccionado?.nombreFormulario}
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