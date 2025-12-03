import { Chip, Typography, Box, Tooltip } from "@mui/material";
import { CheckCircle, Error, Warning, Block } from "@mui/icons-material";
import { programacionUtils } from "../utils/programacion.utils";

interface EstadoSemestreProps {
  dueDate?: Date;
  completionDate?: Date;
  esPrimerSemestre?: boolean;
}

export const EstadoSemestre = ({ 
  dueDate, 
  completionDate, 
  esPrimerSemestre = true 
}: EstadoSemestreProps) => {
  
  const estado = programacionUtils.getEstadoSemestre(
    dueDate, 
    completionDate, 
    esPrimerSemestre
  );
  
  const fechaProgramadaFormateada = programacionUtils.formatearFecha(dueDate || null);

  const getIcono = () => {
    switch (estado.color) {
      case 'success': return <CheckCircle fontSize="small" />;
      case 'error': return <Error fontSize="small" />;
      case 'warning': return <Warning fontSize="small" />;
      default: return <Block fontSize="small" />;
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="body2" fontWeight="medium" gutterBottom>
        {fechaProgramadaFormateada}
      </Typography>
      
      <Tooltip title={estado.descripcion} arrow>
        <Chip
          icon={getIcono()}
          label={estado.texto}
          size="small"
          color={estado.color}
          variant="filled"
          sx={{ 
            fontWeight: 'bold',
            minWidth: 100
          }}
        />
      </Tooltip>

      {estado.fechaLimite && (
        <Typography variant="caption" component="div" >
          Límite: {estado.fechaLimite}
        </Typography>
      )}
    </Box>
  );
};