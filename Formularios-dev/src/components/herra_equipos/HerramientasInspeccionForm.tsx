// // components/form-filler/specialized/HerramientasInspeccionForm.tsx
// "use client";

// import React, { useState, useMemo, useRef } from "react";
// import { useForm, Controller, Path } from "react-hook-form";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Alert,
//   Grid,
//   Paper,
//   Chip,
//   Checkbox,
//   FormControlLabel,
//   FormControl,
//   FormLabel,
//   MenuItem,
// } from "@mui/material";
// import { Save, Send, CheckCircle, Warning } from "@mui/icons-material";

// // Importaciones
// import { VerificationFields } from "./VerificationsFields";
// import { SectionRenderer } from "./SectionRenderer";
// import {
//   FormTemplate,
//   FormDataHerraEquipos,
//   FormResponse,
// } from "./types/IProps";
// import { SignatureField } from "../molecules/team-member-signature/SigantureField";
// import { getFormConfig } from "./formConfig";
// import { GroupedQuestionWithGeneralObservation } from "./GroupedQuestionWithGeneralObservation";
// import VehicleDamageSelector, {
//   DamageMarker,
//   VehicleDamageSelectorRef,
// } from "./VehicleDamageSelector";

// // ==================== TIPOS EXTENDIDOS ====================
// interface HerraFormData extends FormDataHerraEquipos {
//   codigoColorTrimestre?: {
//     azul: boolean;
//     amarillo: boolean;
//     verde: boolean;
//     blanco: boolean;
//   };
//   vehicleDamages?: DamageMarker[];
//   vehicleImageBase64?: string;
//   descripcionAparato?: string;

//   accesoriosConfig?: {
//     [key: string]: {
//       cantidad: number;
//       tipoServicio: string;
//     };
//   };

//   tipoInspeccion?: "inicial" | "periodica";
//   certificacionMSC?: "si" | "no";
//   fechaProximaInspeccion?: string;
//   responsableProximaInspeccion?: string;

//   // datosTecnicos?: {
//   //   tag?: string;
//   //   tipo?: string;
//   //   capacidadNominal?: string;
//   //   personaInspecciona?: string;
//   //   fecha?: string;
//   // };

//   conclusion?: string;

//   observacionesGenerales?: string;
//   firmaInspector: {
//     realizadoPor: string;
//     firma: string;
//     fecha: string;
//   };
//   firmaSupervisor?: {
//     nombreSupervisor: string;
//     firma: string;
//     fecha: string;
//   };
// }

// interface HerraFormResponse extends FormResponse {
//   codigoColorTrimestre?: {
//     azul: boolean;
//     amarillo: boolean;
//     verde: boolean;
//     blanco: boolean;
//   };
//   vehicleDamages?: DamageMarker[];
//   vehicleImageBase64?: string;
//   tipoInspeccion?: "inicial" | "periodica";
//   certificacionMSC?: "si" | "no";
//   fechaProximaInspeccion?: string;
//   responsableProximaInspeccion?: string;

//   // datosTecnicos?: {
//   //   tag?: string;
//   //   tipo?: string;
//   //   capacidadNominal?: string;
//   //   personaInspecciona?: string;
//   //   fecha?: string;
//   // };
//   conclusion?: string;
//   descripcionAparato?: string;
//   observacionesGenerales?: string;

//   accesoriosConfig?: {
//     [key: string]: {
//       cantidad: number;
//       tipoServicio: string;
//     };
//   };
//   firmaInspector: {
//     realizadoPor: string;
//     firma: string;
//     fecha: string;
//   };
//   firmaSupervisor?: {
//     nombreSupervisor: string;
//     firma: string;
//     fecha: string;
//   };
// }

// // ==================== PROPS ====================
// interface UnifiedInspeccionFormProps {
//   template: FormTemplate;
//   onSave?: (data: HerraFormResponse) => void;
//   onSubmit?: (data: HerraFormResponse) => void;
//   readonly?: boolean;
//   initialData?: Partial<HerraFormData>;
// }

// // ==================== COMPONENTE PRINCIPAL ====================
// export const HerramientasInspeccionForm: React.FC<
//   UnifiedInspeccionFormProps
// > = ({ template, onSave, onSubmit, readonly = false, initialData }) => {
//   const [saveMessage, setSaveMessage] = useState<string | null>(null);
//   const vehicleDamageRef = useRef<VehicleDamageSelectorRef>(null);

//   // 🎯 Obtener configuración basada en el código del template
//   const formConfig = useMemo(
//     () => getFormConfig(template.code),
//     [template.code]
//   );

//   // 🎯 Configurar valores por defecto dinámicamente
//   const getDefaultValues = (): HerraFormData => {
//     const baseDefaults: HerraFormData = {
//       verification: {},
//       responses: {},
//       firmaInspector: {
//         realizadoPor: "",
//         firma: "",
//         fecha: new Date().toISOString().split("T")[0],
//       },
//     };

//     // Agregar código de color si es necesario
//     if (formConfig.hasCodigoColorTrimestre) {
//       baseDefaults.codigoColorTrimestre = {
//         azul: false,
//         amarillo: false,
//         verde: false,
//         blanco: false,
//       };
//     }

//     // Agregar firma de supervisor si es necesario
//     if (formConfig.hasFirmaSupervisor) {
//       baseDefaults.firmaSupervisor = {
//         nombreSupervisor: "",
//         firma: "",
//         fecha: new Date().toISOString().split("T")[0],
//       };
//     }

