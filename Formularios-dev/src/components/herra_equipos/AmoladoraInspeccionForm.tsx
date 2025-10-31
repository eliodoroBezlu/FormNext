// // components/form-filler/specialized/AmoladoraInspeccionForm.tsx
// "use client";

// import React, { useState } from "react";
// import { useForm, Controller } from "react-hook-form";
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
// } from "@mui/material";
// import { Save, Send, CheckCircle, Warning } from "@mui/icons-material";

// // Importar solo componentes reutilizables
// import { VerificationFields } from "./VerificationsFields";
// import { SectionRenderer } from "./SectionRenderer";
// import {
//   FormTemplate,
//   FormDataHerraEquipos,
//   FormResponse,
// } from "./types/IProps";
// import { SignatureField } from "../molecules/team-member-signature/SigantureField";
// import { getAlertMessages } from "./alertMessages";
// // 👇 IMPORTAR LA CONFIGURACIÓN DE ALERTAS

// // ==================== TIPOS EXTENDIDOS ====================
// interface AmoladoraFormData extends FormDataHerraEquipos {
//   codigoColorTrimestre: {
//     azul: boolean;
//     amarillo: boolean;
//     verde: boolean;
//     blanco: boolean;
//   };
//   firmaInspector: {
//     realizadoPor: string;
//     firma: string;
//     fecha: string;
//   };
// }

// interface AmoladoraFormResponse extends FormResponse {
//   codigoColorTrimestre: {
//     azul: boolean;
//     amarillo: boolean;
//     verde: boolean;
//     blanco: boolean;
//   };
//   firmaInspector: {
//     realizadoPor: string;
//     firma: string;
//     fecha: string;
//   };
// }

// // ==================== PROPS ====================
// interface AmoladoraInspeccionFormProps {
//   template: FormTemplate;
//   onSave?: (data: AmoladoraFormResponse) => void;
//   onSubmit?: (data: AmoladoraFormResponse) => void;
//   readonly?: boolean;
//   initialData?: Partial<AmoladoraFormData>;
// }

// // ==================== COMPONENTE PRINCIPAL ====================
// export const AmoladoraInspeccionForm: React.FC<
//   AmoladoraInspeccionFormProps
// > = ({ template, onSave, onSubmit, readonly = false, initialData }) => {
//   const [saveMessage, setSaveMessage] = useState<string | null>(null);

//   // 👇 OBTENER MENSAJES SEGÚN EL CÓDIGO DEL TEMPLATE
//   const alertMessages = getAlertMessages(template.code);

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//   } = useForm<AmoladoraFormData>({
//     defaultValues: {
//       verification: {},
//       responses: {},
//       codigoColorTrimestre: {
//         azul: false,
//         amarillo: false,
//         verde: false,
//         blanco: false,
//       },
//       firmaInspector: {
//         realizadoPor: "",
//         firma: "",
//         fecha: new Date().toISOString().split("T")[0],
//       },
//     },
//   });

//   const handleSaveDraft = (data: AmoladoraFormData) => {
//     console.log("Datos del formulario para guardar borrador:", data);
//     const formResponse: AmoladoraFormResponse = {
//       templateId: template._id,
//       verificationData: data.verification,
//       responses: data.responses,
//       codigoColorTrimestre: data.codigoColorTrimestre,
//       firmaInspector: data.firmaInspector,
//       submittedAt: new Date(),
//       status: "draft",
//     };

//     console.log("Guardando borrador:", formResponse);
//     setSaveMessage("Borrador guardado exitosamente");
//     setTimeout(() => setSaveMessage(null), 3000);

//     if (onSave) onSave(formResponse);
//   };

//   const handleFinalSubmit = (data: AmoladoraFormData) => {
//     const formResponse: AmoladoraFormResponse = {
//       templateId: template._id,
//       verificationData: data.verification,
//       responses: data.responses,
//       codigoColorTrimestre: data.codigoColorTrimestre,
//       firmaInspector: data.firmaInspector,
//       submittedAt: new Date(),
//       status: "completed",
//     };

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
//           </Box>
//         </CardContent>
//       </Card>

//       {saveMessage && (
//         <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
//           {saveMessage}
//         </Alert>
//       )}

//       <form onSubmit={handleSubmit(handleFinalSubmit)}>
//         {/* ==================== CAMPOS DE VERIFICACIÓN ==================== */}
//         <VerificationFields
//           fields={template.verificationFields}
//           control={control}
//           errors={errors}
//           readonly={readonly}
//         />

