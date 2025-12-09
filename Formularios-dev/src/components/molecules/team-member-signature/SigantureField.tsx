// // ./src/components/molecules/team-member-signature/SigantureField.tsx

// import { useRef, useEffect, useState } from "react";
// import { Control, UseFormSetValue, Path, FieldValues } from "react-hook-form";
// import SignatureCanvas from "react-signature-canvas";
// import DynamicSignatureCanvas from "../signature-canvas/SigantureCanvas";
// import { Box, Button, Typography } from "@mui/material";
// import Image from "next/image";
// import { Edit as EditIcon } from "@mui/icons-material";

// export interface SignatureFieldProps<T extends Record<string, unknown>> {
//   fieldName: Path<T>;
//   control: Control<T>;
//   setValue: UseFormSetValue<T>;
//   heightPercentage?: number;
//   format?: "png" | "jpeg";
//   error?: boolean;
//   helperText?: string;
//   value?: string;
//   onChange?: (value: string) => void;
//   disabled?: boolean; // ← Ahora SÍ se usa
// }

// export const SignatureField = <T extends FieldValues>({
//   fieldName,
//   setValue,
//   heightPercentage = 60,
//   format = "png",
//   error = false,
//   helperText,
//   value = "",
//   onChange,
//   disabled = false, // ← Lo recibimos
// }: SignatureFieldProps<T>) => {
//   const sigCanvasRef = useRef<SignatureCanvas | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [hasExistingSignature, setHasExistingSignature] = useState(false);

//   useEffect(() => {
//     if (value && value.trim() !== "") {
//       setHasExistingSignature(true);
//       setIsEditing(false);
//     } else {
//       setHasExistingSignature(false);
//       setIsEditing(true);
//     }
//   }, [value]);

//   const saveSignature = () => {
//     if (!sigCanvasRef.current || disabled) return;

//     const signature = sigCanvasRef.current
//       .getTrimmedCanvas()
//       .toDataURL(`image/${format}`);

//     onChange?.(signature);
//     setValue(fieldName, signature as T[Path<T>]);
//     setHasExistingSignature(true);
//     setIsEditing(false);
//   };

//   const clearSignature = () => {
//     if (disabled) return;

//     sigCanvasRef.current?.clear();
//     onChange?.("");
//     setValue(fieldName, "" as T[Path<T>]);
//     setHasExistingSignature(false);
//   };

//   const handleEdit = () => {
//     if (disabled) return;
//     setIsEditing(true);
//   };

//   const handleCancelEdit = () => {
//     if (hasExistingSignature && sigCanvasRef.current) {
//       sigCanvasRef.current.clear();
//     }
//     setIsEditing(false);
//   };

//   // Si está deshabilitado, solo mostramos la imagen (o nada si no hay firma)
//   if (disabled) {
//     if (hasExistingSignature && value) {
//       return (
//         <Box>
//           <Box
//             sx={{
//               border: "1px solid #ccc",
//               borderRadius: 2,
//               p: 2,
//               mb: 2,
//               backgroundColor: "#f9f9f9",
//             }}
//           >
//             <Box sx={{ position: "relative", width: "100%", height: "200px" }}>
//               <Image src={value} alt="Firma" fill style={{ objectFit: "contain" }} />
//             </Box>
//           </Box>
//           {error && helperText && (
//             <Typography variant="caption" color="error" sx={{ display: "block" }}>
//               {helperText}
//             </Typography>
//           )}
//         </Box>
//       );
//     }
//     return null; // o un placeholder si prefieres
//   }

//   // === MODO NORMAL (no disabled) ===
//   if (hasExistingSignature && !isEditing && value) {
//     return (
//       <Box>
//         <Box
//           sx={{
//             border: error ? "1px solid #d32f2f" : "1px solid #ccc",
//             borderRadius: 2,
//             p: 2,
//             mb: 2,
//             position: "relative",
//             backgroundColor: "#f9f9f9",
//           }}
//         >
//           <Box sx={{ position: "relative", width: "100%", height: "200px" }}>
//             <Image src={value} alt="Firma guardada" fill style={{ objectFit: "contain" }} />
//           </Box>
//         </Box>

//         {error && helperText && (
//           <Typography variant="caption" color="error" sx={{ mb: 2, display: "block" }}>
//             {helperText}
//           </Typography>
//         )}

//         <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
//           <Button onClick={handleEdit} variant="outlined" startIcon={<EditIcon />}>
//             Editar Firma
//           </Button>
//           <Button onClick={clearSignature} variant="outlined" color="secondary">
//             Eliminar Firma
//           </Button>
//         </Box>
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       <DynamicSignatureCanvas
//         ref={sigCanvasRef}
//         onClear={clearSignature}
//         onSave={saveSignature}
//         heightPercentage={heightPercentage}
//         error={error}
//         helperText={helperText}
//       />

//       {hasExistingSignature && (
//         <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
//           <Button onClick={handleCancelEdit} variant="text" color="secondary" size="small">
//             Cancelar Edición
//           </Button>
//         </Box>
//       )}
//     </Box>
//   );
// };


// src/components/molecules/team-member-signature/SigantureField.tsx