//     if (formConfig.hasConclusion) {
//       baseDefaults.conclusion = ""; // Inicialmente ninguno seleccionado
//     }

//     if (formConfig.formType === "grouped" && formConfig.groupedConfig) {
//       // Inicializar configuración de accesorios
//       const accesoriosIniciales: {
//         [key: string]: { cantidad: number; tipoServicio: string };
//       } = {};

//       formConfig.groupedConfig.columns
//         .filter((col) => col.applicability === "requiredWithCount")
//         .forEach((col) => {
//           accesoriosIniciales[col.key] = {
//             cantidad: 0,
//             tipoServicio: "", // Inicializar vacío
//           };
//         });

//       baseDefaults.accesoriosConfig = accesoriosIniciales;

//       if (formConfig.groupedConfig.hasDescripcionAparato) {
//         baseDefaults.descripcionAparato = "";
//       }
//     }

//     if (formConfig.hasVehicleDamage) {
//       baseDefaults.tipoInspeccion = undefined; // o 'inicial' como default
//     }

//     if (formConfig.hasVehicleDamage) {
//       baseDefaults.certificacionMSC = undefined; // o 'no' como default
//     }

//     if (formConfig.hasObservacionesGenerales) {
//       baseDefaults.observacionesGenerales = "";
//     }

//     return baseDefaults;
//   };

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//   } = useForm<HerraFormData>({
//     defaultValues: getDefaultValues(),
//   });

//   const handleSaveDraft = async (data: HerraFormData) => {
//     let annotatedImageBase64: string | undefined;
//     if (vehicleDamageRef.current) {
//       annotatedImageBase64 =
//         (await vehicleDamageRef.current.generateBase64()) || undefined;
//     }

//     const formResponse: HerraFormResponse = {
//       templateId: template._id,
//       verificationData: data.verification,
//       responses: data.responses,
//       firmaInspector: data.firmaInspector,
//       submittedAt: new Date(),
//       status: "draft",
//     };

//     // Agregar campos opcionales si existen
//     if (data.codigoColorTrimestre) {
//       formResponse.codigoColorTrimestre = data.codigoColorTrimestre;
//     }
//     if (data.firmaSupervisor) {
//       formResponse.firmaSupervisor = data.firmaSupervisor;
//     }

//     if (formConfig.formType === "grouped" && data.accesoriosConfig) {
//       formResponse.accesoriosConfig = data.accesoriosConfig;
//     }

//     if (data.descripcionAparato) {
//       // 🆕 Incluir descripción
//       formResponse.descripcionAparato = data.descripcionAparato;
//     }

//     if (data.observacionesGenerales) {
//       // 🆕 Incluir observaciones
//       formResponse.observacionesGenerales = data.observacionesGenerales;
//     }

//     if (data.vehicleDamages) {
//       formResponse.vehicleDamages = data.vehicleDamages;
//     }

//     if (annotatedImageBase64) {
//       formResponse.vehicleImageBase64 = annotatedImageBase64;
//     }

//     if (data.tipoInspeccion) {
//       formResponse.tipoInspeccion = data.tipoInspeccion;
//     }
//     if (data.certificacionMSC) {
//       formResponse.certificacionMSC = data.certificacionMSC;
//     }

//     console.log(formResponse.vehicleImageBase64);

//     console.log("Guardando borrador:", formResponse);
//     setSaveMessage("Borrador guardado exitosamente");
//     setTimeout(() => setSaveMessage(null), 3000);

//     if (onSave) onSave(formResponse);
//   };

//   const handleFinalSubmit = (data: HerraFormData) => {
//     const formResponse: HerraFormResponse = {
//       templateId: template._id,
//       verificationData: data.verification,
//       responses: data.responses,
//       firmaInspector: data.firmaInspector,
//       submittedAt: new Date(),
//       status: "completed",
//     };

//     // Agregar campos opcionales si existen
//     if (data.codigoColorTrimestre) {
//       formResponse.codigoColorTrimestre = data.codigoColorTrimestre;
//     }
//     if (data.firmaSupervisor) {
//       formResponse.firmaSupervisor = data.firmaSupervisor;
//     }

//     if (data.descripcionAparato) {
//       // 🆕 Incluir descripción
//       formResponse.descripcionAparato = data.descripcionAparato;
//     }

//     if (data.observacionesGenerales) {
//       formResponse.observacionesGenerales = data.observacionesGenerales;
//     }

//     console.log("Enviando formulario:", formResponse);
//     setSaveMessage("Formulario enviado exitosamente");

//     if (onSubmit) onSubmit(formResponse);
//   };

//   return (
//     <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
//       {/* ==================== HEADER ==================== */}
//       <Card sx={{ mb: 3, backgroundColor: "#1976d2", color: "white" }}>
//         <CardContent>
//           <Typography variant="h4" gutterBottom>
//             {template.name}
//           </Typography>
//           <Box display="flex" gap={2} flexWrap="wrap">
//             <Chip
//               label={`Código: ${template.code}`}
//               sx={{ backgroundColor: "white" }}
//             />
//             <Chip label={template.revision} sx={{ backgroundColor: "white" }} />
//             <Chip
//               label={
//                 template.type === "interna"
//                   ? "Inspección Interna"
//                   : "Inspección Externa"
//               }
//               sx={{ backgroundColor: "white" }}
//             />
//             <Chip
//               label={formConfig.name}
//               color="secondary"
//               sx={{ backgroundColor: "white" }}
//             />
//           </Box>
//         </CardContent>
//       </Card>

