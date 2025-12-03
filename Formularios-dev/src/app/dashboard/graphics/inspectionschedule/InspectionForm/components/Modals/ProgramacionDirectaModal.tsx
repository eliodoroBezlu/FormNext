import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Grid,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Close, CalendarMonth } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FormDataDirecta, Formulario, Instancia } from "../../types/Iprops";
import { Dayjs } from "dayjs";

interface ProgramacionDirectaModalProps {
  open: boolean;
  onClose: () => void;
  formularioSeleccionado: Formulario;
  areaSeleccionada: string;
  instanciaSeleccionada: Instancia | null;
  formData: FormDataDirecta | null;
  loading: boolean;
  error: string;
  onFormDataChange: (data: FormDataDirecta) => void;
  onGuardar: () => void;
  esSegundoSemestre?: boolean;
}

export const ProgramacionDirectaModal = ({
  open,
  onClose,
  formularioSeleccionado,
  areaSeleccionada,
  instanciaSeleccionada,
  formData,
  loading,
  error,
  onFormDataChange,
  onGuardar,
  esSegundoSemestre = false,
}: ProgramacionDirectaModalProps) => {
  const safeFormData = formData || {
    firstSemesterDueDate: null,
    secondSemesterDueDate: null,
  };

  const esProgramacionNueva = !instanciaSeleccionada;
  const semestreTexto = esSegundoSemestre
    ? "Segundo Semestre"
    : "Primer Semestre";

  // const handleFirstSemesterChange = (newValue: any) => {
  //   const date = newValue ? (newValue.toDate ? newValue.toDate() : newValue) : null;
  //   onFormDataChange({
  //     ...safeFormData,
  //     firstSemesterDueDate: date,
  //   });
  // };

  const handleFirstSemesterChange = (newValue: Dayjs | null) => {
  onFormDataChange({
    ...safeFormData,
    firstSemesterDueDate: newValue,
  });
};

  const handleSecondSemesterChange = (newValue: Dayjs | null ) => {
    //const date = newValue ? (newValue.toDate ? newValue.toDate() : newValue) : null;
    onFormDataChange({
      ...safeFormData,
      secondSemesterDueDate: newValue,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {esProgramacionNueva
              ? "Programar Inspección"
              : "Reprogramar Inspección"}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {formularioSeleccionado?.nombreFormulario}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Área: <strong>{areaSeleccionada || "No especificada"}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Año: <strong>{formularioSeleccionado?.año}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Semestre: <strong>{semestreTexto}</strong>
          </Typography>
          {instanciaSeleccionada ? (
            <Typography variant="body2" color="text.secondary">
              Instancia existente: Ya Inspeccionado
            </Typography>
          ) : (
            <Typography variant="body2" color="primary.main">
               <strong>Nueva Inspeccionado</strong>
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs:12, sm:6}}>
            <DatePicker
              label="Primer Semestre (Ene-Jun)"
              value={safeFormData.firstSemesterDueDate}
              onChange={handleFirstSemesterChange} 
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  helperText: "Entre Enero y Junio",
                },
              }}
            />
          </Grid>

          <Grid size={{ xs:12, sm:6}}>
            <DatePicker
              label="Segundo Semestre (Jul-Dic)"
              value={safeFormData.secondSemesterDueDate}
              onChange={handleSecondSemesterChange} 
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  helperText: "Entre Julio y Diciembre",
                },
              }}
            />
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          {" "}
          {esProgramacionNueva
            ? `Programando para ${semestreTexto}. Asigne al menos una fecha de programación.`
            : "Puede modificar las fechas de programación existentes."}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={onGuardar}
          variant="contained"
          color="secondary"
          disabled={loading}
          startIcon={<CalendarMonth />}
        >
          {loading
            ? "Guardando..."
            : esProgramacionNueva
              ? "Programar Inspección"
              : "Actualizar Programación"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};