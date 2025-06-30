import {
  Grid,
  TextField,
  Box,
  Typography,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { type Control, Controller, type FieldErrors } from "react-hook-form";
import type { FormularioInspeccion } from "../../types/formTypes";
import { useState } from "react";
import { buscarTrabajadores } from "@/app/actions/inspeccion";
import { MESES } from "@/lib/constants";
// Array de superintendencias
const SUPERINTENDENCIAS = [
  "Superintendencia de Mantenimiento - Eléctrico e Instrumentación Planta",
  "Superintendencia de Mantenimiento - Ingeniería de Confiabilidad",
  "Superintendencia de Mantenimiento - Mec. Plta. Chancado, Molienda y Lubricación",
  "Superintendencia de Mantenimiento - Mec. Plta. Flot., Filtros, Taller Gral. y RH",
  "Superintendencia de Mantenimiento - Planificación",
];

// Array de áreas (ejemplo con 100 áreas)
const AREAS = [
  "Chancado",
  "Confiabilidad",
  "Electrico",
  "Filtros",
  "Flotacion",
  "Generacion",
  "Instrumentacion",
  "Lubricacion",
  "Maq Herramientas",
  "Molienda",
  "Planificacion",
  "Recursos Hidricos",
  "Superintendencia",
  "Taller Soldadura",
  // ... (agrega más áreas hasta 100)
];
const inputProps = {
  readOnly: true
}

// Función para obtener el mes actual
const getMesActual = (): string => {
  // Para testing, puedes hardcodear un mes específico
  //return "AGOSTO"; // Fuerza julio
  
  // Para producción, usar el mes real
  const fechaActual = new Date();
  const mesIndex = fechaActual.getMonth(); // 0-11
  return MESES[mesIndex];
};

const PERIODOS = ["ENERO-JUNIO", "JULIO-DICIEMBRE"];

// Función para obtener el período actual
const getPeriodoActual = (): string => {
  const mesActual = getMesActual();
  const mesesPrimerSemestre = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO"];
  
  return mesesPrimerSemestre.includes(mesActual) ? PERIODOS[0] : PERIODOS[1];
};
// Función para obtener el año actual
const getAñoActual = (): number => {
  return new Date().getFullYear();
};

interface InformacionGeneralProps {
  control: Control<FormularioInspeccion>;
  errors: FieldErrors<FormularioInspeccion>;
  soloLectura?: boolean;
}

const InformacionGeneral = ({ control, errors, soloLectura }: InformacionGeneralProps) => {
  const mesActual = getMesActual(); // Calcula el mes actual
  const periodoActual = getPeriodoActual(); // Calcula el período actual
  const añoActual = getAñoActual(); // Calcula el año actual
  
  const [opciones, setOpciones] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  

  // Función para buscar opciones (reutiliza buscarTrabajadores)
  const buscarOpciones = async (query: string): Promise<void> => {
    if (query.length < 3) {
      setOpciones([]); // Limpiar el estado si la consulta tiene menos de 3 caracteres
      return;
    }
    setLoading(true);
    try {
      const response = await buscarTrabajadores(query); // Reutiliza la función existente
      setOpciones(response.map((item: { nomina: string }) => item.nomina)); // Extrae los nombres de los trabajadores
    } catch (error) {
      console.error("Error al buscar opciones:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Información General {soloLectura && "(Solo lectura)"}
      </Typography>
      <Grid container spacing={2}>
        {/* Campo Superintendencia */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="superintendencia"
            control={control}
            rules={{ required: !soloLectura && "Este campo es obligatorio" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.superintendencia}>
                {soloLectura ? (
                  <TextField
                    label="Superintendencia"
                    value={field.value || ""}
                    slotProps= {{
                      input: inputProps
                    }}
                    variant="filled"
                  />
                ) : (
                  <Autocomplete
                    {...field}
                    options={SUPERINTENDENCIAS}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        id="superintendencia"
                        label="Seleccionar Superintendencia"
                        error={!!errors.superintendencia}
                        helperText={errors.superintendencia?.message}
                      />
                    )}
                    onChange={(_, data) => field.onChange(data)} // Actualiza el valor del campo
                  />
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Campo Área */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="area"
            control={control}
            rules={{ required: !soloLectura && "Este campo es obligatorio" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.area}>
                {soloLectura ? (
                  <TextField
                    label="Área"
                    value={field.value || ""}
                    slotProps= {{
                      input: inputProps
                    }}
                    variant="filled"
                  />
                ) : (
                  <Autocomplete
                    {...field}
                    options={AREAS}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        id="area"
                        label="Seleccionar Área"
                        error={!!errors.area}
                        helperText={errors.area?.message}
                      />
                    )}
                    onChange={(_, data) => field.onChange(data)} // Actualiza el valor del campo
                  />
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Campo TAG */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="tag"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="TAG" 
                fullWidth 
 //               InputProps={{ readOnly: soloLectura }}
                slotProps= {{
                      input: inputProps
                    }}
                variant={soloLectura ? "filled" : "outlined"}
              />
            )}
          />
        </Grid>

        {/* Campo Edificio */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="edificio"
            control={control}
            rules={{ required: !soloLectura && "Este campo es obligatorio" }}
            render={({ field }) => (
              <TextField
                {...field}
                id="edificio"
                label="Edificio"
                fullWidth
                error={!soloLectura && !!errors.edificio}
                helperText={!soloLectura && errors.edificio?.message}
                InputProps={{ readOnly: soloLectura }}
                variant={soloLectura ? "filled" : "outlined"}
              />
            )}
          />
        </Grid>

        {/* Campo Responsable del Edificio */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="responsableEdificio"
            control={control}
            rules={{ required: !soloLectura && "Este campo es obligatorio" }}
            render={({ field }) => (
              soloLectura ? (
                <TextField
                  label="Responsable del Edificio"
                  value={field.value || ""}
                  fullWidth
                  slotProps= {{
                      input: inputProps
                    }}
                  variant="filled"
                />
              ) : (
                <Autocomplete
                  options={opciones}
                  onInputChange={(_, value) => buscarOpciones(value)} // Busca responsables
                  onBlur={() => setOpciones([])} // Limpia el estado cuando el campo pierde el foco
                  loading={loading} // Muestra un indicador de carga
                  onChange={(_, data) => field.onChange(data)} // Actualiza el valor del campo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id="responsable"
                      label="Buscar Responsable del Edificio"
                      fullWidth
                      error={!!errors.responsableEdificio}
                      helperText={errors.responsableEdificio?.message}
                    />
                  )}
                  value={field.value || null}
                />
              )
            )}
          />
        </Grid>

        {/* Mes Actual (Estático) */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <Typography variant="subtitle1">
              Mes: <strong>{mesActual}</strong>
            </Typography>
          </Box>
        </Grid>

        {/* Período Actual (Estático) */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <Typography variant="subtitle1">
              Período: <strong>{periodoActual}</strong>
            </Typography>
          </Box>
        </Grid>

        {/* Año Actual (Estático) */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <Typography variant="subtitle1">
              Año: <strong>{añoActual}</strong>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InformacionGeneral;