//       {saveMessage && (
//         <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
//           {saveMessage}
//         </Alert>
//       )}

//       <form onSubmit={handleSubmit(handleFinalSubmit)}>
//         // Agregar este componente en HerramientasInspeccionForm.tsx, DESPUÉS de
//         VerificationFields
//         {formConfig.hasVehicleDamage && (
//           <Paper
//             elevation={3}
//             sx={{
//               p: 3,
//               mb: 3,
//               border: "2px solid #1976d2",
//               backgroundColor: "#f8f9fa",
//             }}
//           >
//             <Grid container spacing={3} alignItems="center">
//               {/* INSPECCIÓN */}

//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Box>
//                   <Typography
//                     variant="subtitle1"
//                     sx={{
//                       fontWeight: "bold",
//                       mb: 2,
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 1,
//                     }}
//                   >
//                     📋 INSPECCIÓN:
//                   </Typography>

//                   <Controller
//                     name="tipoInspeccion"
//                     control={control}
//                     rules={{
//                       required: "Debe seleccionar un tipo de inspección",
//                     }}
//                     render={({ field }) => (
//                       <Box sx={{ display: "flex", gap: 2 }}>
//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               checked={field.value === "inicial"}
//                               onChange={() => field.onChange("inicial")}
//                               disabled={readonly}
//                               sx={{
//                                 "&.Mui-checked": { color: "#1976d2" },
//                               }}
//                             />
//                           }
//                           label={
//                             <Typography
//                               sx={{ fontWeight: "bold", fontSize: "1rem" }}
//                             >
//                               INICIAL
//                             </Typography>
//                           }
//                           sx={{
//                             border:
//                               field.value === "inicial"
//                                 ? "3px solid #1976d2"
//                                 : "2px solid #000",
//                             p: 1.5,
//                             m: 0,
//                             flex: 1,
//                             backgroundColor:
//                               field.value === "inicial" ? "#e3f2fd" : "#fff",
//                             transition: "all 0.3s ease",
//                             borderRadius: 1,
//                           }}
//                         />

//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               checked={field.value === "periodica"}
//                               onChange={() => field.onChange("periodica")}
//                               disabled={readonly}
//                               sx={{
//                                 "&.Mui-checked": { color: "#1976d2" },
//                               }}
//                             />
//                           }
//                           label={
//                             <Typography
//                               sx={{ fontWeight: "bold", fontSize: "1rem" }}
//                             >
//                               PERIÓDICA
//                             </Typography>
//                           }
//                           sx={{
//                             border:
//                               field.value === "periodica"
//                                 ? "3px solid #1976d2"
//                                 : "2px solid #000",
//                             p: 1.5,
//                             m: 0,
//                             flex: 1,
//                             backgroundColor:
//                               field.value === "periodica" ? "#e3f2fd" : "#fff",
//                             transition: "all 0.3s ease",
//                             borderRadius: 1,
//                           }}
//                         />
//                       </Box>
//                     )}
//                   />
//                   {errors.tipoInspeccion && (
//                     <Typography
//                       color="error"
//                       variant="caption"
//                       sx={{ mt: 1, display: "block" }}
//                     >
//                       {errors.tipoInspeccion.message}
//                     </Typography>
//                   )}
//                 </Box>
//               </Grid>

//               {/* CERTIFICACIÓN MSC */}
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Box>
//                   <Typography
//                     variant="subtitle1"
//                     sx={{
//                       fontWeight: "bold",
//                       mb: 2,
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 1,
//                     }}
//                   >
//                     ✅ CERTIFICACIÓN MSC:
//                   </Typography>

//                   <Controller
//                     name="certificacionMSC"
//                     control={control}
//                     rules={{ required: "Debe seleccionar una opción" }}
//                     render={({ field }) => (
//                       <Box sx={{ display: "flex", gap: 2 }}>
//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               checked={field.value === "si"}
//                               onChange={() => field.onChange("si")}
//                               disabled={readonly}
//                               sx={{
//                                 "&.Mui-checked": { color: "#4caf50" },
//                               }}
//                             />
//                           }
//                           label={
//                             <Typography
//                               sx={{ fontWeight: "bold", fontSize: "1rem" }}
//                             >
//                               SI
//                             </Typography>
//                           }
//                           sx={{
//                             border:
//                               field.value === "si"
//                                 ? "3px solid #4caf50"
//                                 : "2px solid #000",
//                             p: 1.5,
//                             m: 0,
//                             flex: 1,
//                             backgroundColor:
//                               field.value === "si" ? "#e8f5e9" : "#fff",
//                             transition: "all 0.3s ease",
//                             borderRadius: 1,
//                           }}
//                         />

