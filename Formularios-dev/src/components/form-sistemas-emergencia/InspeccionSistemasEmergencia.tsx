// "use client";

// import { useEffect, useState, useCallback, useRef } from "react";
// import { useForm } from "react-hook-form";
// import {
//   Box,
//   Button,
//   Typography,
//   Paper,
//   Container,
//   Alert,
//   Grid,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import {
//   ExtintorAreaResponse,
//   ExtintorBackend,
//   type FormularioInspeccion,
//   type Mes,
//   TagConEstado,
//   crearFormularioInicial,
// } from "../../types/formTypes";
// import {
//   actualizarExtintoresPorTag,
//   obtenerTagsPorArea,
//   obtenerExtintoresPorTag,
//   verificarTag,
//   actualizarMesPorTag,
//   crearFormSistemasEmergencia,
//   verificarInspecciones,
// } from "@/app/actions/inspeccion";

// import { useRouter } from "next/navigation";

// // Components
// import InformacionGeneral from "./InformacionGeneral";
// import SistemasPasivos from "./SsitemasPasivos";
// import SistemasActivos from "./SistemasActivos";
// import InspeccionExtintores from "./InspeccionExtintores";
// import InformacionInspector from "./InformacionInspector";
// import ExtintoresChecklist from "./ExtintoresChecklist";
// import {
//   ArrowBack,
//   Autorenew,
//   CheckCircle,
//   LockClock,
// } from "@mui/icons-material";
// import { MESES, TAGS_CON_SELECCION_EXTINTORES } from "@/lib/constants";
// import ExtintoresVisualizacion from "./ExtintoresVisualizacion";
// import { SuccessScreen } from "../SucessScreen";
// import { obtenerAreas } from "@/lib/actions/area-actions";

// // Helper functions

// export interface InspectionFormProps {
//   onCancel: () => void;
// }
// const obtenerMesActual = (): Mes => {
//   // Para testing, puedes hardcodear un mes específico
//   // return "FEBRERO"; // Fuerza febrero

//   // Para producción, usar el mes real
//   return MESES[new Date().getMonth()];
// };
// const getPeriodoActual = (): "ENERO-JUNIO" | "JULIO-DICIEMBRE" => {
//   const mesActual = obtenerMesActual();
//   const mesesPrimerSemestre = [
//     "ENERO",
//     "FEBRERO",
//     "MARZO",
//     "ABRIL",
//     "MAYO",
//     "JUNIO",
//   ];

//   return mesesPrimerSemestre.includes(mesActual)
//     ? "ENERO-JUNIO"
//     : "JULIO-DICIEMBRE";
// };
// const getAñoActual = (): number => new Date().getFullYear();
// const getDiaActual = (): number => new Date().getDate();

// export const InspeccionSistemasEmergencia = ({
//   onCancel,
// }: InspectionFormProps) => {
//   const router = useRouter();
//   const currentMes = obtenerMesActual();
//   const submitInProgress = useRef(false);
//   const [dentroPeriodoValido, setDentroPeriodoValido] = useState(true);
//   const [showSuccessScreen, setShowSuccessScreen] = useState(false);

//   // Form state
//   const {
//     control,
//     handleSubmit,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm<FormularioInspeccion>({
//     defaultValues: crearFormularioInicial(
//       "",
//       "",
//       "",
//       "",
//       "",
//       getPeriodoActual(),
//       getAñoActual(),
//       currentMes
//     ),
//   });

//   // Component state
//   const [formState, setFormState] = useState({
//     loading: false,
//     submitting: false, // Estado específico para controlar el envío del formulario
//     showForm: false,
//     error: null as string | null,
//     successMessage: null as string | null,
//     esFormularioExistente: false,
//     soloExtintores: false,
//   });

//   const [areaData, setAreaData] = useState({
//     tag: "",
//     area: "",
//     areaOptions: [] as string[],
//     tagOptions: [] as string[],
//     extintores: [] as ExtintorBackend[],
//     tagsConEstado: [] as TagConEstado[],
//     extintoresSeleccionados: [] as ExtintorBackend[],
//     tagsData: [] as TagConEstado[],
//     totalExtintoresActivos: 0,
//     tagUbicaciones: {} as Record<string, string>,
//   });

//   useEffect(() => {
//     const diaActual = getDiaActual();
//     if (diaActual > 10) {
//       setDentroPeriodoValido(true);
//       setFormState((prev) => ({
//         ...prev,
//         error:
//           "No es posible realizar inspecciones después del día 10 del mes actual.",
//       }));
//     } else {
//       setDentroPeriodoValido(true);
//     }
//   }, []);
//   // Load areas on component mount
//   useEffect(() => {
//   const cargarAreas = async () => {
//     try {
//       setFormState((prev) => ({ ...prev, loading: true }));
      
//       // Usar obtenerAreas() en lugar de buscarAreas("")
//       const areas = await obtenerAreas();
      
//       console.log("Áreas cargadas:", areas); // Para debug
      
//       setAreaData((prev) => ({ 
//         ...prev, 
//         areaOptions: areas 
//       }));
      
//       setFormState((prev) => ({ ...prev, loading: false }));
//     } catch (error) {
//       console.error("Error al cargar áreas:", error);
//       setFormState((prev) => ({
//         ...prev,
//         error: "Error al cargar áreas. Por favor, recargue la página.",
//         loading: false,
//       }));
//     }
//   };

//   cargarAreas();
// }, []);

//   // Update form when month changes
//   useEffect(() => {
//     setValue("mesActual", currentMes);
//   }, [currentMes, setValue]);

//   // Handle extintores based on area
//   useEffect(() => {
//     if (!areaData.tag) return;

