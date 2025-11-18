// ./src/components/molecules/team-member-signature/SigantureField.tsx

import { useRef, useEffect, useState } from "react";
import { Control, UseFormSetValue, Path, FieldValues } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import DynamicSignatureCanvas from "../signature-canvas/SigantureCanvas";
import { Box, Button, Typography } from "@mui/material";
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
  disabled?: boolean; // ← Ahora SÍ se usa
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
  disabled = false, // ← Lo recibimos
}: SignatureFieldProps<T>) => {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingSignature, setHasExistingSignature] = useState(false);

  useEffect(() => {
    if (value && value.trim() !== "") {
      setHasExistingSignature(true);
      setIsEditing(false);
    } else {
      setHasExistingSignature(false);
      setIsEditing(true);
    }
  }, [value]);

  const saveSignature = () => {
    if (!sigCanvasRef.current || disabled) return;

    const signature = sigCanvasRef.current
      .getTrimmedCanvas()
      .toDataURL(`image/${format}`);

    onChange?.(signature);
    setValue(fieldName, signature as T[Path<T>]);
    setHasExistingSignature(true);
    setIsEditing(false);
  };

  const clearSignature = () => {
    if (disabled) return;

    sigCanvasRef.current?.clear();
    onChange?.("");
    setValue(fieldName, "" as T[Path<T>]);
    setHasExistingSignature(false);
  };

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasExistingSignature && sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    setIsEditing(false);
  };

  // Si está deshabilitado, solo mostramos la imagen (o nada si no hay firma)
  if (disabled) {
    if (hasExistingSignature && value) {
      return (
        <Box>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 2,
              mb: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Box sx={{ position: "relative", width: "100%", height: "200px" }}>
              <Image src={value} alt="Firma" fill style={{ objectFit: "contain" }} />
            </Box>
          </Box>
          {error && helperText && (
            <Typography variant="caption" color="error" sx={{ display: "block" }}>
              {helperText}
            </Typography>
          )}
        </Box>
      );
    }
    return null; // o un placeholder si prefieres
  }

  // === MODO NORMAL (no disabled) ===
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
          <Box sx={{ position: "relative", width: "100%", height: "200px" }}>
            <Image src={value} alt="Firma guardada" fill style={{ objectFit: "contain" }} />
          </Box>
        </Box>

        {error && helperText && (
          <Typography variant="caption" color="error" sx={{ mb: 2, display: "block" }}>
            {helperText}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button onClick={handleEdit} variant="outlined" startIcon={<EditIcon />}>
            Editar Firma
          </Button>
          <Button onClick={clearSignature} variant="outlined" color="secondary">
            Eliminar Firma
          </Button>
        </Box>
      </Box>
    );
  }

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
          <Button onClick={handleCancelEdit} variant="text" color="secondary" size="small">
            Cancelar Edición
          </Button>
        </Box>
      )}
    </Box>
  );
};