//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               checked={field.value === "no"}
//                               onChange={() => field.onChange("no")}
//                               disabled={readonly}
//                               sx={{
//                                 "&.Mui-checked": { color: "#f44336" },
//                               }}
//                             />
//                           }
//                           label={
//                             <Typography
//                               sx={{ fontWeight: "bold", fontSize: "1rem" }}
//                             >
//                               NO
//                             </Typography>
//                           }
//                           sx={{
//                             border:
//                               field.value === "no"
//                                 ? "3px solid #f44336"
//                                 : "2px solid #000",
//                             p: 1.5,
//                             m: 0,
//                             flex: 1,
//                             backgroundColor:
//                               field.value === "no" ? "#ffebee" : "#fff",
//                             transition: "all 0.3s ease",
//                             borderRadius: 1,
//                           }}
//                         />
//                       </Box>
//                     )}
//                   />
//                   {errors.certificacionMSC && (
//                     <Typography
//                       color="error"
//                       variant="caption"
//                       sx={{ mt: 1, display: "block" }}
//                     >
//                       {errors.certificacionMSC.message}
//                     </Typography>
//                   )}
//                 </Box>
//               </Grid>
//             </Grid>
//           </Paper>
//         )}
//         {/* ==================== CAMPOS DE VERIFICACIÓN ==================== */}
//         <VerificationFields
//           fields={template.verificationFields}
//           control={control}
//           errors={errors}
//           readonly={readonly}
//         />
//         {/* ==================== CAMPOS ESPECÍFICOS PARA FORMULARIOS AGRUPADOS ==================== */}
//         {formConfig.formType === "grouped" && formConfig.groupedConfig && (
//           <Paper
//             elevation={3}
//             sx={{ p: 3, mb: 3, border: "2px solid #2196f3" }}
//           >
//             <Box sx={{ mt: 3 }}>
//               <Typography
//                 variant="subtitle1"
//                 gutterBottom
//                 sx={{
//                   fontWeight: "bold",
//                   color: "#000",
//                   mb: 2,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                 }}
//               >
//                 📊 Cantidad de Accesorios de Izaje a Inspeccionar
//                 <Chip
//                   label="Registro obligatorio"
//                   size="small"
//                   sx={{
//                     backgroundColor: "#ffc107",
//                     color: "#000",
//                     fontWeight: "bold",
//                   }}
//                 />
//               </Typography>

//               <Grid container spacing={2}>
//                 {formConfig.groupedConfig.columns
//                   .filter((col) => col.applicability === "requiredWithCount")
//                   .map((column) => (
//                     <Grid size={{ xs: 6, sm: 3 }} key={column.key}>
//                       <Controller
//                         name={`accesoriosConfig.${column.key}.cantidad`}
//                         control={control}
//                         defaultValue={0}
//                         rules={{
//                           required: "Ingrese cantidad",
//                           min: { value: 0, message: "Mínimo 0" },
//                         }}
//                         render={({ field, fieldState }) => (
//                           <TextField
//                             {...field}
//                             fullWidth
//                             type="number"
//                             label={column.label}
//                             placeholder="0"
//                             error={!!fieldState.error}
//                             helperText={fieldState.error?.message}
//                             disabled={readonly}
//                             InputProps={{
//                               inputProps: { min: 0 },
//                             }}
//                             sx={{
//                               "& .MuiOutlinedInput-root": {
//                                 backgroundColor: "#fff9c4",
//                                 "& fieldset": {
//                                   borderColor: "#fbc02d",
//                                   borderWidth: 2,
//                                 },
//                                 "&:hover fieldset": {
//                                   borderColor: "#f9a825",
//                                 },
//                                 "&.Mui-focused fieldset": {
//                                   borderColor: "#f57f17",
//                                 },
//                               },
//                               "& .MuiInputLabel-root": {
//                                 fontWeight: "bold",
//                                 color: "#000",
//                               },
//                               "& input": {
//                                 fontWeight: "bold",
//                                 fontSize: "1.1rem",
//                                 textAlign: "center",
//                               },
//                             }}
//                           />
//                         )}
//                       />
//                     </Grid>
//                   ))}
//               </Grid>

//               {formConfig.groupedConfig.notaImportante && (
//                 <Alert severity="warning" sx={{ mt: 2 }}>
//                   <Typography variant="body2" sx={{ fontWeight: "bold" }}>
//                     ⚠️ Nota Importante:
//                   </Typography>
//                   <Typography variant="body2">
//                     {formConfig.groupedConfig.notaImportante}
//                   </Typography>
//                 </Alert>
//               )}
//             </Box>
//           </Paper>
//         )}
//         {/* ==================== CÓDIGO DE COLOR (CONDICIONAL) ==================== */}
//         {formConfig.hasCodigoColorTrimestre && (
//           <Paper elevation={3} sx={{ p: 3, mb: 3, border: "2px solid #000" }}>
//             <FormControl component="fieldset" fullWidth>
//               <FormLabel
//                 component="legend"
//                 sx={{
//                   fontWeight: "bold",
//                   fontSize: "1.1rem",
//                   color: "#000",
//                   mb: 2,
//                   textAlign: "center",
//                   border: "2px solid #000",
//                   p: 1,
//                   backgroundColor: "#f5f5f5",
//                 }}
//               >
//                 CÓDIGO DE COLOR DEL TRIMESTRE
//               </FormLabel>