//     if (!TAGS_CON_SELECCION_EXTINTORES.includes(areaData.tag)) {
//       setAreaData((prev) => ({
//         ...prev,
//         extintoresSeleccionados: prev.extintores,
//       }));
//     }
//   }, [areaData.tag, areaData.extintores]);

//   // Handlers
//   const handleExtintoresSeleccionados = useCallback(
//     (seleccionados: ExtintorBackend[]) => {
//       setAreaData((prev) => ({
//         ...prev,
//         extintoresSeleccionados: seleccionados,
//       }));
//     },
//     []
//   );

//   const handleAreaChange = useCallback(
//     async (selectedArea: string) => {
//       try {
//         setFormState((prev) => ({ ...prev, loading: true, error: null }));
//         const currentMes = obtenerMesActual();
//         const tagsDelArea = await obtenerTagsPorArea(selectedArea);
//         const tagsInspeccionados = await verificarInspecciones(
//           selectedArea,
//           currentMes
//         );

//         console.log("Tags del área:", tagsDelArea);

//         const primerTag = tagsDelArea.length > 0 ? tagsDelArea[0] : "";

//         const areaExtintores: ExtintorAreaResponse =
//           await obtenerExtintoresPorTag(primerTag);

//         console.log("Extintores del área:", areaExtintores);

//         if (
//           !areaExtintores ||
//           !areaExtintores.extintores ||
//           !Array.isArray(areaExtintores.extintores)
//         ) {
//           console.error("Estructura de datos inválida:", areaExtintores);
//           throw new Error(
//             "La respuesta de la API no tiene la estructura esperada"
//           );
//         }

//         const tagUbicacionesMap: Record<string, string> = {};

//         for (const tag of tagsDelArea) {
//           try {
//             const extintoresDelTag = await obtenerExtintoresPorTag(tag);
//             if (
//               extintoresDelTag.extintores &&
//               extintoresDelTag.extintores.length > 0
//             ) {
//               // Tomar la ubicación del primer extintor de este TAG
//               const primeraUbicacion =
//                 extintoresDelTag.extintores[0].Ubicacion || "";
//               tagUbicacionesMap[tag] = primeraUbicacion;
//             }
//           } catch (error) {
//             console.error(
//               `Error al obtener extintores para TAG ${tag}:`,
//               error
//             );
//             tagUbicacionesMap[tag] = ""; // Ubicación vacía si hay error
//           }
//         }

//         const tagsConEstado = await Promise.all(
//           tagsDelArea.map(async (tag) => {
//             const extintores = await obtenerExtintoresPorTag(tag);

//             const totalActivos = extintores.totalExtintoresActivosArea || 0;

//             const estaInspeccionado = Array.isArray(tagsInspeccionados)
//               ? tagsInspeccionados.some((t) => t.tag === tag && t.inspeccionado)
//               : false;
//             return {
//               tag,
//               extintoresPendientes: extintores.extintores?.length || 0,
//               totalActivos: totalActivos,
//               inspeccionado: estaInspeccionado,
//             };
//           })
//         );

//         const extintoresArray = areaExtintores.extintores || [];
//         console.log("Extintores del área:", extintoresArray);

//         // Seleccionamos el primer tag automáticamente
//         setAreaData((prev) => ({
//           ...prev,
//           area: selectedArea,
//           tag: primerTag,
//           tagOptions: tagsDelArea,
//           tagsConEstado: tagsConEstado,
//           extintores: extintoresArray,
//           totalExtintoresActivos:
//             areaExtintores.totalExtintoresActivosArea || 0,
//           tagUbicaciones: tagUbicacionesMap,
//         }));

//         setValue("tag", primerTag);
//       } catch (error) {
//         console.error("Error al obtener datos del área:", error);
//         setFormState((prev) => ({
//           ...prev,
//           error: "Error al obtener datos del área. Intente nuevamente.",
//         }));
//       } finally {
//         setFormState((prev) => ({ ...prev, loading: false }));
//       }
//     },
//     [setValue]
//   );

//   const handleTagChange = useCallback(
//     async (selectedTag: string) => {
//       try {
//         setFormState((prev) => ({ ...prev, loading: true, error: null }));

//         // Obtener extintores por tag
//         const tagExtintores = await obtenerExtintoresPorTag(selectedTag);

//         setAreaData((prev) => ({
//           ...prev,
//           tag: selectedTag,
//           extintores: tagExtintores.extintores || [],
//         }));
//         setValue("tag", selectedTag);
//       } catch (error) {
//         console.error("Error al obtener extintores del tag:", error);
//         setFormState((prev) => ({
//           ...prev,
//           error: "Error al obtener extintores del tag. Intente nuevamente.",
//         }));
//       } finally {
//         setFormState((prev) => ({ ...prev, loading: false }));
//       }
//     },
//     [setValue]
//   );

//   const determinarEstadoTag = (tag: string) => {
//     const tagInfo = areaData.tagsConEstado.find((item) => item.tag === tag);

//     if (!tagInfo) return "pendiente";

//     // Si no hay extintores activos
//     if (tagInfo.totalActivos === 0) return "completado";

//     // Si no hay extintores pendientes (todos fueron inspeccionados)
//     if (tagInfo.extintoresPendientes === 0) return "completado";

//     // Si todos los extintores están pendientes
//     if (tagInfo.extintoresPendientes === tagInfo.totalActivos)
//       return "pendiente";

//     // Si hay algunos inspeccionados y algunos pendientes → PARCIAL
//     if (
//       tagInfo.extintoresPendientes > 0 &&
//       tagInfo.extintoresPendientes < tagInfo.totalActivos
//     ) {
//       return "parcial";
//     }

//     return "pendiente";
//   };

//   const todosExtintoresSinInspeccionar = useCallback(() => {
//     if (!areaData.extintores.length) {
//       return true;
//     }

