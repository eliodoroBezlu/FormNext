// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Typography,
//   Button,
//   Paper,
//   IconButton,
//   TextField,
//   FormControl,
//   FormLabel,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Snackbar,
//   Alert,
//   Grid
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { type Control, Controller, useFieldArray } from "react-hook-form";
// import type {
//   ExtintorBackend,
//   FormularioInspeccion,
//   Mes,
//   InspeccionExtintor,
// } from "../../types/formTypes";
// import EstadoInspeccionSelect from "@/components/form-sistemas-emergencia/EstadoInspeccionSelect";
// import { useEffect, useMemo, useState } from "react";
// import { desactivarExtintor } from "../../app/actions/inspeccion"; // Importamos la nueva función

// interface InspeccionExtintoresProps {
//   control: Control<FormularioInspeccion>;
//   currentMes: Mes;
//   extintores: ExtintorBackend[] | { extintores: ExtintorBackend[] };
// }
// const inputProps = {
//   readOnly: true,
// };
// const InspeccionExtintores = ({
//   control,
//   currentMes,
//   extintores,
// }: InspeccionExtintoresProps) => {
//   // Field array para gestionar extintores
//   const { fields, append, remove, replace } = useFieldArray({
//     control,
//     name: `meses.${currentMes}.inspeccionesExtintor`,
//   });

//   // Estados para diálogo de confirmación y notificaciones
//   const [confirmarEliminar, setConfirmarEliminar] = useState(false);
//   const [extintorAEliminar, setExtintorAEliminar] = useState<{
//     index: number;
//     codigo: string;
//   }>({ index: -1, codigo: "" });
//   const [notificacion, setNotificacion] = useState({
//     open: false,
//     mensaje: "",
//     tipo: "success" as "success" | "error",
//   });

//   const extintoresArray = useMemo(() => {
//     if (!extintores) {
//       return [];
//     }

//     // Si es un objeto con propiedad extintores
//     if (
//       typeof extintores === "object" &&
//       !Array.isArray(extintores) &&
//       "extintores" in extintores
//     ) {
//       return extintores.extintores || [];
//     }

//     // Si ya es un array
//     if (Array.isArray(extintores)) {
//       return extintores;
//     }

//     return [];
//   }, [extintores]);
//   const iniciarEliminacion = (index: number, codigo: string) => {
//     setExtintorAEliminar({ index, codigo });
//     setConfirmarEliminar(true);
//   };

//   // Función para confirmar la eliminación
//   const confirmarEliminacionExtintor = async () => {
//     try {
//       if (extintorAEliminar.codigo) {
//         // Desactivar el extintor en el backend
//         const resultado = await desactivarExtintor(extintorAEliminar.codigo);

//         if (resultado.exito) {
//           // Eliminar del formulario
//           remove(extintorAEliminar.index);
//           setNotificacion({
//             open: true,
//             mensaje: "Extintor desactivado correctamente",
//             tipo: "success",
//           });
//         } else {
//           setNotificacion({
//             open: true,
//             mensaje: resultado.mensaje || "Error al desactivar el extintor",
//             tipo: "error",
//           });
//         }
//       } else {
//         // Si no tiene código, simplemente eliminarlo del formulario
//         remove(extintorAEliminar.index);
//       }
//     } catch (error) {
//       setNotificacion({
//         open: true,
//         mensaje: "Error al desactivar el extintor",
//         tipo: "error",
//       });
//       console.error("Error al desactivar extintor:", error);
//     } finally {
//       setConfirmarEliminar(false);
//     }
//   };

//   // Agregar nuevo extintor con tipado correcto
//   const agregarExtintor = () => {
//     const nuevoExtintor: InspeccionExtintor = {
//       fechaInspeccion: new Date().toISOString().split("T")[0],
//       codigo: "",
//       ubicacion: "",
//       inspeccionMensual: "✓",
//       manguera: "✓",
//       cilindro: "✓",
//       indicadorPresion: "✓",
//       gatilloChavetaPrecinto: "✓",
//       senalizacionSoporte: "✓",
//       observaciones: "",
//     };
//     append(nuevoExtintor);
//   };

//   // Usar useMemo para crear la lista de extintores solo cuando cambie la lista de extintores
//   const nuevosExtintores = useMemo(() => {
//     if (!extintoresArray || extintoresArray.length === 0) {
//       console.log('Array de extintores está vacío o no existe');
//       return [];
//     }

