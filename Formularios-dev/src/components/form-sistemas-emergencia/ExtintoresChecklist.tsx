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
  tag: string;
  extintores: ExtintorBackend[];
  onExtintoresSeleccionados: (extintores: ExtintorBackend[]) => void;
}

// Interfaz para el estado de los extintores seleccionados
interface ExtintoresSeleccionadosState {
  [key: string]: boolean;
}

const TAGS_CON_SELECCION_EXTINTORES = [
  "710BL723-E1", 
  "710BL723-E2",
  "710BL723-E3",
  "710BL723-E4", 
  "710BL723-E5", 
  "710BL723-E6", 
  "710BL723-E7", 
  "710BL723-E8", 
  "710BL723-E9",
  "780BL001",
  "710BL740-OM1",
  "710BL740-OM2", 
  "Generacion",
  "Electrico"
];


// Función para mostrar los extintores con checkbox
const ExtintoresChecklist = ({ 
  tag, 
  extintores, 
  onExtintoresSeleccionados 
}:ExtintoresChecklistProps) => {
  const [extintoresSeleccionados, setExtintoresSeleccionados] = useState<ExtintoresSeleccionadosState>({});

  const requiereSeleccion = TAGS_CON_SELECCION_EXTINTORES.includes(tag);

  // Inicializar el estado cuando cambian los extintores
  useEffect(() => {
    // Si el tag no requiere selección, limpiar la selección
    if (!requiereSeleccion) {
      setExtintoresSeleccionados({});
      // Solo llamar a esto cuando realmente cambie el tag o el requisito de selección
      onExtintoresSeleccionados([]);
      return;
    }
    
    // Crear un objeto con todos los extintores establecidos como no seleccionados
    const initialState: ExtintoresSeleccionadosState = {};
    extintores.forEach((extintor: ExtintorBackend) => {
      initialState[extintor._id] = false;
    });
    setExtintoresSeleccionados(initialState);
  }, [extintores, tag, requiereSeleccion]); // Remove onExtintoresSeleccionados from here

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
      {tag ? (
        extintores.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Extintores en {tag}:
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