//     // Verificar si hay al menos un extintor inspeccionado
//     const hayAlgunoInspeccionado = areaData.extintores.some(
//       (ext) => ext.inspeccionado === true
//     );

//     // Si hay alguno inspeccionado, no todos están sin inspeccionar
//     return !hayAlgunoInspeccionado;
//   }, [areaData.extintores]);

//   const handleTagSubmit = async () => {
//     if (!areaData.tag.trim()) {
//       setFormState((prev) => ({
//         ...prev,
//         error: "Por favor, ingresa un valor para el TAG.",
//       }));
//       return;
//     }

//     try {
//       setFormState((prev) => ({ ...prev, loading: true, error: null }));

//       const datosIniciales = {
//         tag: areaData.tag,
//         periodo: getPeriodoActual(),
//         año: getAñoActual(),
//         mesActual: currentMes,
//         area: areaData.area,
//       };

//       const response = await verificarTag(datosIniciales);

//       const formularioExiste = response.existe;

//       const mostrarSoloExtintores =
//         formularioExiste &&
//         todosExtintoresSinInspeccionar() &&
//         response.formulario.meses?.[currentMes]?.inspeccionesExtintor?.length >
//           0;

//       setAreaData((prev) => ({
//         ...prev,
//         extintores: response.extintores?.extintores || [],
//       }));

//       const formularioInicial = crearFormularioInicial(
//         response.superintendencia || "",
//         areaData.area,
//         areaData.tag,
//         response.formulario?.responsableEdificio || "",
//         response.formulario?.edificio || "",
//         getPeriodoActual(),
//         getAñoActual(),
//         currentMes
//       );

//       if (formularioExiste) {
//         const mesAlmacenado = response.formulario.mesActual;

//         if (
//           mesAlmacenado === currentMes &&
//           !response.extintores?.extintores?.length
//         ) {
//           setFormState((prev) => ({
//             ...prev,
//             error:
//               "El formulario ya existe para este mes. No es necesario realizar cambios.",
//             loading: false,
//           }));
//           return;
//         }

//         // Guardamos estos estados explícitamente
//         const newFormState = {
//           ...formState,
//           esFormularioExistente: formularioExiste,
//           soloExtintores: mostrarSoloExtintores,
//           showForm: true,
//           loading: false,
//         };

//         setFormState(newFormState);
//       } else {
//         setFormState((prev) => ({
//           ...prev,
//           esFormularioExistente: false,
//           soloExtintores: false,
//           showForm: true,
//           loading: false,
//         }));
//       }

//       reset(formularioInicial);
//     } catch (error) {
//       console.error("Error al verificar el TAG:", error);
//       setFormState((prev) => ({
//         ...prev,
//         error:
//           "Ocurrió un error al comunicarse con el servidor. Por favor, intenta más tarde.",
//         loading: false,
//       }));
//     }
//   };

//   const onSubmit = async (data: FormularioInspeccion) => {
//     if (formState.submitting) return;

//     console.log("Formulario enviado exitosamente", data);

//     try {
//       setFormState((prev) => ({
//         ...prev,
//         loading: true,
//         submitting: true, // Marcar como enviando
//         error: null,
//       }));

//       if (soloExtintores) {
//         // Solo enviar datos de extintores
//         const extintoresData = {
//           tag: areaData.tag,
//           extintores: data.meses[currentMes].inspeccionesExtintor,
//           area: areaData.area,
//         };

//         await actualizarExtintoresPorTag(areaData.tag, extintoresData);
//       } else if (esFormularioExistente) {
//         // Actualizar todo el mes
//         await actualizarMesPorTag(
//           areaData.tag,
//           currentMes,
//           data.meses[currentMes],
//           areaData.area
//         );
//       } else {
//         // Crear nuevo formulario completo
//         await crearFormSistemasEmergencia(data);
//       }
//       setShowSuccessScreen(true);

//       setFormState((prev) => ({
//         ...prev,
//         successMessage: "¡Inspección guardada correctamente!",
//         loading: false,
//       }));

//       setTimeout(() => {
//         resetForm();
//         router.push("/dashboard/formularios-de-inspeccion");
//       }, 2000);
//     } catch (error) {
//       console.error("Error al enviar el formulario:", error);
//       setFormState((prev) => ({
//         ...prev,
//         error: "Error al guardar la inspección. Intente nuevamente.",
//         loading: false,
//         submitting: false,
//       }));
//     } finally {
//       submitInProgress.current = false;
//     }
//   };

//   const resetForm = () => {
//     setFormState({
//       loading: false,
//       submitting: false, // Asegurarse de reiniciar estado de envío
//       showForm: false,
//       error: null,
//       successMessage: null,
//       esFormularioExistente: false,
//       soloExtintores: false,
//     });

//     setAreaData({
//       tag: "",
//       area: "",
//       areaOptions: areaData.areaOptions,
//       extintores: [],
//       tagOptions: [],
//       tagsConEstado: [],
//       extintoresSeleccionados: [],
//       tagsData: [],
//       totalExtintoresActivos: 0,
//       tagUbicaciones: {} as Record<string, string>,
//     });

//     reset(
//       crearFormularioInicial(
//         "",
//         "",
//         "",
//         "",
//         "",
//         getPeriodoActual(),
//         getAñoActual(),
//         currentMes
//       )
//     );
//     submitInProgress.current = false;
//   };

//   const {
//     loading,
//     showForm,
//     error,
//     successMessage,
//     esFormularioExistente,
//     soloExtintores,
//   } = formState;
//   const {
//     tag,
//     area,
//     areaOptions,
//     extintores,
//     tagOptions,
//     extintoresSeleccionados,
//   } = areaData;

