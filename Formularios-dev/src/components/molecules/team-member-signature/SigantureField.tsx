import { useRef, useEffect, useState } from "react";
import { Control, UseFormSetValue, Path, FieldValues } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import DynamicSignatureCanvas from "../signature-canvas/SigantureCanvas";
import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import { Edit as EditIcon } from "@mui/icons-material";

// Componente simple y reutilizable solo para firmas
export interface SignatureFieldProps<T extends Record<string, unknown>> {
  fieldName: Path<T>;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  heightPercentage?: number;
  format?: "png" | "jpeg";
  error?: boolean;
  helperText?: string;
  value?: string; // Valor actual de la firma (base64)
  onChange?: (value: string) => void;
}

export const SignatureField = <T extends FieldValues>({
  fieldName,
  setValue,
  heightPercentage = 60,
  format = "png",
  error = false,
  helperText,
  value = "",
  onChange
}: SignatureFieldProps<T>) => {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const [isEditing, setIsEditing] = useState(false); // ✅ Estado para controlar si está editando
  const [hasExistingSignature, setHasExistingSignature] = useState(false); // ✅ Si hay firma previa

  // ✅ Verificar si hay una firma existente al montar
  useEffect(() => {
    if (value && value.trim() !== "") {
      setHasExistingSignature(true);
      setIsEditing(false); // Mostrar imagen por defecto
    } else {
      setHasExistingSignature(false);
      setIsEditing(true); // Mostrar canvas si no hay firma
    }
  }, [value]);

  const saveSignature = () => {
    if (sigCanvasRef.current) {
      const signature = sigCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL(`image/${format}`);
      
      if (onChange) {
        onChange(signature);
      }
      
      setValue(fieldName, signature as T[Path<T>]);
      setHasExistingSignature(true);
      setIsEditing(false); // ✅ Volver a mostrar imagen después de guardar
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    
    if (onChange) {
      onChange("");
    }
    
    setValue(fieldName, "" as T[Path<T>]);
    setHasExistingSignature(false);
  };

  const handleEdit = () => {
    setIsEditing(true); // ✅ Cambiar a modo edición
  };

  const handleCancelEdit = () => {
    if (hasExistingSignature) {
      setIsEditing(false); // ✅ Volver a mostrar la imagen
      if (sigCanvasRef.current) {
        sigCanvasRef.current.clear(); // Limpiar canvas sin guardar
      }
    }
  };

  // ✅ Si hay firma y NO está editando, mostrar la imagen
  if (hasExistingSignature && !isEditing && value) {
    return (
      <Box>
        <Box
          sx={{
            border: error ? "1px solid #d32f2f" : "1px solid #ccc",
            borderRadius: 2,
            p: 2,
            mb: 2,
            position: "relative",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={value}
              alt="Firma guardada"
              fill
              style={{
                objectFit: "contain",
              }}
            />
          </Box>
        </Box>

        {error && helperText && (
          <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
            {helperText}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            onClick={handleEdit}
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
          >
            Editar Firma
          </Button>
          <Button
            onClick={clearSignature}
            variant="outlined"
            color="secondary"
          >
            Eliminar Firma
          </Button>
        </Box>
      </Box>
    );
  }

  // ✅ Si está editando o no hay firma, mostrar el canvas
  return (
    <Box>
      <DynamicSignatureCanvas
        ref={sigCanvasRef}
        onClear={clearSignature}
        onSave={saveSignature}
        heightPercentage={heightPercentage}
        error={error}
        helperText={helperText}
      />
      
      {hasExistingSignature && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button
            onClick={handleCancelEdit}
            variant="text"
            color="secondary"
            size="small"
          >
            Cancelar Edición
          </Button>
        </Box>
      )}
    </Box>
  );
};