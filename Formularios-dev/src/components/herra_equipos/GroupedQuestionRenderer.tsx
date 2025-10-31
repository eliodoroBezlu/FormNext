// // components/form-filler/specialized/GroupedQuestionRenderer.tsx
// "use client";

// import React from "react";
// import { Control, FieldErrors } from "react-hook-form";
// import { Box, Typography, Paper, Grid, Chip } from "@mui/material";
// import { QuestionRenderer } from "./QuestionRenderer";
// import { Question, FormDataHerraEquipos } from "./types/IProps";
// import { FormFeatureConfig } from "./formConfig";

// type ApplicabilityType = "required" | "notApplicable" | "requiredWithCount";

// interface ColumnConfig {
//   key: string; // 'eslinga', 'estrobo', 'grilletes', 'ganchos'
//   label: string; // 'ESLINGA/CADENA', etc.
//   applicability: ApplicabilityType; // Si aplica o no
// }

// // Props del componente
// interface GroupedQuestionRendererProps<
//   T extends FormDataHerraEquipos = FormDataHerraEquipos
// > {
//   numero: number; // Número de la pregunta (1, 2, 3...)
//   descripcion: string; // Texto del criterio
//   question: Question; // La pregunta base (reutilizable)
//   columns: ColumnConfig[]; // Configuración de las 4 columnas
//   sectionPath: string; // 'responses.matriz'
//   control: Control<T>;
//   errors: FieldErrors<T>;
//   readonly?: boolean;
//   formConfig: FormFeatureConfig;
// }

// // Helper para determinar color de fondo según aplicabilidad
// const getBackgroundColor = (applicability: ApplicabilityType): string => {
//   switch (applicability) {
//     case "required":
//       return "#ffebee"; // Rojo claro
//     case "requiredWithCount":
//       return "#fff9c4"; // Amarillo claro
//     case "notApplicable":
//       return "#f5f5f5"; // Gris claro
//     default:
//       return "#ffffff";
//   }
// };


// export function GroupedQuestionRenderer<
//   T extends FormDataHerraEquipos = FormDataHerraEquipos
// >({
//   numero,
//   descripcion,
//   question,
//   columns,
//   sectionPath,
//   control,
//   errors,
//   readonly = false,
//   formConfig,
// }: GroupedQuestionRendererProps<T>) {
//   return (
//     <Paper
//       elevation={2}
//       sx={{
//         mb: 3,
//         border: "2px solid #ddd",
//         overflow: "hidden",
//       }}
//     >
//       {/* Header con el número y descripción del criterio */}
//       <Box
//         sx={{
//           p: 2,
//           backgroundColor: "#e3f2fd",
//           borderBottom: "3px solid #1976d2",
//         }}
//       >
//         <Typography variant="h6" fontWeight="bold">
//           <Chip
//             label={numero}
//             size="small"
//             color="primary"
//             sx={{ mr: 1, fontWeight: "bold" }}
//           />
//           {descripcion}
//         </Typography>
//       </Box>

//       {/* 🆕 PREGUNTA ÚNICA - Mostrada una sola vez */}
//       <Box
//         sx={{
//           p: 2,
//           backgroundColor: "#f5f5f5",
//           borderBottom: "2px solid #ddd",
//         }}
//       >
//         <Typography
//           variant="body1"
//           sx={{
//             fontWeight: 500,
//             color: "text.primary",
//           }}
//         >
//           {question.text}
//           {question.obligatorio && (
//             <Chip
//               label="Obligatorio"
//               size="small"
//               color="error"
//               sx={{ ml: 1, height: 20 }}
//             />
//           )}
//         </Typography>
//       </Box>

//       {/* Grid con las 4 columnas - SOLO CONTROLES */}
//       <Box sx={{ p: 2 }}>
//         <Grid container spacing={2}>
//           {columns.map((col) => {
//             const isDisabled = col.applicability === "notApplicable";

//             return (
//               <Grid size={{ xs: 12, md: 6, lg: 3 }} key={col.key}>
//                 <Paper
//                   elevation={1}
//                   sx={{
//                     p: 2,
//                     height: "100%",
//                     backgroundColor: getBackgroundColor(col.applicability),
//                     border: isDisabled ? "2px dashed #ccc" : "2px solid #ddd",
//                     opacity: isDisabled ? 0.5 : 1,
//                     position: "relative",
//                   }}
//                 >
//                   {/* Header de la columna */}
//                   <Box
//                     sx={{
//                       mb: 2,
//                       pb: 1,
//                       borderBottom: "2px solid rgba(0,0,0,0.1)",
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 1,
//                       justifyContent: "center",
//                     }}
//                   >
//                     <Typography
//                       variant="subtitle1"
//                       fontWeight="bold"
//                       textAlign="center"
//                     >
//                       {col.label}
//                     </Typography>
//                   </Box>

//                   {/* Contenido: QuestionRenderer o N/A */}
//                   {isDisabled ? (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         minHeight: 150,
//                       }}
//                     >
//                       <Typography
//                         variant="h5"
//                         color="text.disabled"
//                         sx={{ fontStyle: "italic" }}
//                       >
//                         N/A
//                       </Typography>
//                     </Box>
//                   ) : (
//                     <Box>
//                       {/* ✅ QuestionRenderer sin mostrar la pregunta de nuevo */}
//                       <QuestionRenderer
//                         question={{
//                           ...question,
//                           text: "",
//                         }}
//                         sectionPath={sectionPath}
//                         questionIndex={`${numero}_${col.key}` as any}
//                         control={control}
//                         errors={errors}
//                         readonly={readonly}
//                         formConfig={formConfig}  
//                       />
//                     </Box>
//                   )}
//                 </Paper>
//               </Grid>
//             );
//           })}
//         </Grid>
//       </Box>

//       {/* 🆕 Leyenda al final */}
//       <Box
//         sx={{
//           p: 1.5,
//           backgroundColor: "#f9f9f9",
//           borderTop: "1px solid #ddd",
//           display: "flex",
//           gap: 2,
//           flexWrap: "wrap",
//           justifyContent: "center",
//         }}
//       ></Box>
//     </Paper>
//   );
// }

// export default GroupedQuestionRenderer;

import React from 'react'

export default function GroupedQuestionRenderer() {
  return (
    <div>GroupedQuestionRenderer</div>
  )
}