//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       {showSuccessScreen ? (
//         <SuccessScreen
//           title="¡Inspección Guardada Exitosamente!"
//           message={
//             soloExtintores
//               ? "Los extintores han sido inspeccionados correctamente."
//               : "La inspección de sistemas de emergencia se ha registrado correctamente."
//           }
//           subtitle={`TAG: ${areaData.tag} - Área: ${areaData.area} - Mes: ${currentMes}`}
//           autoRedirect={true}
//           redirectDelay={5000}
//           redirectPath="/dashboard/formularios-de-inspeccion"
//           detailsLabel="Ver Formulario"
//           listLabel="Ver Todas las Inspecciones"
//           homeLabel="Ir al Dashboard"
//         />
//       ) : (
//         // Tu formulario existente aquí
//         <>
//           <Button
//             variant="outlined"
//             startIcon={<ArrowBack />}
//             onClick={onCancel}
//             sx={{
//               fontSize: { xs: "0.8rem", sm: "0.875rem" },
//               padding: { xs: "6px 12px", sm: "8px 16px" },
//             }}
//           >
//             Volver
//           </Button>
//           <Paper elevation={3} sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>
//               Formulario de Inspección de Seguridad
//             </Typography>
//             <Typography variant="subtitle1" gutterBottom>
//               Código: 3.02.P01.F17 - Rev. 2
//             </Typography>

//             {successMessage && (
//               <Alert severity="success" sx={{ mb: 2 }}>
//                 {successMessage}
//               </Alert>
//             )}

//             {error && (
//               <Alert severity="error" sx={{ mb: 2 }}>
//                 {error}
//               </Alert>
//             )}

//             {!dentroPeriodoValido ? (
//               <Box sx={{ mb: 4 }}>
//                 <Alert severity="warning" sx={{ mb: 2 }}>
//                   Las inspecciones solo están habilitadas hasta el día 10 de
//                   cada mes. Por favor, espere hasta el próximo mes para realizar
//                   una nueva inspección.
//                 </Alert>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={() =>
//                     router.push(
//                       "/dashboard/inspeccion-sistemas-emergencia/formulario-insp-herr-equi/form-sistemas-de-emergencia"
//                     )
//                   }
//                 >
//                   Volver al Panel
//                 </Button>
//               </Box>
//             ) : !showForm ? (
//               <Box sx={{ mb: 4 }}>
//                 <Typography variant="h6" gutterBottom>
//                   Seleccione primero el área y el TAG se completará
//                   automáticamente
//                 </Typography>
//                 <Grid container spacing={2} sx={{ mb: 2 }}>
//                   <Grid size={{ xs: 12, sm: 6 }}>
//                     <FormControl fullWidth disabled={tagOptions.length === 0}>
//                       <InputLabel id="tag-label">TAG</InputLabel>
//                       <Select
//                         labelId="tag-label"
//                         id="tag-select"
//                         value={tag}
//                         label="TAG"
//                         onChange={(e) =>
//                           handleTagChange(e.target.value as string)
//                         }
//                       >
//                         {tagOptions.map((option) => {
//                           const estado = determinarEstadoTag(option);
//                           const ubicacion =
//                             areaData.tagUbicaciones[option] || "";

//                           return (
//                             <MenuItem key={option} value={option}>
//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   width: "100%",
//                                 }}
//                               >
//                                 <Box sx={{ flexGrow: 1 }}>
//                                   <Typography
//                                     component="span"
//                                     sx={{ fontWeight: "bold" }}
//                                   >
//                                     {option}
//                                   </Typography>
//                                   {ubicacion && (
//                                     <Typography
//                                       component="span"
//                                       sx={{
//                                         ml: 1,
//                                         color: "text.secondary",
//                                         fontSize: "0.875rem",
//                                         fontStyle: "italic",
//                                       }}
//                                     >
//                                       ({ubicacion})
//                                     </Typography>
//                                   )}
//                                 </Box>

//                                 {estado === "completado" ? (
//                                   <CheckCircle
//                                     sx={{
//                                       color: "success.main",
//                                       fontSize: "1.2rem",
//                                       ml: 1,
//                                     }}
//                                     titleAccess="Todos los extintores inspeccionados"
//                                   />
//                                 ) : estado === "parcial" ? (
//                                   <Autorenew // Icono de recarga para estado parcial
//                                     sx={{
//                                       color: "warning.main",
//                                       fontSize: "1.2rem",
//                                       ml: 1,
//                                     }}
//                                     titleAccess="Algunos extintores inspeccionados"
//                                   />
//                                 ) : (
//                                   <LockClock
//                                     sx={{
//                                       color: "error.main",
//                                       fontSize: "1.2rem",
//                                       ml: 1,
//                                     }}
//                                     titleAccess="Ningún extintor inspeccionado"
//                                   />
//                                 )}
//                               </Box>
//                             </MenuItem>
//                           );
//                         })}
//                       </Select>
//                     </FormControl>
//                   </Grid>

//                   <Grid size={{ xs: 12, sm: 6 }}>
//                     <FormControl fullWidth>
//                       <InputLabel id="area-label">Área</InputLabel>
//                       <Select
//                         labelId="area-label"
//                         id="area-select"
//                         value={area}
//                         label="Área"
//                         onChange={(e) =>
//                           handleAreaChange(e.target.value as string)
//                         }
//                       >
//                         {areaOptions.map((option) => (
//                           <MenuItem key={option} value={option}>
//                             {option}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>

//                   <Grid size={{ xs: 12, sm: 6 }}>
//                     {area &&
//                       tag &&
//                       (TAGS_CON_SELECCION_EXTINTORES.includes(tag) ? (
//                         <ExtintoresChecklist
//                           tag={tag} // Asegura que el tag se pasa como área
//                           extintores={extintores}
//                           onExtintoresSeleccionados={
//                             handleExtintoresSeleccionados
//                           }
//                         />
//                       ) : (
//                         <Paper
//                           elevation={2}
//                           sx={{ p: 2, height: "100%", minHeight: "56px" }}
//                         >
//                           <ExtintoresVisualizacion
//                             tag={tag}
//                             extintores={extintores}
//                             totalExtintoresActivos={
//                               areaData.totalExtintoresActivos
//                             }
//                           />
//                         </Paper>
//                       ))}
//                   </Grid>
//                 </Grid>

