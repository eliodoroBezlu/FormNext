import { useRef, useState } from "react";
import { Control, UseFormSetValue, Path, FieldValues } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import DynamicSignatureCanvas from "./SignatureCanvas";
import {
  Alert,
  Box,
  Button,
  Tab,
  Tabs,
  Typography,
  Stack,
} from "@mui/material";
import Image from "next/image";
import {
  Edit as EditIcon,
  Gesture as GestureIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";
import {
  ImagenFirmaInvalida,
  normalizarImagenFirma,
} from "./normalizarImagenFirma";

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
  const inputArchivoRef = useRef<HTMLInputElement | null>(null);

  const hasSignature = Boolean(value && value.trim() !== "");

  const [isEditing, setIsEditing] = useState(() => !hasSignature);

  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setIsEditing(!Boolean(value && value.trim() !== ""));
  }
  /** Cómo se está capturando la firma: trazándola o subiendo una imagen. */
  const [modo, setModo] = useState<"dibujar" | "subir">("dibujar");
  const [errorSubida, setErrorSubida] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const guardarValor = (dataUrl: string) => {
    onChange?.(dataUrl);
    setValue(fieldName, dataUrl as T[Path<T>], {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsEditing(false);
  };

  const handleArchivo = async (archivo?: File) => {
    if (!archivo || disabled) return;
    setErrorSubida(null);
    setSubiendo(true);
    try {
      // Se reescala antes de guardar: la firma viaja dentro del documento y una
      // foto de celular sin reducir revienta el límite del backend.
      guardarValor(await normalizarImagenFirma(archivo));
    } catch (error) {
      setErrorSubida(
        error instanceof ImagenFirmaInvalida
          ? error.message
          : "No se pudo procesar la imagen.",
      );
    } finally {
      setSubiendo(false);
      // Permite volver a elegir el mismo archivo tras un error.
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    }
  };

  const saveSignature = () => {
    if (!sigCanvasRef.current || disabled) return;

    if (sigCanvasRef.current.isEmpty()) {
      return;
    }

    guardarValor(
      sigCanvasRef.current.getTrimmedCanvas().toDataURL(`image/${format}`),
    );
  };

  const clearSignature = () => {
    if (disabled) return;

    sigCanvasRef.current?.clear();
    onChange?.("");
    setValue(fieldName, "" as T[Path<T>], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setErrorSubida(null);
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
          <Typography
            variant="caption"
            color="error"
            sx={{ mb: 2, display: "block" }}
          >
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
                "&:hover": {
                  borderColor: "#c2185b",
                  backgroundColor: "rgba(233, 30, 99, 0.04)",
                },
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
      <Tabs
        value={modo}
        onChange={(_, nuevo: "dibujar" | "subir") => {
          setModo(nuevo);
          setErrorSubida(null);
        }}
        variant="fullWidth"
        sx={{ mb: 2, minHeight: 40 }}
      >
        <Tab
          value="dibujar"
          label="Dibujar"
          icon={<GestureIcon fontSize="small" />}
          iconPosition="start"
          disabled={disabled}
          sx={{ minHeight: 40, textTransform: "none" }}
        />
        <Tab
          value="subir"
          label="Subir imagen"
          icon={<UploadFileIcon fontSize="small" />}
          iconPosition="start"
          disabled={disabled}
          sx={{ minHeight: 40, textTransform: "none" }}
        />
      </Tabs>

      {errorSubida && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setErrorSubida(null)}
        >
          {errorSubida}
        </Alert>
      )}

      {modo === "subir" ? (
        <Box
          sx={{
            border: error ? "1px solid #d32f2f" : "1px dashed #bdbdbd",
            borderRadius: 2,
            p: 3,
            mb: 2,
            textAlign: "center",
          }}
        >
          <input
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => void handleArchivo(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => inputArchivoRef.current?.click()}
            disabled={disabled || subiendo}
            sx={{ textTransform: "none" }}
          >
            {subiendo ? "Procesando…" : "Elegir imagen de la firma"}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1.5 }}
          >
            Foto o escaneo de la firma. Se reduce automáticamente antes de
            guardarla.
          </Typography>
          {error && helperText && (
            <Typography
              variant="caption"
              color="error"
              display="block"
              sx={{ mt: 1 }}
            >
              {helperText}
            </Typography>
          )}
        </Box>
      ) : (
        <DynamicSignatureCanvas
          ref={sigCanvasRef}
          onClear={() => sigCanvasRef.current?.clear()}
          onSave={saveSignature}
          heightPercentage={heightPercentage}
          error={error}
          helperText={helperText}
        />
      )}

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