//               <Grid container spacing={2}>
//                 {[
//                   {
//                     name: "azul",
//                     label: "Azul",
//                     color: "#1976d2",
//                     bg: "#e3f2fd",
//                   },
//                   {
//                     name: "amarillo",
//                     label: "Amarillo",
//                     color: "#fbc02d",
//                     bg: "#fff9c4",
//                   },
//                   {
//                     name: "verde",
//                     label: "Verde",
//                     color: "#388e3c",
//                     bg: "#c8e6c9",
//                   },
//                   {
//                     name: "blanco",
//                     label: "Blanco",
//                     color: "#000",
//                     bg: "#fff",
//                   },
//                 ].map(({ name, label, color, bg }) => (
//                   <Grid size={{ xs: 6 }} key={name}>
//                     <Controller
//                       name={
//                         `codigoColorTrimestre.${name}` as Path<HerraFormData>
//                       }
//                       control={control}
//                       render={({ field }) => (
//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               {...field}
//                               checked={Boolean(field.value)}
//                               disabled={readonly}
//                               sx={{ "&.Mui-checked": { color } }}
//                             />
//                           }
//                           label={
//                             <Typography
//                               sx={{ fontWeight: "bold", fontSize: "1rem" }}
//                             >
//                               {label}
//                             </Typography>
//                           }
//                           sx={{
//                             border: "2px solid #000",
//                             p: 1,
//                             m: 0,
//                             width: "100%",
//                             backgroundColor: bg,
//                           }}
//                         />
//                       )}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </FormControl>
//           </Paper>
//         )}
//         {/* ==================== SECCIONES NORMALES ==================== */}
//         {template.sections && template.sections.length > 0 && (
//           <Box mb={3}>
//             {/* Mostrar instrucciones si es formulario agrupado */}
//             {formConfig.formType === "grouped" &&
//               formConfig.groupedConfig?.instructionText && (
//                 <Alert severity="info" sx={{ mb: 2 }}>
//                   <Typography variant="body2">
//                     {formConfig.groupedConfig.instructionText}
//                   </Typography>
//                 </Alert>
//               )}

//             <Typography variant="h6" gutterBottom sx={{ px: 2 }}>
//               {formConfig.formType === "grouped"
//                 ? "Criterios y Aspectos Sujetos a Inspección Visual"
//                 : "Preguntas de Inspección"}
//             </Typography>

//             {template.sections.map((section, sIdx) => (
//               <Box key={section._id || sIdx}>
//                 {formConfig.formType === "grouped" ? (
//                   section.questions.map((question, qIdx) => (
//                     <GroupedQuestionWithGeneralObservation
//                       key={question._id || qIdx}
//                       question={question}
//                       sectionPath={`responses.s${sIdx}`}
//                       questionIndex={qIdx}
//                       control={control}
//                       errors={errors}
//                       readonly={readonly}
//                       formConfig={formConfig}
//                     />
//                   ))
//                 ) : (
//                   // ✅ RENDERIZADO NORMAL (Amoladora, Cilindros, etc.)
//                   <SectionRenderer
//                     section={section}
//                     sectionPath={`responses.s${sIdx}`}
//                     control={control}
//                     errors={errors}
//                     readonly={readonly}
//                     formConfig={formConfig}
//                   />
//                 )}
//               </Box>
//             ))}
//           </Box>
//         )}
//         {/* ==================== TIPO DE SERVICIO (SELECT) ==================== */}
//         {formConfig.formType === "grouped" &&
//           formConfig.groupedConfig?.hasTipoServicio && (
//             <Paper
//               elevation={3}
//               sx={{
//                 p: 3,
//                 mb: 3,
//                 border: "2px solid #4caf50",
//                 backgroundColor: "#f1f8e9",
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 gutterBottom
//                 sx={{
//                   fontWeight: "bold",
//                   color: "#2e7d32",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                   mb: 3,
//                 }}
//               >
//                 🏷️ Tipo de Servicio por Accesorio
//               </Typography>

//               <Grid container spacing={3}>
//                 {formConfig.groupedConfig.columns
//                   .filter((col) => col.applicability === "requiredWithCount")
//                   .map((column) => (
//                     <Grid size={{ xs: 12, md: 6 }} key={column.key}>
//                       <Box sx={{ mb: 2 }}>
//                         <Typography
//                           variant="subtitle1"
//                           sx={{
//                             fontWeight: "bold",
//                             mb: 1,
//                             color: "#1976d2",
//                           }}
//                         >
//                           {column.label}
//                         </Typography>
//                         <Controller
//                           name={`accesoriosConfig.${column.key}.tipoServicio`}
//                           control={control}
//                           rules={{
//                             required: `Seleccione tipo de servicio para ${column.label}`,
//                           }}
//                           render={({ field, fieldState }) => (
//                             <TextField
//                               {...field}
//                               fullWidth
//                               select
//                               label={`Tipo de Servicio - ${column.label}`}
//                               value={field.value || ""}
//                               error={!!fieldState.error}
//                               helperText={fieldState.error?.message}
//                               disabled={readonly}
//                               sx={{
//                                 "& .MuiOutlinedInput-root": {
//                                   backgroundColor: "#e8f5e9",
//                                   "& fieldset": {
//                                     borderColor: "#4caf50",
//                                   },
//                                 },
//                               }}
//                             >
//                               <MenuItem value="">
//                                 <em>Seleccione tipo</em>
//                               </MenuItem>
//                               <MenuItem value="N">N - Normal</MenuItem>
//                               <MenuItem value="S">S - Severo</MenuItem>
//                               <MenuItem value="ES">ES - Especial</MenuItem>
//                             </TextField>
//                           )}
//                         />
//                       </Box>
//                     </Grid>
//                   ))}
//               </Grid>

