import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Divider
} from "@mui/material";
import { ExtintorBackend } from "../../types/formTypes";

// Definición de props para el componente
interface ExtintoresChecklistProps {
  area: string;
  extintores: ExtintorBackend[];
  onExtintoresSeleccionados: (extintores: ExtintorBackend[]) => void;
}

// Interfaz para el estado de los extintores seleccionados
interface ExtintoresSeleccionadosState {
  [key: string]: boolean;
}

const AREAS_CON_SELECCION_EXTINTORES = [
    "Electrico", 
    "Generacion", 
    // Añade aquí las áreas específicas donde quieras que se seleccionen extintores
  ];

// Función para mostrar los extintores con checkbox
const ExtintoresChecklist = ({ 
  area, 
  extintores, 
  onExtintoresSeleccionados 
}:ExtintoresChecklistProps) => {
  const [extintoresSeleccionados, setExtintoresSeleccionados] = useState<ExtintoresSeleccionadosState>({});

  const requiereSeleccion = AREAS_CON_SELECCION_EXTINTORES.includes(area);

  // Inicializar el estado cuando cambian los extintores
  useEffect(() => {
    // Si el área no requiere selección, limpiar la selección
    if (!requiereSeleccion) {
      setExtintoresSeleccionados({});
      // Solo llamar a esto cuando realmente cambie el área o el requisito de selección
      onExtintoresSeleccionados([]);
      return;
    }
    
    // Crear un objeto con todos los extintores establecidos como no seleccionados
    const initialState: ExtintoresSeleccionadosState = {};
    extintores.forEach((extintor: ExtintorBackend) => {
      initialState[extintor._id] = false;
    });
    setExtintoresSeleccionados(initialState);
  }, [extintores, area, requiereSeleccion]); // Remove onExtintoresSeleccionados from here

  // Manejar el cambio en la selección de un extintor
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, extintorId: string) => {
    const newSeleccionados = {
      ...extintoresSeleccionados,
      [extintorId]: event.target.checked
    };
    setExtintoresSeleccionados(newSeleccionados);
    
    // Enviar los extintores seleccionados al componente padre
    const seleccionados = extintores.filter(extintor => 
      newSeleccionados[extintor._id]
    );
    onExtintoresSeleccionados(seleccionados);
  };

  // Seleccionar todos los extintores
  const seleccionarTodos = () => {
    const newSeleccionados: ExtintoresSeleccionadosState = {};
    extintores.forEach((extintor: ExtintorBackend) => {
      newSeleccionados[extintor._id] = true;
    });
    setExtintoresSeleccionados(newSeleccionados);
    onExtintoresSeleccionados([...extintores]);
  };

  // Deseleccionar todos los extintores
  const deseleccionarTodos = () => {
    const newSeleccionados: ExtintoresSeleccionadosState = {};
    extintores.forEach((extintor: ExtintorBackend) => {
      newSeleccionados[extintor._id] = false;
    });
    setExtintoresSeleccionados(newSeleccionados);
    onExtintoresSeleccionados([]);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%', minHeight: '56px' }}>
      {area ? (
        extintores.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Extintores en {area}:
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={seleccionarTodos}
              >
                Seleccionar todos
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={deseleccionarTodos}
              >
                Deseleccionar todos
              </Button>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
              <FormGroup>
                {extintores.map((extintor: ExtintorBackend) => (
                  <FormControlLabel
                    key={extintor._id}
                    control={
                      <Checkbox
                        checked={!!extintoresSeleccionados[extintor._id]}
                        onChange={(e) => handleCheckboxChange(e, extintor._id)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {extintor.CodigoExtintor} - {extintor.Ubicacion}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay extintores registrados en esta área
          </Typography>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          Seleccione un área para ver los extintores
        </Typography>
      )}
    </Paper>
  );
};

export default ExtintoresChecklist;