//     return extintoresArray.map((extintor) => {
//       const nuevoExtintor: InspeccionExtintor = {
//         fechaInspeccion: new Date().toISOString().split("T")[0],
//         codigo: extintor.CodigoExtintor || "",
//         ubicacion: extintor.Ubicacion || "",
//         inspeccionMensual: "✓",
//         manguera: "✓",
//         cilindro: "✓",
//         indicadorPresion: "✓",
//         gatilloChavetaPrecinto: "✓",
//         senalizacionSoporte: "✓",
//         observaciones: "",
//       };
//       return nuevoExtintor;
//     });
//   }, [extintoresArray]);

//   // Usar replace en lugar de limpiar y agregar individualmente
//   useEffect(() => {
//     if (nuevosExtintores.length > 0 && fields.length === 0) {
//       // Solo reemplazamos si hay nuevos extintores y no hay campos existentes
//       replace(nuevosExtintores);
//     }
//   }, [nuevosExtintores, fields.length, replace]);

//   return (
//     <>
//       <Accordion defaultExpanded>
//         <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//           <Typography variant="h6">Inspección de Extintores</Typography>
//         </AccordionSummary>
//         <AccordionDetails>
//           {fields.map((field, index) => (
//             <Paper key={field.id} elevation={2} sx={{ p: 2, mb: 2 }}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid size={{ xs: 10 }}>
//                   <Typography variant="subtitle1">
//                     Extintor #{index + 1}
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 2 }} sx={{ textAlign: "right" }}>
//                   <IconButton
//                     onClick={() => iniciarEliminacion(index, field.codigo)}
//                     color="error"
//                     title="Desactivar extintor"
//                   >
//                     <DeleteIcon />
//                   </IconButton>
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Controller
//                     name={`meses.${currentMes}.inspeccionesExtintor.${index}.fechaInspeccion`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         type="date"
//                         label="Fecha Inspección"
//                         fullWidth
//                         slotProps={{
//                           input: inputProps,
//                         }}
//                       />
//                     )}
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 6 }}>
//                   <Controller
//                     name={`meses.${currentMes}.inspeccionesExtintor.${index}.codigo`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField {...field} label="Código" fullWidth />
//                     )}
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Controller
//                     name={`meses.${currentMes}.inspeccionesExtintor.${index}.ubicacion`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField {...field} label="Ubicación" fullWidth />
//                     )}
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Estado de los Componentes
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid size={{ xs: 4 }}>
//                       <FormControl fullWidth size="small">
//                         <FormLabel component="legend">
//                           Inspección Mensual
//                         </FormLabel>
//                         <Controller
//                           name={`meses.${currentMes}.inspeccionesExtintor.${index}.inspeccionMensual`}
//                           control={control}
//                           render={({ field }) => (
//                             <EstadoInspeccionSelect
//                               value={field.value}
//                               onChange={field.onChange}
//                             />
//                           )}
//                         />
//                       </FormControl>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <FormControl fullWidth size="small">
//                         <FormLabel component="legend">Manguera</FormLabel>
//                         <Controller
//                           name={`meses.${currentMes}.inspeccionesExtintor.${index}.manguera`}
//                           control={control}
//                           render={({ field }) => (
//                             <EstadoInspeccionSelect
//                               value={field.value}
//                               onChange={field.onChange}
//                             />
//                           )}
//                         />
//                       </FormControl>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <FormControl fullWidth size="small">
//                         <FormLabel component="legend">Cilindro</FormLabel>
//                         <Controller
//                           name={`meses.${currentMes}.inspeccionesExtintor.${index}.cilindro`}
//                           control={control}
//                           render={({ field }) => (
//                             <EstadoInspeccionSelect
//                               value={field.value}
//                               onChange={field.onChange}
//                             />
//                           )}
//                         />
//                       </FormControl>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <FormControl fullWidth size="small">
//                         <FormLabel component="legend">
//                           Indicador Presión
//                         </FormLabel>
//                         <Controller
//                           name={`meses.${currentMes}.inspeccionesExtintor.${index}.indicadorPresion`}
//                           control={control}
//                           render={({ field }) => (
//                             <EstadoInspeccionSelect
//                               value={field.value}
//                               onChange={field.onChange}
//                             />
//                           )}
//                         />
//                       </FormControl>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <FormControl fullWidth size="small">
//                         <FormLabel component="legend">
//                           Gatillo/Chaveta/Precinto
//                         </FormLabel>
//                         <Controller
//                           name={`meses.${currentMes}.inspeccionesExtintor.${index}.gatilloChavetaPrecinto`}
//                           control={control}
//                           render={({ field }) => (
//                             <EstadoInspeccionSelect
//                               value={field.value}
//                               onChange={field.onChange}
//                             />
//                           )}
//                         />
//                       </FormControl>
//                     </Grid>