//               {/* Leyenda de tipos */}
//               <Box
//                 sx={{
//                   mt: 2,
//                   p: 2,
//                   backgroundColor: "#e3f2fd",
//                   borderRadius: 1,
//                 }}
//               >
//                 <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
//                   📋 Descripción de Tipos de Servicio:
//                 </Typography>
//                 <Typography variant="body2" sx={{ mb: 0.5 }}>
//                   • <strong>N - Normal:</strong> Uso estándar sin condiciones
//                   especiales
//                 </Typography>
//                 <Typography variant="body2" sx={{ mb: 0.5 }}>
//                   • <strong>S - Severo:</strong> Condiciones de trabajo
//                   exigentes
//                 </Typography>
//                 <Typography variant="body2">
//                   • <strong>ES - Especial:</strong> Aplicaciones específicas o
//                   críticas
//                 </Typography>
//               </Box>
//             </Paper>
//           )}
//         {/* ==================== ALERTAS (DINÁMICAS) ==================== */}
//         {formConfig.showAlerts.error && formConfig.alerts.error && (
//           <Paper
//             elevation={3}
//             sx={{ p: 3, mb: 3, border: "3px solid #f44336" }}
//           >
//             <Alert severity="error" icon={<Warning />}>
//               <Typography
//                 variant="body1"
//                 fontWeight="bold"
//                 gutterBottom
//                 color="error"
//               >
//                 {formConfig.alerts.error.title}
//               </Typography>
//               <Typography variant="body1" color="error">
//                 {formConfig.alerts.error.description}
//               </Typography>
//             </Alert>
//           </Paper>
//         )}
//         {formConfig.showAlerts.success && formConfig.alerts.success && (
//           <Paper
//             elevation={3}
//             sx={{ p: 3, mb: 3, border: "3px solid #36f462ff" }}
//           >
//             <Alert severity="success">
//               <Typography variant="body2">
//                 {formConfig.alerts.success.message}
//               </Typography>
//             </Alert>
//           </Paper>
//         )}
//         {formConfig.showAlerts.info && formConfig.alerts.info && (
//           <Paper
//             elevation={3}
//             sx={{ p: 3, mb: 3, border: "3px solid #2196f3" }}
//           >
//             <Alert severity="info">
//               <Typography variant="body2">
//                 {formConfig.alerts.info.message}
//               </Typography>
//             </Alert>
//           </Paper>
//         )}
//         {formConfig.showAlerts.warning && formConfig.alerts.warning && (
//           <Paper
//             elevation={3}
//             sx={{ p: 3, mb: 3, border: "3px solid #ff9800" }}
//           >
//             <Alert severity="warning">
//               <Typography variant="body1" fontWeight="bold" gutterBottom>
//                 {formConfig.alerts.warning.title}
//               </Typography>
//               <Typography variant="body2">
//                 {formConfig.alerts.warning.description}
//               </Typography>
//             </Alert>
//           </Paper>
//         )}
//         {formConfig.hasConclusion && (
//           <Paper elevation={3} sx={{ p: 3, mb: 3, border: "2px solid #000" }}>
//             <FormControl component="fieldset" fullWidth>
//               <FormLabel
//                 component="legend"
//                 sx={{
//                   fontWeight: "bold",
//                   fontSize: "1.1rem",
//                   color: "#000",
//                   mb: 2,
//                   textAlign: "center",
//                   border: "2px solid #000",
//                   p: 1,
//                   backgroundColor: "#f5f5f5",
//                 }}
//               >
//                 Conclusión
//               </FormLabel>

//               <Controller
//                 name="conclusion"
//                 control={control}
//                 rules={{ required: "Debe seleccionar una conclusión" }}
//                 render={({ field }) => (
//                   <Grid container spacing={2}>
//                     {[
//                       {
//                         value: "APTO",
//                         label: "APTO",
//                         color: "#1976d2",
//                         bg: "#e3f2fd",
//                       },
//                       {
//                         value: "MANTENIMIENTO",
//                         label: "MANTENIMIENTO",
//                         color: "#fbc02d",
//                         bg: "#fff9c4",
//                       },
//                       {
//                         value: "RECHAZADO",
//                         label: "RECHAZADO",
//                         color: "#e60000",
//                         bg: "#ffcdd2",
//                       },
//                     ].map(({ value, label, color, bg }) => (
//                       <Grid size={{ xs: 12, sm: 4 }} key={value}>
//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               checked={field.value === value}
//                               onChange={() => field.onChange(value)}
//                               disabled={readonly}
//                               sx={{ "&.Mui-checked": { color } }}
//                             />
//                           }
//                           label={
//                             <Typography
//                               sx={{ fontWeight: "bold", fontSize: "1rem" }}
//                             >
//                               {label}
//                             </Typography>
//                           }
//                           sx={{
//                             border:
//                               field.value === value
//                                 ? `3px solid ${color}`
//                                 : "2px solid #000",
//                             p: 1,
//                             m: 0,
//                             width: "100%",
//                             backgroundColor:
//                               field.value === value ? bg : "#fff",
//                             transition: "all 0.3s ease",
//                           }}
//                         />
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}
//               />
//               {errors.conclusion && (
//                 <Typography color="error" variant="caption" sx={{ mt: 1 }}>
//                   {errors.conclusion.message}
//                 </Typography>
//               )}
//             </FormControl>
//           </Paper>
//         )}
//         {formConfig.hasVehicleDamage && (
//           <VehicleDamageSelector
//             ref={vehicleDamageRef}
//             vehicleImageUrl="/image.png"
//             control={control}
//             setValue={setValue}
//             damageFieldName="vehicleDamages"
//             readonly={readonly}
//           />
//         )}
//         {formConfig.hasObservacionesGenerales &&
//           formConfig.observacionesGenerales && (
//             <Paper
//               elevation={3}
//               sx={{
//                 p: 3,
//                 mb: 3,
//                 border: "2px solid #9e9e9e",
//                 backgroundColor: "#fafafa",
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 gutterBottom
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                   mb: 2,
//                 }}
//               >
//                 📝 {formConfig.observacionesGenerales.label}
//                 {formConfig.observacionesGenerales.required && (
//                   <Chip label="Obligatorio" size="small" color="error" />
//                 )}
//               </Typography>

