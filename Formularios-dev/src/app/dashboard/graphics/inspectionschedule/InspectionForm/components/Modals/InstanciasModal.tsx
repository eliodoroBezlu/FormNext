import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Instancia, Formulario } from "../../types/Iprops";
import { ModalInstanciaItem } from "../ListItems/ModalInstanciaItem";

interface InstanciasModalProps {
  open: boolean;
  onClose: () => void;
  instancias: Instancia[];
  nombreFormulario: string;
  formularioSeleccionado: Formulario;
  onProgramarClick: (formulario: Formulario, instancia: Instancia) => void;
}

export const InstanciasModal = ({
  open,
  onClose,
  instancias,
  nombreFormulario,
  formularioSeleccionado,
  onProgramarClick,
}: InstanciasModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            FORMULARIOS DE {nombreFormulario}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" component="div" color="text.secondary" sx={{ mb: 2 }}>
          Total: {instancias.length} vez llenado por:
        </Typography>

        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {instancias.map((instancia) => (
            <ModalInstanciaItem
              key={instancia._id}
              instancia={instancia}
              formulario={formularioSeleccionado}
              onProgramarClick={onProgramarClick}
            />
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};