//                     <Grid size={{ xs: 12, md: 4 }}>
//                       <FormControl fullWidth size="small">
//                         <FormLabel component="legend">
//                           Señalización/Soporte
//                         </FormLabel>
//                         <Controller
//                           name={`meses.${currentMes}.inspeccionesExtintor.${index}.senalizacionSoporte`}
//                           control={control}
//                           render={({ field }) => (
//                             <EstadoInspeccionSelect
//                               value={field.value}
//                               onChange={field.onChange}
//                             />
//                           )}
//                         />
//                       </FormControl>
//                     </Grid>
//                   </Grid>
//                 </Grid>

//                 <Grid size={{ xs: 12 }}>
//                   <Controller
//                     name={`meses.${currentMes}.inspeccionesExtintor.${index}.observaciones`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         label="Observaciones"
//                         fullWidth
//                         multiline
//                         rows={2}
//                       />
//                     )}
//                   />
//                 </Grid>
//               </Grid>
//             </Paper>
//           ))}
//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={agregarExtintor}
//             sx={{ mb: 2 }}
//           >
//             Agregar Extintor
//           </Button>
//           {fields.length === 0 && (
//             <Typography
//               variant="body2"
//               color="text.secondary"
//               sx={{ mt: 2, mb: 2 }}
//             >
//               No hay extintores registrados. Haga clic en &quot;Agregar
//               Extintor&quot; para añadir uno.
//             </Typography>
//           )}
//         </AccordionDetails>
//       </Accordion>

//       {/* Diálogo de confirmación de eliminación */}
//       <Dialog
//         open={confirmarEliminar}
//         onClose={() => setConfirmarEliminar(false)}
//       >
//         <DialogTitle>Confirmar desactivación</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             ¿Está seguro de que desea desactivar este extintor? El extintor se
//             marcará como inactivo en el sistema.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setConfirmarEliminar(false)} color="primary">
//             Cancelar
//           </Button>
//           <Button
//             onClick={confirmarEliminacionExtintor}
//             color="error"
//             autoFocus
//           >
//             Desactivar
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Notificación de resultado */}
//       <Snackbar
//         open={notificacion.open}
//         autoHideDuration={6000}
//         onClose={() => setNotificacion({ ...notificacion, open: false })}
//       >
//         <Alert
//           onClose={() => setNotificacion({ ...notificacion, open: false })}
//           severity={notificacion.tipo}
//           sx={{ width: "100%" }}
//         >
//           {notificacion.mensaje}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default InspeccionExtintores;

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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { type Control, Controller, useFieldArray } from "react-hook-form";
import type {
  ExtintorBackend,
  FormularioInspeccion,
  Mes,
  InspeccionExtintor,
} from "../../types/formTypes";
import EstadoInspeccionSelect from "@/components/form-sistemas-emergencia/EstadoInspeccionSelect";
import { useEffect, useMemo, useState } from "react";
import { desactivarExtintor } from "../../app/actions/inspeccion"; // Importamos la nueva función

interface InspeccionExtintoresProps {
  control: Control<FormularioInspeccion>;
  currentMes: Mes;
  extintores: ExtintorBackend[] | { extintores: ExtintorBackend[] };
  disabled?: boolean; // Prop para modo lectura
}

const inputProps = {
  readOnly: true,
};

