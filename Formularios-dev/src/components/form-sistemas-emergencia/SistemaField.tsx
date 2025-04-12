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
}

const cantidadOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const SistemaField = ({ name, label, control, currentMes, type }: SistemaFieldProps) => {
  const basePath =
    type === "pasivos"
      ? `meses.${currentMes}.inspeccionesActivos.sistemasPasivos.${name}`
      : `meses.${currentMes}.inspeccionesActivos.sistemasActivos.${name}`

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, sm: 3}}>
        <Typography variant="body2">{label}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 3}}>
        <Controller
          name={`${basePath}.cantidad` as SistemaPath}
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id={`${name}-cantidad-label`}>Cantidad</InputLabel>
              <Select
                labelId={`${name}-cantidad-label`}
                id={`${name}-cantidad-select`}
                value={field.value || 0}
                label="Cantidad"
                onChange={field.onChange}
                size="small"
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
      <Grid size={{ xs: 12, sm: 3}}>
        <Controller
          name={`${basePath}.estado` as SistemaPath}
          control={control}
          render={({ field }) => <EstadoInspeccionSelect value={field.value} onChange={field.onChange} />}
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 3}}>  
        <Controller
          name={`${basePath}.observaciones` as SistemaPath}
          control={control}
          render={({ field }) => <TextField {...field} label="Observaciones" fullWidth />}
        />
      </Grid>
    </Grid>
  )
}

export default SistemaField