//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={handleTagSubmit}
//                   disabled={loading || !tag}
//                 >
//                   {loading ? "Verificando..." : "Continuar"}
//                 </Button>
//               </Box>
//             ) : (
//               <form onSubmit={handleSubmit(onSubmit)}>
//                 {/* Mostrar InformacionGeneral solo si es formulario nuevo */}
//                 <InformacionGeneral
//                   control={control}
//                   errors={errors}
//                   soloLectura={esFormularioExistente} // Pasar prop soloLectura como true si es formulario existente
//                 />

//                 {/* Mostrar SistemasPasivos y Activos si no es solo extintores */}
//                 {!soloExtintores && (
//                   <>
//                     <SistemasPasivos
//                       control={control}
//                       currentMes={currentMes}
//                     />
//                     <SistemasActivos
//                       control={control}
//                       currentMes={currentMes}
//                     />
//                   </>
//                 )}

//                 {/* Siempre mostrar extintores */}
//                 <InspeccionExtintores
//                   control={control}
//                   currentMes={currentMes}
//                   extintores={
//                     TAGS_CON_SELECCION_EXTINTORES.includes(tag)
//                       ? extintoresSeleccionados
//                       : extintores
//                   }
//                 />

//                 {/* Mostrar InformacionInspector si no es solo extintores */}
//                 {!soloExtintores && (
//                   <InformacionInspector
//                     control={control}
//                     currentMes={currentMes}
//                     setValue={setValue}
//                     errors={errors}
//                   />
//                 )}

//                 <Box sx={{ mt: 4 }}>
//                   <Grid container spacing={2} justifyContent="space-between">
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Button
//                         variant="outlined"
//                         color="secondary"
//                         size="large"
//                         fullWidth
//                         onClick={resetForm}
//                         disabled={loading}
//                       >
//                         Cancelar
//                       </Button>
//                     </Grid>
//                     <Grid size={{ xs: 12, sm: 6 }}>
//                       <Button
//                         type="submit"
//                         variant="contained"
//                         color="primary"
//                         size="large"
//                         fullWidth
//                         disabled={formState.loading || formState.submitting}
//                       >
//                         {formState.loading || formState.submitting
//                           ? "Guardando..."
//                           : formState.soloExtintores
//                           ? "Guardar Inspección de Extintores"
//                           : "Guardar Inspección"}
//                       </Button>
//                     </Grid>
//                   </Grid>
//                 </Box>
//               </form>
//             )}
//           </Paper>
//         </>
//       )}
//     </Container>
//   );
// };
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Visibility,
  Autorenew,
  CheckCircle,
  LockClock,
} from "@mui/icons-material";

// Tipos
import {
  ExtintorBackend,
  type FormularioInspeccion,
  type Mes,
  TagConEstado,
  crearFormularioInicial,
} from "../../types/formTypes";

// Server Actions
import {
  actualizarExtintoresPorTag,
  obtenerTagsPorArea,
  obtenerExtintoresPorTag,
  verificarTag,
  actualizarMesPorTag,
  crearFormSistemasEmergencia,
  verificarInspecciones,
} from "@/app/actions/inspeccion";
import { obtenerAreas } from "@/lib/actions/area-actions";

// Constantes
import { MESES, TAGS_CON_SELECCION_EXTINTORES } from "@/lib/constants";

// Sub-componentes
import InformacionGeneral from "./InformacionGeneral";
import SistemasPasivos from "./SsitemasPasivos";
import SistemasActivos from "./SistemasActivos";
import InspeccionExtintores from "./InspeccionExtintores";
import InformacionInspector from "./InformacionInspector";
import ExtintoresChecklist from "./ExtintoresChecklist";
import ExtintoresVisualizacion from "./ExtintoresVisualizacion";
import { SuccessScreen } from "../SucessScreen";

// --- INTERFAZ PROPS ---
export interface InspectionFormProps {
  onCancel: () => void;
  initialData?: FormularioInspeccion;
  isEditMode?: boolean;
  readonly?: boolean;
  idInstancia?: string;
  onSaveUpdate?: (id: string, data: FormularioInspeccion) => Promise<void>;
}

// --- HELPERS ---
const obtenerMesActual = (): Mes => {
  return MESES[new Date().getMonth()];
};

const getPeriodoActual = (): "ENERO-JUNIO" | "JULIO-DICIEMBRE" => {
  const mesActual = obtenerMesActual();
  const mesesPrimerSemestre = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO"];
  return mesesPrimerSemestre.includes(mesActual) ? "ENERO-JUNIO" : "JULIO-DICIEMBRE";
};

const getAñoActual = (): number => new Date().getFullYear();
const getDiaActual = (): number => new Date().getDate();

