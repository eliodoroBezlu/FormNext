import { useRef, useEffect, useState } from "react";
import { Control, UseFormSetValue, Path, FieldValues } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import DynamicSignatureCanvas from "./SignatureCanvas"; 
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (value && value.trim() !== "") {
      setHasSignature(true);
      setIsEditing(false);
    } else {
      setHasSignature(false);
      setIsEditing(true);
    }
  }, [value]);

  const saveSignature = () => {
    if (!sigCanvasRef.current || disabled) return;

    if (sigCanvasRef.current.isEmpty()) {
       return;
    }

    const signature = sigCanvasRef.current
      .getTrimmedCanvas()
      .toDataURL(`image/${format}`);

    onChange?.(signature);
    setValue(fieldName, signature as T[Path<T>], { shouldValidate: true, shouldDirty: true });
    
    setHasSignature(true);
    setIsEditing(false);
  };

  const clearSignature = () => {
    if (disabled) return;

    sigCanvasRef.current?.clear();
    onChange?.("");
    setValue(fieldName, "" as T[Path<T>], { shouldValidate: true, shouldDirty: true });
    
    setHasSignature(false);
    setIsEditing(true);
  };

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasSignature && value) {
      setIsEditing(false);
    } else {
      clearSignature();
    }
  };

  if (hasSignature && !isEditing && value) {
    return (
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            border: error ? "1px solid #d32f2f" : "1px solid #e0e0e0",
            borderRadius: 2,
            p: 2,
            mb: 2,
            backgroundColor: "#f8f9fa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            position: "relative",
          }}
        >
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <Image 
              src={value} 
              alt="Firma Guardada" 
              fill 
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Box>

        {error && helperText && (
          <Typography variant="caption" color="error" sx={{ mb: 2, display: "block" }}>
            {helperText}
          </Typography>
        )}

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
              color="secondary"
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

  return (
    <Box sx={{ width: "100%" }}>
      <DynamicSignatureCanvas
        ref={sigCanvasRef}
        onClear={() => sigCanvasRef.current?.clear()}
        onSave={saveSignature}
        heightPercentage={heightPercentage}
        error={error}
        helperText={helperText}
      />

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