const InspeccionExtintores = ({
  control,
  currentMes,
  extintores,
  disabled = false,
}: InspeccionExtintoresProps) => {
  // Field array para gestionar extintores
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `meses.${currentMes}.inspeccionesExtintor`,
  });

  // Estados para diálogo de confirmación y notificaciones
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [extintorAEliminar, setExtintorAEliminar] = useState<{
    index: number;
    codigo: string;
  }>({ index: -1, codigo: "" });
  const [notificacion, setNotificacion] = useState({
    open: false,
    mensaje: "",
    tipo: "success" as "success" | "error",
  });

  const extintoresArray = useMemo(() => {
    if (!extintores) {
      return [];
    }

    // Si es un objeto con propiedad extintores
    if (
      typeof extintores === "object" &&
      !Array.isArray(extintores) &&
      "extintores" in extintores
    ) {
      return extintores.extintores || [];
    }

    // Si ya es un array
    if (Array.isArray(extintores)) {
      return extintores;
    }

    return [];
  }, [extintores]);

  // Función para iniciar el proceso de eliminación
  const iniciarEliminacion = (index: number, codigo: string) => {
    setExtintorAEliminar({ index, codigo });
    setConfirmarEliminar(true);
  };

  // Función para confirmar la eliminación
  const confirmarEliminacionExtintor = async () => {
    try {
      if (extintorAEliminar.codigo) {
        // Desactivar el extintor en el backend
        const resultado = await desactivarExtintor(extintorAEliminar.codigo);

        if (resultado.exito) {
          // Eliminar del formulario
          remove(extintorAEliminar.index);
          setNotificacion({
            open: true,
            mensaje: "Extintor desactivado correctamente",
            tipo: "success",
          });
        } else {
          setNotificacion({
            open: true,
            mensaje: resultado.mensaje || "Error al desactivar el extintor",
            tipo: "error",
          });
        }
      } else {
        // Si no tiene código, simplemente eliminarlo del formulario
        remove(extintorAEliminar.index);
      }
    } catch (error) {
      setNotificacion({
        open: true,
        mensaje: "Error al desactivar el extintor",
        tipo: "error",
      });
      console.error("Error al desactivar extintor:", error);
    } finally {
      setConfirmarEliminar(false);
    }
  };

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
    };
    append(nuevoExtintor);
  };

  // Usar useMemo para crear la lista de extintores solo cuando cambie la lista de extintores
  const nuevosExtintores = useMemo(() => {
    if (!extintoresArray || extintoresArray.length === 0) {
      // console.log('Array de extintores está vacío o no existe');
      return [];
    }

    return extintoresArray.map((extintor) => {
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
  }, [extintoresArray]);

  // Usar replace en lugar de limpiar y agregar individualmente
  useEffect(() => {
    if (nuevosExtintores.length > 0 && fields.length === 0) {
      // Solo reemplazamos si hay nuevos extintores y no hay campos existentes
      replace(nuevosExtintores);
    }
  }, [nuevosExtintores, fields.length, replace]);

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Inspección de Extintores</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {fields.map((field, index) => (
            <Paper key={field.id} elevation={2} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 10 }}>
                  <Typography variant="subtitle1">
                    Extintor #{index + 1}
                  </Typography>
                </Grid>
                
                {/* Ocultar botón eliminar si está deshabilitado */}
                {!disabled && (
                  <Grid size={{ xs: 2 }}sx={{ textAlign: "right" }}>
                    <IconButton
                      onClick={() => iniciarEliminacion(index, field.codigo)}
                      color="error"
                      title="Desactivar extintor"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name={`meses.${currentMes}.inspeccionesExtintor.${index}.fechaInspeccion`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="date"
                        label="Fecha Inspección"
                        fullWidth
                        InputProps={inputProps} // Usamos InputProps en lugar de slotProps para compatibilidad MUI v5/v6
                        disabled={disabled}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name={`meses.${currentMes}.inspeccionesExtintor.${index}.codigo`}
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Código" 
                        fullWidth 
                        disabled={disabled} 
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name={`meses.${currentMes}.inspeccionesExtintor.${index}.ubicacion`}
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Ubicación" 
                        fullWidth 
                        disabled={disabled} 
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Estado de los Componentes
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <FormLabel component="legend">
                          Inspección Mensual
                        </FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.inspeccionMensual`}
                          control={control}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <FormLabel component="legend">Manguera</FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.manguera`}
                          control={control}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <FormLabel component="legend">Cilindro</FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.cilindro`}
                          control={control}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <FormLabel component="legend">
                          Indicador Presión
                        </FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.indicadorPresion`}
                          control={control}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <FormLabel component="legend">
                          Gatillo/Chaveta/Precinto
                        </FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.gatilloChavetaPrecinto`}
                          control={control}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <FormLabel component="legend">
                          Señalización/Soporte
                        </FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.senalizacionSoporte`}
                          control={control}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name={`meses.${currentMes}.inspeccionesExtintor.${index}.observaciones`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Observaciones"
                        fullWidth
                        multiline
                        rows={2}
                        disabled={disabled}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          
          {/* Ocultar botón agregar si está deshabilitado */}
          {!disabled && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={agregarExtintor}
              sx={{ mb: 2 }}
            >
              Agregar Extintor
            </Button>
          )}
          
          {fields.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, mb: 2 }}
            >
              No hay extintores registrados. 
              {!disabled && " Haga clic en \"Agregar Extintor\" para añadir uno."}
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={confirmarEliminar}
        onClose={() => setConfirmarEliminar(false)}
      >
        <DialogTitle>Confirmar desactivación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea desactivar este extintor? El extintor se
            marcará como inactivo en el sistema.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarEliminar(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={confirmarEliminacionExtintor}
            color="error"
            autoFocus
          >
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación de resultado */}
      <Snackbar
        open={notificacion.open}
        autoHideDuration={6000}
        onClose={() => setNotificacion({ ...notificacion, open: false })}
      >
        <Alert
          onClose={() => setNotificacion({ ...notificacion, open: false })}
          severity={notificacion.tipo}
          sx={{ width: "100%" }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InspeccionExtintores;