//               <Controller
//                 name="observacionesGenerales"
//                 control={control}
//                 rules={{
//                   required: formConfig.observacionesGenerales.required
//                     ? "Las observaciones son obligatorias"
//                     : false,
//                   maxLength: formConfig.observacionesGenerales.maxLength
//                     ? {
//                         value: formConfig.observacionesGenerales.maxLength,
//                         message: `Máximo ${formConfig.observacionesGenerales.maxLength} caracteres`,
//                       }
//                     : undefined,
//                 }}
//                 render={({ field, fieldState }) => (
//                   <TextField
//                     {...field}
//                     fullWidth
//                     multiline
//                     rows={6}
//                     placeholder={formConfig.observacionesGenerales?.placeholder}
//                     error={!!fieldState.error}
//                     helperText={
//                       fieldState.error?.message ||
//                       formConfig.observacionesGenerales?.helperText ||
//                       (formConfig.observacionesGenerales?.maxLength
//                         ? `${field.value?.length || 0}/${
//                             formConfig.observacionesGenerales.maxLength
//                           } caracteres`
//                         : undefined)
//                     }
//                     disabled={readonly}
//                     sx={{
//                       "& .MuiOutlinedInput-root": {
//                         backgroundColor: "white",
//                       },
//                     }}
//                   />
//                 )}
//               />
//             </Paper>
//           )}
//         {/* DESPUÉS del VehicleDamageSelector, ANTES de las firmas */}
//         {formConfig.hasVehicleDamage && (
//           <Paper
//             elevation={3}
//             sx={{
//               p: 3,
//               mb: 3,
//               border: "2px solid #757575",
//               backgroundColor: "#f5f5f5",
//             }}
//           >
//             <Typography
//               variant="h6"
//               gutterBottom
//               sx={{
//                 fontWeight: "bold",
//                 color: "#424242",
//                 mb: 3,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 1,
//               }}
//             >
//               📅 Programación de Próxima Inspección
//             </Typography>

