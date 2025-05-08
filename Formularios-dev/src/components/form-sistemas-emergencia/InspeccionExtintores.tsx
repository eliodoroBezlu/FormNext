import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  FormControl,
  FormLabel,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import { type Control, Controller, useFieldArray } from "react-hook-form"
import type { ExtintorBackend, FormularioInspeccion, Mes, InspeccionExtintor } from "../../types/formTypes"
import EstadoInspeccionSelect from "@/components/form-sistemas-emergencia/EstadoInspeccionSelect"
import { useEffect, useMemo } from "react"
import Grid from "@mui/material/Grid";

interface InspeccionExtintoresProps {
  control: Control<FormularioInspeccion>
  currentMes: Mes
  extintores: ExtintorBackend[];
}

const InspeccionExtintores = ({ control, currentMes, extintores }: InspeccionExtintoresProps) => {
  // Field array para gestionar extintores
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `meses.${currentMes}.inspeccionesExtintor`,
  })
  

  // Agregar nuevo extintor con tipado correcto
  const agregarExtintor = () => {
    const nuevoExtintor: InspeccionExtintor = {
      fechaInspeccion: new Date().toISOString().split("T")[0],
      codigo: "",
      ubicacion: "",
      inspeccionMensual: "✓",
      manguera: "✓",
      cilindro: "✓",
      indicadorPresion: "✓",
      gatilloChavetaPrecinto: "✓",
      senalizacionSoporte: "✓",
      observaciones: "",
    }
    append(nuevoExtintor)
  }

  // Usar useMemo para crear la lista de extintores solo cuando cambie la lista de extintores
  const nuevosExtintores = useMemo(() => {
    if (!extintores || extintores.length === 0) return [];
    
    return extintores.map((extintor) => {
      const nuevoExtintor: InspeccionExtintor = {
        fechaInspeccion: new Date().toISOString().split("T")[0],
        codigo: extintor.CodigoExtintor || "",
        ubicacion: extintor.Ubicacion || "",
        inspeccionMensual: "✓",
        manguera: "✓",
        cilindro: "✓",
        indicadorPresion: "✓",
        gatilloChavetaPrecinto: "✓",
        senalizacionSoporte: "✓",
        observaciones: "",
      };
      return nuevoExtintor;
    });
  }, [extintores]);
  
  // Usar replace en lugar de limpiar y agregar individualmente
  useEffect(() => {
    if (nuevosExtintores.length > 0 && fields.length === 0) {
      // Solo reemplazamos si hay nuevos extintores y no hay campos existentes
      replace(nuevosExtintores);
    }
  }, [nuevosExtintores, fields.length, replace]);

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Inspección de Extintores</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {fields.map((field, index) => (
          <Paper key={field.id} elevation={2} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 10 }}>
                <Typography variant="subtitle1">Extintor #{index + 1}</Typography>
              </Grid>
              <Grid size={{ xs: 2 }} sx={{ textAlign: "right" }}>
                <IconButton onClick={() => remove(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>

              <Grid size={{ xs: 12, md: 6}}>
                <Controller
                  name={`meses.${currentMes}.inspeccionesExtintor.${index}.fechaInspeccion`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Fecha Inspección"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6}}>
                <Controller
                  name={`meses.${currentMes}.inspeccionesExtintor.${index}.codigo`}
                  control={control}
                  render={({ field }) => <TextField {...field} label="Código" fullWidth />}
                />
              </Grid>

              <Grid size={{ xs: 12}}>
                <Controller
                  name={`meses.${currentMes}.inspeccionesExtintor.${index}.ubicacion`}
                  control={control}
                  render={({ field }) => <TextField {...field} label="Ubicación" fullWidth />}
                />
              </Grid>

              <Grid size={{ xs: 12}}>
                <Typography variant="subtitle2" gutterBottom>
                  Estado de los Componentes
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4}}>
                    <FormControl fullWidth size="small">
                      <FormLabel component="legend">Inspección Mensual</FormLabel>
                      <Controller
                        name={`meses.${currentMes}.inspeccionesExtintor.${index}.inspeccionMensual`}
                        control={control}
                        render={({ field }) => <EstadoInspeccionSelect value={field.value} onChange={field.onChange} />}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4}}>
                    <FormControl fullWidth size="small">
                      <FormLabel component="legend">Manguera</FormLabel>
                      <Controller
                        name={`meses.${currentMes}.inspeccionesExtintor.${index}.manguera`}
                        control={control}
                        render={({ field }) => <EstadoInspeccionSelect value={field.value} onChange={field.onChange} />}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4}}>
                    <FormControl fullWidth size="small">
                      <FormLabel component="legend">Cilindro</FormLabel>
                      <Controller
                        name={`meses.${currentMes}.inspeccionesExtintor.${index}.cilindro`}
                        control={control}
                        render={({ field }) => <EstadoInspeccionSelect value={field.value} onChange={field.onChange} />}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4}}>
                    <FormControl fullWidth size="small">
                      <FormLabel component="legend">Indicador Presión</FormLabel>
                      <Controller
                        name={`meses.${currentMes}.inspeccionesExtintor.${index}.indicadorPresion`}
                        control={control}
                        render={({ field }) => <EstadoInspeccionSelect value={field.value} onChange={field.onChange} />}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4}}>
                    <FormControl fullWidth size="small">
                      <FormLabel component="legend">Gatillo/Chaveta/Precinto</FormLabel>
                      <Controller
                        name={`meses.${currentMes}.inspeccionesExtintor.${index}.gatilloChavetaPrecinto`}
                        control={control}
                        render={({ field }) => <EstadoInspeccionSelect value={field.value} onChange={field.onChange} />}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4}}>
                    <FormControl fullWidth size="small">
                      <FormLabel component="legend">Señalización/Soporte</FormLabel>
                      <Controller
                        name={`meses.${currentMes}.inspeccionesExtintor.${index}.senalizacionSoporte`}
                        control={control}
                        render={({ field }) => <EstadoInspeccionSelect value={field.value} onChange={field.onChange} />}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12}}>
                <Controller
                  name={`meses.${currentMes}.inspeccionesExtintor.${index}.observaciones`}
                  control={control}
                  render={({ field }) => <TextField {...field} label="Observaciones" fullWidth multiline rows={2} />}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
        <Button variant="contained" startIcon={<AddIcon />} onClick={agregarExtintor} sx={{ mb: 2 }}>
          Agregar Extintor
        </Button>
        {fields.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
            No hay extintores registrados. Haga clic en &quot;Agregar Extintor&quot; para añadir uno.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default InspeccionExtintores