import { useRef, useEffect, useState } from "react";
import { Control, UseFormSetValue, Path, FieldValues } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
// Asegúrate de que la ruta a DynamicSignatureCanvas sea correcta
import DynamicSignatureCanvas from "../signature-canvas/SigantureCanvas"; 
import { Box, Button, Typography, Stack } from "@mui/material";
import Image from "next/image";
import { Edit as EditIcon } from "@mui/icons-material";

export interface SignatureFieldProps<T extends Record<string, unknown>> {
  fieldName: Path<T>;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  heightPercentage?: number;
  format?: "png" | "jpeg";
  error?: boolean;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const SignatureField = <T extends FieldValues>({
  fieldName,
  setValue,
  heightPercentage = 60,
  format = "png",
  error = false,
  helperText,
  value = "",
  onChange,
  disabled = false,
}: SignatureFieldProps<T>) => {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  
  // Estado para controlar si mostramos la imagen o el canvas
  const [isEditing, setIsEditing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // 🔄 Efecto: Detectar si ya hay firma al cargar
  useEffect(() => {
    if (value && value.trim() !== "") {
      setHasSignature(true);
      setIsEditing(false); // Si hay firma, mostramos la imagen
    } else {
      setHasSignature(false);
      setIsEditing(true); // Si no, mostramos el canvas
    }
  }, [value]);

  // ✅ Guardar firma
  const saveSignature = () => {
    if (!sigCanvasRef.current || disabled) return;

    if (sigCanvasRef.current.isEmpty()) {
       return; // No guardar si está vacío
    }

    const signature = sigCanvasRef.current
      .getTrimmedCanvas()
      .toDataURL(`image/${format}`);

    onChange?.(signature);
    setValue(fieldName, signature as T[Path<T>], { shouldValidate: true, shouldDirty: true });
    
    setHasSignature(true);
    setIsEditing(false); // Cambiar a modo "Ver Imagen"
  };

  // 🗑️ Eliminar firma
  const clearSignature = () => {
    if (disabled) return;

    sigCanvasRef.current?.clear();
    onChange?.("");
    setValue(fieldName, "" as T[Path<T>], { shouldValidate: true, shouldDirty: true });
    
    setHasSignature(false);
    setIsEditing(true); // Volver a modo "Dibujar"
  };

  // ✏️ Activar modo edición
  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  // ↩️ Cancelar edición (si ya había una firma antes)
  const handleCancelEdit = () => {
    if (hasSignature && value) {
      setIsEditing(false); // Volver a mostrar la imagen que ya existía
    } else {
      clearSignature(); // Si no había nada, limpiar
    }
  };

  // -------------------------------------------------------------------
  // 1. MODO VISUALIZACIÓN (Imagen estática + Botones)
  // -------------------------------------------------------------------
  if (hasSignature && !isEditing && value) {
    return (
      <Box sx={{ width: "100%" }}>
        {/* Contenedor de la Imagen (Estilo Tarjeta como en tu foto) */}
        <Box
          sx={{
            border: error ? "1px solid #d32f2f" : "1px solid #e0e0e0",
            borderRadius: 2,
            p: 2,
            mb: 2,
            backgroundColor: "#f8f9fa", // Fondo gris muy claro
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px", // Altura fija para consistencia visual
            position: "relative",
          }}
        >
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <Image 
              src={value} 
              alt="Firma Guardada" 
              fill 
              style={{ objectFit: "contain" }} // Evita que se estire feo
            />
          </Box>
        </Box>

        {/* Mensaje de error si existe */}
        {error && helperText && (
          <Typography variant="caption" color="error" sx={{ mb: 2, display: "block" }}>
            {helperText}
          </Typography>
        )}

        {/* Botones de Acción (Estilo de tu imagen) */}
        {!disabled && (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ textTransform: "uppercase" }}
            >
              Editar Firma
            </Button>
            
            <Button 
              variant="outlined" 
              color="secondary" // O "error" dependiendo de tu tema
              onClick={clearSignature}
              sx={{ 
                textTransform: "uppercase", 
                borderColor: "#e91e63", 
                color: "#e91e63",
                "&:hover": { borderColor: "#c2185b", backgroundColor: "rgba(233, 30, 99, 0.04)" }
              }}
            >
              Eliminar Firma
            </Button>
          </Stack>
        )}
      </Box>
    );
  }

  // -------------------------------------------------------------------
  // 2. MODO EDICIÓN (Canvas de dibujo)
  // -------------------------------------------------------------------
  return (
    <Box sx={{ width: "100%" }}>
      {/* Componente Canvas (Tu componente existente) */}
      <DynamicSignatureCanvas
        ref={sigCanvasRef}
        onClear={() => sigCanvasRef.current?.clear()}
        onSave={saveSignature} // El botón "Guardar" del canvas llama a esto
        heightPercentage={heightPercentage}
        error={error}
        helperText={helperText}
      />

      {/* Botón Cancelar (Solo si estamos editando una firma existente) */}
      {hasSignature && isEditing && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button 
            onClick={handleCancelEdit} 
            variant="text" 
            color="inherit" 
            size="small"
          >
            Cancelar Edición
          </Button>
        </Box>
      )}
    </Box>
  );
};