//         {/* ==================== CÓDIGO DE COLOR DEL TRIMESTRE ==================== */}
//         <Paper
//           elevation={3}
//           sx={{
//             p: 3,
//             mb: 3,
//             border: "2px solid #000",
//           }}
//         >
//           <FormControl component="fieldset" fullWidth>
//             <FormLabel
//               component="legend"
//               sx={{
//                 fontWeight: "bold",
//                 fontSize: "1.1rem",
//                 color: "#000",
//                 mb: 2,
//                 textAlign: "center",
//                 border: "2px solid #000",
//                 p: 1,
//                 backgroundColor: "#f5f5f5",
//               }}
//             >
//               CÓDIGO DE COLOR DEL TRIMESTRE
//             </FormLabel>

//             <Grid container spacing={2}>
//               <Grid size={{ xs: 6 }}>
//                 <Controller
//                   name="codigoColorTrimestre.azul"
//                   control={control}
//                   render={({ field }) => (
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           {...field}
//                           checked={field.value}
//                           disabled={readonly}
//                           sx={{
//                             "&.Mui-checked": {
//                               color: "#1976d2",
//                             },
//                           }}
//                         />
//                       }
//                       label={
//                         <Typography
//                           sx={{
//                             fontWeight: "bold",
//                             fontSize: "1rem",
//                           }}
//                         >
//                           Azul
//                         </Typography>
//                       }
//                       sx={{
//                         border: "2px solid #000",
//                         p: 1,
//                         m: 0,
//                         width: "100%",
//                         backgroundColor: "#e3f2fd",
//                       }}
//                     />
//                   )}
//                 />
//               </Grid>

//               <Grid size={{ xs: 6 }}>
//                 <Controller
//                   name="codigoColorTrimestre.amarillo"
//                   control={control}
//                   render={({ field }) => (
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           {...field}
//                           checked={field.value}
//                           disabled={readonly}
//                           sx={{
//                             "&.Mui-checked": {
//                               color: "#fbc02d",
//                             },
//                           }}
//                         />
//                       }
//                       label={
//                         <Typography
//                           sx={{
//                             fontWeight: "bold",
//                             fontSize: "1rem",
//                           }}
//                         >
//                           Amarillo
//                         </Typography>
//                       }
//                       sx={{
//                         border: "2px solid #000",
//                         p: 1,
//                         m: 0,
//                         width: "100%",
//                         backgroundColor: "#fff9c4",
//                       }}
//                     />
//                   )}
//                 />
//               </Grid>

//               <Grid size={{ xs: 6 }}>
//                 <Controller
//                   name="codigoColorTrimestre.verde"
//                   control={control}
//                   render={({ field }) => (
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           {...field}
//                           checked={field.value}
//                           disabled={readonly}
//                           sx={{
//                             "&.Mui-checked": {
//                               color: "#388e3c",
//                             },
//                           }}
//                         />
//                       }
//                       label={
//                         <Typography
//                           sx={{
//                             fontWeight: "bold",
//                             fontSize: "1rem",
//                           }}
//                         >
//                           Verde
//                         </Typography>
//                       }
//                       sx={{
//                         border: "2px solid #000",
//                         p: 1,
//                         m: 0,
//                         width: "100%",
//                         backgroundColor: "#c8e6c9",
//                       }}
//                     />
//                   )}
//                 />
//               </Grid>

//               <Grid size={{ xs: 6 }}>
//                 <Controller
//                   name="codigoColorTrimestre.blanco"
//                   control={control}
//                   render={({ field }) => (
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           {...field}
//                           checked={field.value}
//                           disabled={readonly}
//                         />
//                       }
//                       label={
//                         <Typography
//                           sx={{
//                             fontWeight: "bold",
//                             fontSize: "1rem",
//                           }}
//                         >
//                           Blanco
//                         </Typography>
//                       }
//                       sx={{
//                         border: "2px solid #000",
//                         p: 1,
//                         m: 0,
//                         width: "100%",
//                         backgroundColor: "#fff",
//                       }}
//                     />
//                   )}
//                 />
//               </Grid>
//             </Grid>
//           </FormControl>
//         </Paper>

//         {/* ==================== SECCIONES NORMALES ==================== */}
//         {template.sections && template.sections.length > 0 && (
//           <Box mb={3}>
//             <Typography variant="h6" gutterBottom sx={{ px: 2 }}>
//               Preguntas de Inspección
//             </Typography>
//             {template.sections.map((section, sIdx) => (
//               <SectionRenderer
//                 key={section._id || sIdx}
//                 section={section}
//                 sectionPath={`responses.s${sIdx}`}
//                 control={control}
//                 errors={errors}
//                 readonly={readonly}
//               />
//             ))}
//           </Box>
//         )}

