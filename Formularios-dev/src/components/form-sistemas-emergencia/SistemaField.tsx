import { Typography, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material"
import { type Control, Controller } from "react-hook-form"
import type { FormularioInspeccion, Mes, SistemaPath } from "../../types/formTypes"
import EstadoInspeccionSelect from "@/components/form-sistemas-emergencia/EstadoInspeccionSelect"
import Grid from "@mui/material/Grid";

interface SistemaFieldProps {
  name: string
  label: string
  control: Control<FormularioInspeccion>
  currentMes: Mes
  type: "pasivos" | "activos"
  disabled?: boolean; // 🔥 1. Agregamos la prop opcional
}

const cantidadOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const SistemaField = ({ 
  name, 
  label, 
  control, 
  currentMes, 
  type, 
  disabled = false // 🔥 2. Valor por defecto false
}: SistemaFieldProps) => {
  
  const basePath =
    type === "pasivos"
      ? `meses.${currentMes}.inspeccionesActivos.sistemasPasivos.${name}`
      : `meses.${currentMes}.inspeccionesActivos.sistemasActivos.${name}`

  return (
    <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}> {/* Added alignItems center for better alignment */}
      <Grid size={{ xs: 12, sm: 3 }} > {/* Changed size to item xs/sm to match Grid v5 syntax if using v5, or keep size if using v6 */}
        <Typography variant="body2">{label}</Typography>
      </Grid>
      
      {/* Cantidad */}
      <Grid size={{ xs: 12, sm: 3 }}>
        <Controller
          name={`${basePath}.cantidad` as SistemaPath}
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel id={`${name}-cantidad-label`}>Cantidad</InputLabel>
              <Select
                labelId={`${name}-cantidad-label`}
                id={`${name}-cantidad-select`}
                value={field.value ?? ""} // Changed || 0 to ?? "" to handle 0 correctly if needed, or keep || 0
                label="Cantidad"
                onChange={field.onChange}
                disabled={disabled} // 🔥 3. Bloquear Select
              >
                {cantidadOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      {/* Estado (Bueno/Malo) */}
      <Grid size={{ xs: 12, sm: 3 }}>
        <Controller
          name={`${basePath}.estado` as SistemaPath}
          control={control}
          render={({ field }) => (
            <EstadoInspeccionSelect 
                value={field.value} 
                onChange={field.onChange} 
                disabled={disabled} // 🔥 4. Bloquear Estado (Asegúrate que este componente reciba la prop)
            />
          )}
        />
      </Grid>
      
      {/* Observaciones */}
      <Grid size={{ xs: 12, sm: 3 }}>  
        <Controller
          name={`${basePath}.observaciones` as SistemaPath}
          control={control}
          render={({ field }) => (
            <TextField 
                {...field} 
                label="Observaciones" 
                fullWidth 
                size="small" 
                variant="outlined"
                disabled={disabled} // 🔥 5. Bloquear TextField
                InputProps={{ readOnly: disabled }} // Opcional: extra seguridad visual
            />
          )}
        />
      </Grid>
    </Grid>
  )
}

export default SistemaField