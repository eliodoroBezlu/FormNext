"use client";

import { useRef, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  TextField,
  Autocomplete,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import type {
  FormularioInspeccion,
  Mes,
  Trabajador,
} from "../../types/formTypes"; // Importa el tipo Trabajador
import type SignatureCanvas from "react-signature-canvas";
import DynamicSignatureCanvas from "../molecules/signature-canvas/SigantureCanvas";
import { inspeccionService } from "@/services/inspeccionService";

interface InformacionInspectorProps {
  control: Control<FormularioInspeccion>;
  currentMes: Mes;
  setValue: UseFormSetValue<FormularioInspeccion>;
  errors: FieldErrors<FormularioInspeccion>;
}

const InformacionInspector = ({
  control,
  currentMes,
  setValue,
  errors,
}: InformacionInspectorProps) => {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]); // Estado para almacenar los trabajadores

  // Función para buscar trabajadores en la API
  const buscarTrabajadores = async (query: string): Promise<void> => {
    if (query.length < 3) {
      setTrabajadores([]); // Limpiar el estado si la consulta tiene menos de 3 caracteres
      return;
    }
    setLoading(true);
    try {
      const response = await inspeccionService.buscarTrabajadores(query);
      setTrabajadores(response); // response debe ser de tipo Trabajador[]
    } catch (error) {
      console.error("Error al buscar trabajadores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar la firma del inspector
  const guardarFirma = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataURL = sigCanvasRef.current.toDataURL();
      setValue(`meses.${currentMes}.inspector.firma`, dataURL);
    }
  };

  // Limpiar la firma del inspector
  const limpiarFirma = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setValue(`meses.${currentMes}.inspector.firma`, null);
    }
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Información del Inspector</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          {/* Campo de búsqueda de trabajadores */}
          <Grid item xs={12}>
            <Controller
              name={`meses.${currentMes}.inspector.nombre`}
              control={control}
              rules={{ required: "El nombre del inspector es obligatorio" }}
              render={({ field }) => (
                <Autocomplete
                  options={trabajadores}
                  getOptionLabel={(option) => option.nomina || ""} // Proporciona un valor por defecto si nomina es undefined
                  onInputChange={(_, value) => buscarTrabajadores(value)} // Busca al escribir
                  onBlur={() => setTrabajadores([])} // Limpiar el estado cuando el campo pierde el foco
                  loading={loading} // Muestra un indicador de carga
                  onChange={(_, data) => {
                    // Actualiza el valor del campo con el nombre del trabajador
                    field.onChange(data?.nomina || "");
                    setValue(
                      `meses.${currentMes}.inspector.nombre`,
                      data?.nomina || ""
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar Inspector"
                      fullWidth
                      error={!!errors.meses?.[currentMes]?.inspector?.nombre}
                      helperText={
                        errors.meses?.[currentMes]?.inspector?.nombre?.message
                      }
                    />
                  )}
                />
              )}
            />
          </Grid>

          {/* Campo de firma del inspector */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Firma del Inspector
            </Typography>
            <DynamicSignatureCanvas
              ref={sigCanvasRef}
              onClear={limpiarFirma}
              heightPercentage={40}
              onSave={guardarFirma}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default InformacionInspector;
