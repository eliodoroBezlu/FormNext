import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ProgramacionFormData } from "../types/IProps";
import { Dayjs } from "dayjs";

interface ProgramacionFormProps {
  open: boolean;
  editando: boolean;
  formData: ProgramacionFormData;
  areasDisponibles: string[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (data: ProgramacionFormData) => void;
}

export const ProgramacionForm = ({
  open,
  editando,
  formData,
  areasDisponibles,
  loading,
  error,
  onClose,
  onSave,
  onFormDataChange,
}: ProgramacionFormProps) => {
  const handleAreaChange = (area: string) => {
    onFormDataChange({ ...formData, area });
  };

  const handleFirstSemesterChange = (newValue: Dayjs | null) => {
  onFormDataChange({ 
    ...formData, 
    firstSemesterDueDate: newValue 
  });
};

  const handleSecondSemesterChange = (date: Dayjs | null ) => {
    // Convertir cualquier tipo de fecha a Date
    // const jsDate = date ? new Date(date as any) : null;
    // onFormDataChange({ ...formData, secondSemesterDueDate: jsDate });
    onFormDataChange({ 
      ...formData, 
      secondSemesterDueDate: date 
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editando ? "Editar Programación" : "Nueva Programación"}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{xs:12}}>
            <FormControl fullWidth size="small">
              <InputLabel>Área</InputLabel>
              <Select
                value={formData.area}
                label="Área"
                onChange={(e) => handleAreaChange(e.target.value)}
              >
                {areasDisponibles.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
                <MenuItem value="">
                  <em>Nueva área...</em>
                </MenuItem>
              </Select>
            </FormControl>
            {!areasDisponibles.includes(formData.area) && formData.area && (
              <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                Se creará una nueva área: &quot;{formData.area}&quot;
              </Typography>
            )}
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <DatePicker
              label="Primer Semestre"
              value={formData.firstSemesterDueDate}
              onChange={handleFirstSemesterChange}
              slotProps={{ 
                textField: { 
                  size: "small", 
                  fullWidth: true,
                  helperText: "Ene-Jun"
                } 
              }}
            />
          </Grid>

          <Grid size={{xs:12, sm:6}}>
            <DatePicker
              label="Segundo Semestre"
              value={formData.secondSemesterDueDate}
              onChange={handleSecondSemesterChange}
              slotProps={{ 
                textField: { 
                  size: "small", 
                  fullWidth: true,
                  helperText: "Jul-Dic"
                } 
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={onSave} 
          variant="contained" 
          disabled={loading || !formData.area}
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};