// --- COMPONENTE PRINCIPAL ---
export const InspeccionSistemasEmergencia = ({
  onCancel,
  initialData,
  isEditMode = false,
  readonly = false,
  idInstancia,
  onSaveUpdate,
}: InspectionFormProps) => {
  //const router = useRouter();
  
  // Si estamos editando, usamos el mes guardado en la data, si no, el actual.
  const currentMes = initialData?.mesActual || obtenerMesActual();
  const submitInProgress = useRef(false);

  const [dentroPeriodoValido, setDentroPeriodoValido] = useState(true);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // --- CONFIGURACIÓN DEL FORMULARIO (React Hook Form) ---
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormularioInspeccion>({
    defaultValues: initialData || crearFormularioInicial(
      "", "", "", "", "",
      getPeriodoActual(),
      getAñoActual(),
      currentMes
    ),
  });

  // --- ESTADOS LOCALES ---
  const [formState, setFormState] = useState({
    loading: false,
    submitting: false,
    showForm: !!initialData, // Si hay datos iniciales, mostrar formulario directamente
    error: null as string | null,
    successMessage: null as string | null,
    esFormularioExistente: isEditMode, // Si estamos en modo edición, asumimos que existe
    soloExtintores: false,
  });

  const [areaData, setAreaData] = useState({
    tag: initialData?.tag || "",
    area: initialData?.area || "",
    areaOptions: [] as string[],
    tagOptions: [] as string[],
    extintores: [] as ExtintorBackend[],
    tagsConEstado: [] as TagConEstado[],
    extintoresSeleccionados: [] as ExtintorBackend[],
    tagsData: [] as TagConEstado[],
    totalExtintoresActivos: 0,
    tagUbicaciones: {} as Record<string, string>,
  });

  // --- EFECTO 1: CARGA INICIAL DE DATOS (EDICIÓN) ---
  useEffect(() => {
    if (initialData && initialData.tag) {
      const initEditData = async () => {
        try {
          setFormState(prev => ({ ...prev, loading: true }));
          
          let extintoresBase: ExtintorBackend[] = [];
          
          // Intentar obtener la definición base de extintores para este tag
          const tagResponse = await obtenerExtintoresPorTag(initialData.tag);
          extintoresBase = tagResponse.extintores || [];

          // Si es un tag de checklist especial (selección manual)
          let extSeleccionados: ExtintorBackend[] = [];
          
          if (TAGS_CON_SELECCION_EXTINTORES.includes(initialData.tag)) {
             const inspeccionados = initialData.meses[currentMes]?.inspeccionesExtintor || [];
             extSeleccionados = inspeccionados as unknown as ExtintorBackend[];
          }

          setAreaData(prev => ({
            ...prev,
            tag: initialData.tag,
            area: initialData.area,
            extintores: extintoresBase,
            extintoresSeleccionados: extSeleccionados,
            totalExtintoresActivos: tagResponse.totalExtintoresActivosArea || 0
          }));

        } catch (error) {
          console.error("Error inicializando datos de edición:", error);
        } finally {
          setFormState(prev => ({ ...prev, loading: false }));
        }
      };

      initEditData();
    }
  }, [initialData, currentMes]);

  // --- EFECTO 2: CARGAR ÁREAS (CREACIÓN) ---
  useEffect(() => {
    if (!initialData) {
      const cargarAreas = async () => {
        try {
          setFormState((prev) => ({ ...prev, loading: true }));
          const areas = await obtenerAreas();
          setAreaData((prev) => ({ ...prev, areaOptions: areas }));
        } catch (error) {
          console.error("Error al cargar áreas:", error);
          setFormState((prev) => ({ ...prev, error: "Error al cargar áreas." }));
        } finally {
          setFormState((prev) => ({ ...prev, loading: false }));
        }
      };
      cargarAreas();
    }
  }, [initialData]);

  // --- EFECTO 3: VALIDACIÓN DE FECHA ---
  useEffect(() => {
    if (isEditMode || readonly) {
      setDentroPeriodoValido(true);
      return;
    }

    const diaActual = getDiaActual();
    if (diaActual > 10) {
      setDentroPeriodoValido(true); 
    } else {
      setDentroPeriodoValido(true);
    }
  }, [isEditMode, readonly]);

  // --- EFECTO 4: ACTUALIZAR MES EN FORMULARIO ---
  useEffect(() => {
    if (!initialData) {
        setValue("mesActual", currentMes);
    }
  }, [currentMes, setValue, initialData]);


  // --- HANDLERS DE SELECCIÓN (SOLO CREACIÓN) ---

  const handleAreaChange = useCallback(async (selectedArea: string) => {
    try {
      setFormState((prev) => ({ ...prev, loading: true, error: null }));
      
      const tagsDelArea = await obtenerTagsPorArea(selectedArea);
      const tagsInspeccionados = await verificarInspecciones(selectedArea, currentMes);

      // Lógica para obtener ubicaciones y estados para los iconos
      const tagUbicacionesMap: Record<string, string> = {};
      
      // Obtener detalles de cada tag para los iconos y ubicaciones
      for (const tag of tagsDelArea) {
        try {
            const extintoresDelTag = await obtenerExtintoresPorTag(tag);
            if (extintoresDelTag.extintores && extintoresDelTag.extintores.length > 0) {
                tagUbicacionesMap[tag] = extintoresDelTag.extintores[0].Ubicacion || "";
            }
        } catch (e) {
            console.error(`Error extintores TAG ${tag}`, e);
            tagUbicacionesMap[tag] = "";
        }
      }

      const tagsConEstado = await Promise.all(
        tagsDelArea.map(async (tag) => {
          const ext = await obtenerExtintoresPorTag(tag);
          const totalActivos = ext.totalExtintoresActivosArea || 0;
          const estaInspeccionado = Array.isArray(tagsInspeccionados)
            ? tagsInspeccionados.some((
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              t: any) => t.tag === tag && t.inspeccionado)
            : false;
          
          return {
            tag,
            extintoresPendientes: ext.extintores?.length || 0,
            totalActivos: totalActivos,
            inspeccionado: estaInspeccionado,
          };
        })
      );

      const primerTag = tagsDelArea.length > 0 ? tagsDelArea[0] : "";
      
      // Si hay tags, cargamos los datos del primero
      let areaExtintores = { extintores: [], totalExtintoresActivosArea: 0 };
      if (primerTag) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
          areaExtintores = await obtenerExtintoresPorTag(primerTag) as any;
      }

      setAreaData((prev) => ({
        ...prev,
        area: selectedArea,
        tag: primerTag,
        tagOptions: tagsDelArea,
        tagsConEstado: tagsConEstado,
        extintores: areaExtintores.extintores || [],
        totalExtintoresActivos: areaExtintores.totalExtintoresActivosArea || 0,
        tagUbicaciones: tagUbicacionesMap,
        extintoresSeleccionados: [],
      }));

      setValue("tag", primerTag);
    } catch (error) {
      console.error("Error al obtener datos del área:", error);
      setFormState((prev) => ({ ...prev, error: "Error al cargar datos del área." }));
    } finally {
      setFormState((prev) => ({ ...prev, loading: false }));
    }
  }, [setValue, currentMes]);

  const handleTagChange = useCallback(async (selectedTag: string) => {
    try {
      setFormState((prev) => ({ ...prev, loading: true, error: null }));
      const tagExtintores = await obtenerExtintoresPorTag(selectedTag);

      setAreaData((prev) => ({
        ...prev,
        tag: selectedTag,
        extintores: tagExtintores.extintores || [],
      }));
      setValue("tag", selectedTag);
    } catch (error) {
      console.error("Error tag:", error);
    } finally {
      setFormState((prev) => ({ ...prev, loading: false }));
    }
  }, [setValue]);

  const determinarEstadoTag = (tag: string) => {
    const tagInfo = areaData.tagsConEstado.find((item) => item.tag === tag);
    if (!tagInfo) return "pendiente";
    if (tagInfo.totalActivos === 0) return "completado";
    if (tagInfo.extintoresPendientes === 0) return "completado";
    if (tagInfo.extintoresPendientes === tagInfo.totalActivos) return "pendiente";
    return "parcial";
  };

  const todosExtintoresSinInspeccionar = useCallback(() => {
    if (!areaData.extintores.length) return true;
    return !areaData.extintores.some((ext) => ext.inspeccionado === true);
  }, [areaData.extintores]);

  const handleExtintoresSeleccionados = useCallback((seleccionados: ExtintorBackend[]) => {
    setAreaData((prev) => ({ ...prev, extintoresSeleccionados: seleccionados }));
  }, []);

  const handleTagSubmit = async () => {
    if (!areaData.tag.trim()) {
      setFormState((prev) => ({ ...prev, error: "Seleccione un TAG." }));
      return;
    }

    try {
      setFormState((prev) => ({ ...prev, loading: true, error: null }));

      const datosIniciales = {
        tag: areaData.tag,
        periodo: getPeriodoActual(),
        año: getAñoActual(),
        mesActual: currentMes,
        area: areaData.area,
      };

      const response = await verificarTag(datosIniciales);
      const formularioExiste = response.existe;

      const mostrarSoloExtintores =
        formularioExiste &&
        todosExtintoresSinInspeccionar() &&
        response.formulario.meses?.[currentMes]?.inspeccionesExtintor?.length > 0;

      setAreaData((prev) => ({
        ...prev,
        extintores: response.extintores?.extintores || [],
      }));

      const formularioInicial = crearFormularioInicial(
        response.superintendencia || "",
        areaData.area,
        areaData.tag,
        response.formulario?.responsableEdificio || "",
        response.formulario?.edificio || "",
        getPeriodoActual(),
        getAñoActual(),
        currentMes
      );

      if (formularioExiste) {
        const mesAlmacenado = response.formulario.mesActual;
        if (mesAlmacenado === currentMes && !response.extintores?.extintores?.length) {
            setFormState(prev => ({ ...prev, error: "El formulario ya existe.", loading: false }));
            return;
        }

        setFormState((prev) => ({
            ...prev,
            esFormularioExistente: formularioExiste,
            soloExtintores: mostrarSoloExtintores,
            showForm: true,
            loading: false,
        }));
      } else {
        setFormState((prev) => ({
            ...prev,
            esFormularioExistente: false,
            soloExtintores: false,
            showForm: true,
            loading: false,
        }));
      }

      if (formularioExiste) {
         reset(response.formulario); 
      } else {
         reset(formularioInicial);
      }

    } catch (error) {
      console.error("Error verificando tag:", error);
      setFormState((prev) => ({ ...prev, error: "Error de servidor.", loading: false }));
    }
  };

  // --- SUBMIT ---
  const onSubmit = async (data: FormularioInspeccion) => {
    if (formState.submitting || readonly) return;

    try {
      setFormState((prev) => ({
        ...prev,
        loading: true,
        submitting: true,
        error: null,
      }));

      // 1. MODO EDICIÓN / ACTUALIZACIÓN DIRECTA
      if (isEditMode && idInstancia && onSaveUpdate) {
        await onSaveUpdate(idInstancia, data);
        
        setFormState((prev) => ({
          ...prev,
          successMessage: "¡Inspección actualizada correctamente!",
          loading: false,
        }));
        
        setTimeout(() => {
            onCancel(); 
        }, 1500);

      } else {
        // 2. MODO CREACIÓN
        if (formState.soloExtintores) {
          const extintoresData = {
            tag: areaData.tag,
            extintores: data.meses[currentMes].inspeccionesExtintor,
            area: areaData.area,
          };
          await actualizarExtintoresPorTag(areaData.tag, extintoresData);
        } else if (formState.esFormularioExistente) {
          await actualizarMesPorTag(
            areaData.tag,
            currentMes,
            data.meses[currentMes],
            areaData.area
          );
        } else {
          await crearFormSistemasEmergencia(data);
        }
        setShowSuccessScreen(true);
      }

    } catch (error) {
      console.error("Error submit:", error);
      setFormState((prev) => ({
        ...prev,
        error: "Error al guardar. Intente nuevamente.",
        loading: false,
        submitting: false,
      }));
    } finally {
      submitInProgress.current = false;
    }
  };

  const { loading, showForm, error, successMessage, esFormularioExistente, soloExtintores } = formState;
  const { tag, area, areaOptions, extintores, tagOptions, extintoresSeleccionados } = areaData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      {showSuccessScreen ? (
        <SuccessScreen
          title="¡Inspección Guardada Exitosamente!"
          message="Operación realizada correctamente."
          subtitle={`TAG: ${areaData.tag} - Área: ${areaData.area}`}
          autoRedirect={true}
          redirectDelay={3000}
          redirectPath="/dashboard/formularios-de-inspeccion"
        />
      ) : (
        <>
          {/* Header de Navegación */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Box display="flex" gap={2} alignItems="center">
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={onCancel}
                    sx={{
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    padding: { xs: "6px 12px", sm: "8px 16px" },
                    }}
                >
                    Volver
                </Button>
                {readonly && <Chip label="Solo Lectura" icon={<Visibility />} color="default" />}
                {isEditMode && <Chip label="Editando" icon={<Edit />} color="primary" />}
             </Box>
          </Box>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Formulario de Inspección de Seguridad
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Código: 3.02.P01.F17 - Rev. 2
            </Typography>

            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* ERROR DE FECHA */}
            {!dentroPeriodoValido && !isEditMode && !readonly && (
              <Box sx={{ mb: 4 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Las inspecciones solo están habilitadas hasta el día 10 de cada mes.
                </Alert>
                <Button variant="contained" onClick={onCancel}>Volver al Panel</Button>
              </Box>
            )}

            {/* SELECCIÓN DE ÁREA/TAG (Solo si no hay datos iniciales) */}
            {!initialData && !showForm && dentroPeriodoValido && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Seleccione primero el área y el TAG se completará automáticamente
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Área</InputLabel>
                      <Select
                        value={area}
                        label="Área"
                        onChange={(e) => handleAreaChange(e.target.value as string)}
                        disabled={loading}
                      >
                        {areaOptions.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* 🔥 AQUI ESTÁ EL SELECT DE TAG CON ICONOS Y ESTILOS PERSONALIZADOS */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth disabled={tagOptions.length === 0}>
                      <InputLabel id="tag-label">TAG</InputLabel>
                      <Select
                        labelId="tag-label"
                        id="tag-select"
                        value={tag}
                        label="TAG"
                        onChange={(e) => handleTagChange(e.target.value as string)}
                      >
                        {tagOptions.map((option) => {
                          const estado = determinarEstadoTag(option);
                          const ubicacion = areaData.tagUbicaciones[option] || "";

                          return (
                            <MenuItem key={option} value={option}>
                              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                                    {option}
                                  </Typography>
                                  {ubicacion && (
                                    <Typography
                                      component="span"
                                      sx={{ ml: 1, color: "text.secondary", fontSize: "0.875rem", fontStyle: "italic" }}
                                    >
                                      ({ubicacion})
                                    </Typography>
                                  )}
                                </Box>

                                {estado === "completado" ? (
                                  <CheckCircle sx={{ color: "success.main", fontSize: "1.2rem", ml: 1 }} titleAccess="Todos inspeccionados" />
                                ) : estado === "parcial" ? (
                                  <Autorenew sx={{ color: "warning.main", fontSize: "1.2rem", ml: 1 }} titleAccess="Parcialmente inspeccionado" />
                                ) : (
                                  <LockClock sx={{ color: "error.main", fontSize: "1.2rem", ml: 1 }} titleAccess="Pendiente" />
                                )}
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* VISUALIZACIÓN PREVIA */}
                {area && tag && (
                    TAGS_CON_SELECCION_EXTINTORES.includes(tag) ? (
                        <ExtintoresChecklist
                            tag={tag}
                            extintores={extintores}
                            onExtintoresSeleccionados={handleExtintoresSeleccionados}
                        />
                    ) : (
                        <Box mb={2}>
                            <ExtintoresVisualizacion
                                tag={tag}
                                extintores={extintores}
                                totalExtintoresActivos={areaData.totalExtintoresActivos}
                            />
                        </Box>
                    )
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTagSubmit}
                  disabled={loading || !tag}
                  sx={{ mt: 2 }}
                >
                  {loading ? "Verificando..." : "Continuar"}
                </Button>
              </Box>
            )}

            {/* FORMULARIO DE INSPECCIÓN */}
            {showForm && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <InformacionGeneral
                  control={control}
                  errors={errors}
                  soloLectura={esFormularioExistente || readonly}
                />

                {!soloExtintores && (
                  <>
                    <SistemasPasivos control={control} currentMes={currentMes} disabled={readonly} />
                    <SistemasActivos control={control} currentMes={currentMes} disabled={readonly} />
                  </>
                )}

                <InspeccionExtintores
                  control={control}
                  currentMes={currentMes}
                  extintores={
                    TAGS_CON_SELECCION_EXTINTORES.includes(tag)
                      ? extintoresSeleccionados
                      : extintores
                  }
                  disabled={readonly}
                />

                {!soloExtintores && (
                  <InformacionInspector
                    control={control}
                    currentMes={currentMes}
                    setValue={setValue}
                    errors={errors}
                    disabled={readonly}
                  />
                )}

                <Box sx={{ mt: 4 }}>
                  <Grid container spacing={2} justifyContent="space-between">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="large"
                        fullWidth
                        onClick={() => {
                            if (initialData) onCancel(); 
                            else reset(); 
                        }}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                    </Grid>
                    {!readonly && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            disabled={loading || formState.submitting}
                        >
                            {loading ? "Guardando..." : isEditMode ? "Actualizar Inspección" : "Guardar Inspección"}
                        </Button>
                        </Grid>
                    )}
                  </Grid>
                </Box>
              </form>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};