// "use client";

// import { useRef, useState } from "react";
// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Typography,
//   Grid,
//   TextField,
//   Autocomplete,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import {
//   type Control,
//   Controller,
//   type FieldErrors,
//   type UseFormSetValue,
// } from "react-hook-form";
// import type {
//   FormularioInspeccion,
//   Mes,
//   Trabajador,
// } from "../../types/formTypes";
// import type SignatureCanvas from "react-signature-canvas";
// import DynamicSignatureCanvas from "../molecules/signature-canvas/SigantureCanvas";
// import { buscarTrabajadores } from "@/app/actions/inspeccion";
// interface InformacionInspectorProps {
//   control: Control<FormularioInspeccion>;
//   currentMes: Mes;
//   setValue: UseFormSetValue<FormularioInspeccion>;
//   errors: FieldErrors<FormularioInspeccion>;
// }

// const InformacionInspector = ({
//   control,
//   currentMes,
//   setValue,
//   errors,
// }: InformacionInspectorProps) => {
//   const sigCanvasRef = useRef<SignatureCanvas>(null);
//   const [loading, setLoading] = useState(false);
//   const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);

//   // Función para buscar trabajadores en la API
//   const buscarTrabajadoresOpcion = async (query: string): Promise<void> => {
//     if (query.length < 3) {
//       setTrabajadores([]);
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await buscarTrabajadores(query);
//       setTrabajadores(response);
//     } catch (error) {
//       console.error("Error al buscar trabajadores:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Guardar la firma del inspector
//   const guardarFirma = () => {
//     if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
//       const dataURL = sigCanvasRef.current.toDataURL();
//       setValue(`meses.${currentMes}.inspector.firma`, dataURL);
//     }
//   };

//   // Limpiar la firma del inspector
//   const limpiarFirma = () => {
//     if (sigCanvasRef.current) {
//       sigCanvasRef.current.clear();
//       setValue(`meses.${currentMes}.inspector.firma`, null);
//     }
//   };

//   return (
//     <Accordion defaultExpanded>
//       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//         <Typography variant="h6">Información del Inspector</Typography>
//       </AccordionSummary>
//       <AccordionDetails>
//         <Grid container spacing={3}>
//           {/* Campo de búsqueda de trabajadores */}
//           <Grid size={{ xs: 12 }}>
//             <Controller
//               name={`meses.${currentMes}.inspector.nombre`}
//               control={control}
//               rules={{ required: "El nombre del inspector es obligatorio" }}
//               render={({ field }) => (
//                 <Autocomplete
//                   options={trabajadores}
//                   getOptionLabel={(option) => option.nomina || ""}
//                   onInputChange={(_, value) => buscarTrabajadoresOpcion(value)}
//                   onBlur={() => setTrabajadores([])}
//                   loading={loading}
//                   onChange={(_, data) => {
//                     field.onChange(data?.nomina || "");
//                     setValue(
//                       `meses.${currentMes}.inspector.nombre`,
//                       data?.nomina || ""
//                     );
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       label="Buscar Inspector"
//                       fullWidth
//                       error={!!errors.meses?.[currentMes]?.inspector?.nombre}
//                       helperText={
//                         errors.meses?.[currentMes]?.inspector?.nombre?.message
//                       }
//                     />
//                   )}
//                 />
//               )}
//             />
//           </Grid>

//           {/* Campo de firma del inspector */}
//           <Grid size={{ xs: 12 }}>
//             <Controller
//               name={`meses.${currentMes}.inspector.firma`}
//               control={control}
//               rules={{ 
//                 required: "La firma del inspector es obligatoria",
//                 validate: (value) => value !== null && value !== "" || "Debe firmar el inspector"
//               }}
//               render={({field }) => (
//                 <>
//                   <Typography variant="subtitle1" gutterBottom>
//                     Firma del Inspector
//                   </Typography>
//                   <DynamicSignatureCanvas
//                     ref={sigCanvasRef}
//                     onClear={limpiarFirma}
//                     heightPercentage={40}
//                     onSave={() => {
//                       guardarFirma();
//                       // Esto conecta el onChange del field con la acción de guardar firma
//                       field.onChange(sigCanvasRef.current?.toDataURL() || null);
//                     }}
//                     error={!!errors.meses?.[currentMes]?.inspector?.firma}
//                     helperText={errors.meses?.[currentMes]?.inspector?.firma?.message}
//                   />
//                 </>
//               )}
//             />
//           </Grid>
//         </Grid>
//       </AccordionDetails>
//     </Accordion>
//   );
// };

// export default InformacionInspector;


"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import type {
  FormularioInspeccion,
  Mes,
} from "../../types/formTypes";
import { SignatureField } from "@/components/molecules/team-member-signature/SigantureField";
import AutocompleteTrabajador from "@/components/molecules/autocomplete-trabajador/AutocompleteTrabajador";

interface InformacionInspectorProps {
  control: Control<FormularioInspeccion>;
  currentMes: Mes;
  setValue: UseFormSetValue<FormularioInspeccion>;
  errors: FieldErrors<FormularioInspeccion>;
  disabled?: boolean; // 🔥 1. Prop para modo lectura
}

const InformacionInspector = ({
  control,
  currentMes,
  setValue,
  errors,
  disabled = false, // 🔥 2. Default false
}: InformacionInspectorProps) => {

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Información del Inspector</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          {/* Campo de búsqueda de trabajadores */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name={`meses.${currentMes}.inspector.nombre`}
              control={control}
              rules={{ required: !disabled && "El nombre del inspector es obligatorio" }}
              render={({ field }) => (
                <AutocompleteTrabajador
                  label="Buscar Inspector"
                  placeholder="Seleccione o escriba un nombre"
                  value={field.value || null}
                  onChange={(nomina) => {
                    field.onChange(nomina);
                    // Opcional: Si quieres guardar más datos del trabajador
                    // setValue(`...`, trabajador.puesto);
                  }}
                  onBlur={field.onBlur}
                  required={!disabled}
                  error={!!errors.meses?.[currentMes]?.inspector?.nombre}
                  helperText={errors.meses?.[currentMes]?.inspector?.nombre?.message}
                  disabled={disabled} // 🔥 3. Bloquear Autocomplete
                />
              )}
            />
          </Grid>

          {/* Campo de firma del inspector */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Firma del Inspector
            </Typography>
            <Controller
              name={`meses.${currentMes}.inspector.firma`}
              control={control}
              // rules={{ required: !disabled && "La firma es obligatoria" }} // Opcional, según regla de negocio
              render={({ field }) => (
                <SignatureField
                  fieldName={`meses.${currentMes}.inspector.firma`}
                  control={control}
                  setValue={setValue}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={disabled} // 🔥 4. Bloquear Firma (muestra imagen si existe)
                  heightPercentage={40}
                  error={!!errors.meses?.[currentMes]?.inspector?.firma}
                  helperText={errors.meses?.[currentMes]?.inspector?.firma?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default InformacionInspector;