import { Typography, TextField } from "@mui/material"
import { type Control, Controller } from "react-hook-form"
import type { FormularioInspeccion, Mes, SistemaPath } from "../../types/formTypes"
import EstadoInspeccionSelect from "@/components/form-sistemas-emergencia/EstadoInspeccionSelect"
import Grid from "@mui/material/Grid2";

interface SistemaFieldProps {
  name: string
  label: string
  control: Control<FormularioInspeccion>
  currentMes: Mes
  type: "pasivos" | "activos"
}

const SistemaField = ({ name, label, control, currentMes, type }: SistemaFieldProps) => {
  const basePath =
    type === "pasivos"
      ? `meses.${currentMes}.inspeccionesActivos.sistemasPasivos.${name}`
      : `meses.${currentMes}.inspeccionesActivos.sistemasActivos.${name}`

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, sm: 4}}>
        <Typography variant="body2">{label}</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 4}}>
        <Controller
          name={`${basePath}.cantidad` as SistemaPath}
          control={control}
          render={({ field }) => (
            <TextField {...field} type="number" size="small" fullWidth label="Cantidad" inputProps={{ min: 0 }} />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4}}>
        <Controller
          name={`${basePath}.estado` as SistemaPath}
          control={control}
          render={({ field }) => <EstadoInspeccionSelect value={field.value} onChange={field.onChange} />}
        />
      </Grid>
    </Grid>
  )
}

export default SistemaField