//             <Grid container spacing={3}>
//               {/* FECHA PROXIMA INSPECCIÓN */}
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Box
//                   sx={{
//                     backgroundColor: "#e0e0e0",
//                     border: "2px solid #000",
//                     borderRadius: 1,
//                     p: 2,
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     sx={{
//                       fontWeight: "bold",
//                       fontSize: "1rem",
//                       mb: 2,
//                       textAlign: "center",
//                       color: "#000",
//                     }}
//                   >
//                     FECHA PROXIMA INSPECCIÓN
//                   </Typography>

//                   <Controller
//                     name="fechaProximaInspeccion"
//                     control={control}
//                     rules={{
//                       required: "La fecha de próxima inspección es obligatoria",
//                     }}
//                     render={({ field, fieldState }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         type="date"
//                         InputLabelProps={{ shrink: true }}
//                         error={!!fieldState.error}
//                         helperText={fieldState.error?.message}
//                         disabled={readonly}
//                         sx={{
//                           "& .MuiOutlinedInput-root": {
//                             backgroundColor: "#fff",
//                             "& fieldset": {
//                               borderColor: "#000",
//                               borderWidth: 2,
//                             },
//                             "&:hover fieldset": {
//                               borderColor: "#000",
//                             },
//                             "&.Mui-focused fieldset": {
//                               borderColor: "#1976d2",
//                             },
//                           },
//                           "& input": {
//                             fontWeight: "bold",
//                             fontSize: "1rem",
//                             textAlign: "center",
//                             color: "#000",
//                           },
//                         }}
//                       />
//                     )}
//                   />
//                 </Box>
//               </Grid>

//               {/* RESPONSABLE DE PROX. INSP. */}
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <Box
//                   sx={{
//                     backgroundColor: "#e0e0e0",
//                     border: "2px solid #000",
//                     borderRadius: 1,
//                     p: 2,
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle1"
//                     sx={{
//                       fontWeight: "bold",
//                       fontSize: "1rem",
//                       mb: 2,
//                       textAlign: "center",
//                       color: "#000",
//                     }}
//                   >
//                     RESPONSABLE DE PROX. INSP.
//                   </Typography>

//                   <Controller
//                     name="responsableProximaInspeccion"
//                     control={control}
//                     rules={{
//                       required:
//                         "El responsable de próxima inspección es obligatorio",
//                     }}
//                     render={({ field, fieldState }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         placeholder="Ingrese nombre del responsable"
//                         error={!!fieldState.error}
//                         helperText={fieldState.error?.message}
//                         disabled={readonly}
//                         sx={{
//                           "& .MuiOutlinedInput-root": {
//                             backgroundColor: "#fff",
//                             "& fieldset": {
//                               borderColor: "#000",
//                               borderWidth: 2,
//                             },
//                             "&:hover fieldset": {
//                               borderColor: "#000",
//                             },
//                             "&.Mui-focused fieldset": {
//                               borderColor: "#1976d2",
//                             },
//                           },
//                           "& input": {
//                             fontWeight: "bold",
//                             fontSize: "1rem",
//                             color: "#000",
//                           },
//                         }}
//                       />
//                     )}
//                   />
//                 </Box>
//               </Grid>
//             </Grid>

//             <Alert severity="info" sx={{ mt: 3 }}>
//               <Typography variant="body2">
//                 <strong>ℹ️ Información:</strong> Estos datos se utilizan para
//                 programar la siguiente inspección del vehículo.
//               </Typography>
//             </Alert>
//           </Paper>
//         )}
//         {(formConfig.hasFirmaInspector || formConfig.hasFirmaSupervisor) && (
//           <Paper
//             sx={{
//               p: 3,
//               mb: 3,
//               border: formConfig.hasFirmaSupervisor
//                 ? "2px solid #ff6f00"
//                 : "2px solid #1976d2",
//             }}
//           >
//             <Box sx={{ mb: formConfig.hasFirmaSupervisor ? 4 : 0 }}>
//               <Typography
//                 variant="subtitle1"
//                 gutterBottom
//                 sx={{
//                   backgroundColor: "#e3f2fd",
//                   p: 1,
//                   borderRadius: 1,
//                   fontWeight: "bold",
//                 }}
//               >
//                 {formConfig.signatures.inspector.label}
//               </Typography>
//               <Grid container spacing={3}>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Controller
//                     name="firmaInspector.realizadoPor"
//                     control={control}
//                     rules={{ required: "Campo obligatorio" }}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         label="Inspección Realizada Por"
//                         error={!!errors?.firmaInspector?.realizadoPor}
//                         helperText={
//                           errors?.firmaInspector?.realizadoPor?.message
//                         }
//                         disabled={readonly}
//                       />
//                     )}
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <SignatureField<HerraFormData>
//                     fieldName="firmaInspector.firma"
//                     control={control}
//                     setValue={setValue}
//                     heightPercentage={30}
//                     format="png"
//                     error={!!errors?.firmaInspector?.firma}
//                     helperText={errors?.firmaInspector?.firma?.message}
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Controller
//                     name="firmaInspector.fecha"
//                     control={control}
//                     rules={{ required: "Campo obligatorio" }}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         type="date"
//                         label="Fecha de Inspección"
//                         InputLabelProps={{ shrink: true }}
//                         error={!!errors?.firmaInspector?.fecha}
//                         helperText={errors?.firmaInspector?.fecha?.message}
//                         disabled={readonly}
//                       />
//                     )}
//                   />
//                 </Grid>
//               </Grid>
//             </Box>

//             {/* Firma Inspector */}

//             <Box>
//               <Typography
//                 variant="subtitle1"
//                 gutterBottom
//                 sx={{
//                   backgroundColor: "#ffebee",
//                   p: 1,
//                   borderRadius: 1,
//                   fontWeight: "bold",
//                 }}
//               >
//                 {formConfig.signatures.supervisor?.label}
//               </Typography>
//               <Grid container spacing={3}>
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Controller
//                     name="firmaSupervisor.nombreSupervisor"
//                     control={control}
//                     rules={{ required: "Campo obligatorio" }}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         label="Nombre del Supervisor"
//                         error={!!errors?.firmaSupervisor?.nombreSupervisor}
//                         helperText={
//                           errors?.firmaSupervisor?.nombreSupervisor?.message
//                         }
//                         disabled={readonly}
//                       />
//                     )}
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <SignatureField<HerraFormData>
//                     fieldName="firmaSupervisor.firma"
//                     control={control}
//                     setValue={setValue}
//                     heightPercentage={30}
//                     format="png"
//                     error={!!errors?.firmaSupervisor?.firma}
//                     helperText={errors?.firmaSupervisor?.firma?.message}
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Controller
//                     name="firmaSupervisor.fecha"
//                     control={control}
//                     rules={{ required: "Campo obligatorio" }}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         type="date"
//                         label="Fecha de Aprobación"
//                         InputLabelProps={{ shrink: true }}
//                         error={!!errors?.firmaSupervisor?.fecha}
//                         helperText={errors?.firmaSupervisor?.fecha?.message}
//                         disabled={readonly}
//                       />
//                     )}
//                   />
//                 </Grid>
//               </Grid>
//             </Box>
//           </Paper>
//         )}
//         {/* ==================== BOTONES ==================== */}
//         {!readonly && (
//           <Box display="flex" gap={2} justifyContent="flex-end">
//             <Button
//               variant="outlined"
//               startIcon={<Save />}
//               onClick={handleSubmit(handleSaveDraft)}
//             >
//               Guardar Borrador
//             </Button>
//             <Button type="submit" variant="contained" startIcon={<Send />}>
//               Enviar Formulario
//             </Button>
//           </Box>
//         )}
//       </form>
//     </Box>
//   );
// };

// export default HerramientasInspeccionForm;