//         {/* ==================== ALERTA DE ERROR (DINÁMICA) ==================== */}
//         <Paper
//           elevation={3}
//           sx={{
//             p: 3,
//             mb: 3,
//             border: "3px solid #f44336",
//           }}
//         >
//           <Alert severity="error" icon={<Warning />}>
//             <Typography variant="body1" fontWeight="bold" gutterBottom color="error">
//               {alertMessages.error.title}
//             </Typography>

//             <Typography variant="body1" color="error">
//               {alertMessages.error.description}
//             </Typography>
//           </Alert>
//         </Paper>

//         {/* ==================== ALERTA DE ÉXITO (DINÁMICA) ==================== */}
//         <Paper
//           elevation={3}
//           sx={{
//             p: 3,
//             mb: 3,
//             border: "3px solid #36f462ff",
//           }}
//         >
//           <Alert severity="success">
//             <Typography variant="body2">
//               {alertMessages.success.message}
//             </Typography>
//           </Alert>
//         </Paper>

//         {/* ==================== SECCIÓN DE FIRMA DEL INSPECTOR ==================== */}
//         <Paper
//           sx={{
//             p: 3,
//             mb: 3,
//             border: "2px solid #1976d2",
//           }}
//         >
//           <Typography variant="h6" gutterBottom>
//             Firma del Inspector
//           </Typography>

//           <Box>
//             <Typography
//               variant="subtitle1"
//               gutterBottom
//               sx={{
//                 backgroundColor: "#e3f2fd",
//                 p: 1,
//                 borderRadius: 1,
//                 fontWeight: "bold",
//               }}
//             >
//               Inspector
//             </Typography>
//             <Grid container spacing={3}>
//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Controller
//                   name="firmaInspector.realizadoPor"
//                   control={control}
//                   rules={{ required: "Campo obligatorio" }}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       fullWidth
//                       label="Inspección Realizada Por"
//                       placeholder="Nombre completo del inspector"
//                       error={!!errors?.firmaInspector?.realizadoPor}
//                       helperText={errors?.firmaInspector?.realizadoPor?.message}
//                       disabled={readonly}
//                     />
//                   )}
//                 />
//               </Grid>

//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Box>
//                   <Typography
//                     variant="body2"
//                     color="text.secondary"
//                     gutterBottom
//                   >
//                     Firma Digital (Use el mouse o su dedo para firmar)
//                   </Typography>
//                   {readonly ? (
//                     <Box
//                       sx={{
//                         border: "2px solid #ddd",
//                         borderRadius: 1,
//                         p: 2,
//                         backgroundColor: "#f5f5f5",
//                         minHeight: 150,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <Controller
//                         name="firmaInspector.firma"
//                         control={control}
//                         render={({ field }) =>
//                           field.value ? (
//                             <Box
//                               component="img"
//                               src={field.value}
//                               alt="Firma Inspector"
//                               sx={{
//                                 maxWidth: "100%",
//                                 maxHeight: 150,
//                                 objectFit: "contain",
//                               }}
//                             />
//                           ) : (
//                             <Typography
//                               variant="caption"
//                               color="text.secondary"
//                             >
//                               Sin firma
//                             </Typography>
//                           )
//                         }
//                       />
//                     </Box>
//                   ) : (
//                     <SignatureField<AmoladoraFormData>
//                       fieldName="firmaInspector.firma"
//                       control={control}
//                       setValue={setValue}
//                       heightPercentage={30}
//                       format="png"
//                       error={!!errors?.firmaInspector?.firma}
//                       helperText={
//                         errors?.firmaInspector?.firma?.message ||
//                         "Firme en el recuadro arriba"
//                       }
//                     />
//                   )}
//                 </Box>
//               </Grid>

//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Controller
//                   name="firmaInspector.fecha"
//                   control={control}
//                   rules={{ required: "Campo obligatorio" }}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       fullWidth
//                       type="date"
//                       label="Fecha de Inspección"
//                       InputLabelProps={{ shrink: true }}
//                       error={!!errors?.firmaInspector?.fecha}
//                       helperText={errors?.firmaInspector?.fecha?.message}
//                       disabled={readonly}
//                     />
//                   )}
//                 />
//               </Grid>
//             </Grid>
//           </Box>
//         </Paper>

//         {/* ==================== BOTONES DE ACCIÓN ==================== */}
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

// export default AmoladoraInspeccionForm;
import React from 'react'

export default function AmoladoraInspeccionForm() {
  return (
    <div>AmoladoraInspeccionForm</div>
  )
}
