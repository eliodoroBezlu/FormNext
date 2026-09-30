"use client";

import { memo, useCallback, useState } from "react";
import type React from "react";
import {
  get,
  useFieldArray,
  useFormState,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Add,
  CloudUpload,
  Delete,
  ExpandMore,
  Image as ImageIcon,
} from "@mui/icons-material";
import { Button } from "@/components/ui/buttons/Button";
import { FormField } from "@/components/ui/inputs/FormField";
import type { FormBuilderData, SimpleQuestion } from "@/types/formTypes";
import {
  AsaArrastre,
  ListaOrdenable,
  useOrdenable,
} from "@/components/ui/sortable/ListaOrdenable";

export interface ImageSectionBuilderProps {
  sectionIndex: number;
  control: Control<FormBuilderData>;
  setValue: UseFormSetValue<FormBuilderData>;
  onRemove: (index: number) => void;
  expanded: boolean;
  onToggleExpanded: (index: number) => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  minQuestions?: number;
  maxQuestions?: number;
}

const convertFileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result && typeof reader.result === "string")
        resolve(reader.result);
      else reject(new Error("Error al convertir archivo a base64"));
    };
    reader.onerror = (error) => reject(error);
  });

const processImage = (
  file: File,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.8,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Error al procesar la imagen"));
    };
    img.src = url;
  });

const describirImagen = (url: string): string => {
  if (url.startsWith("data:image/"))
    return `Base64 (~${Math.round((url.length * 3) / 4 / 1024)}KB)`;
  if (url.startsWith("blob:")) return "Procesando...";
  return "URL externa";
};

const REGLAS_TEXTO = {
  required: "Pregunta es requerida",
  minLength: {
    value: 5,
    message: "La pregunta debe tener al menos 5 caracteres",
  },
};
const INPUT_TEXTO = {
  multiline: true,
  rows: 3,
  placeholder: "Escribe aquí la pregunta...",
};

/**
 * Sección con preguntas ilustradas. Igual que `SectionBuilder`, no recibe
 * los datos desde arriba: cada pregunta vigila solo su propia imagen.
 */
export const ImageSectionBuilder = memo(function ImageSectionBuilder({
  sectionIndex,
  control,
  setValue,
  onRemove,
  expanded,
  onToggleExpanded,
  disabled = false,
  showRemoveButton = true,
  minQuestions = 1,
  maxQuestions = 50,
}: ImageSectionBuilderProps) {
  const basePath = `simpleSections.${sectionIndex}` as const;
  const titulo = useWatch({ control, name: `${basePath}.title` });
  const conImagen = useWatch({ control, name: `${basePath}.questions` }) as
    SimpleQuestion[] | undefined;
  const cantidadConImagen = (conImagen ?? []).filter((q) => q?.image).length;

  const { errors, submitCount } = useFormState({ control, name: basePath });
  const abierta =
    expanded || (submitCount > 0 && Boolean(get(errors, basePath)));

  const {
    fields: preguntas,
    append,
    remove,
    move,
  } = useFieldArray({ control, name: `${basePath}.questions` });

  const addQuestion = () => {
    if (preguntas.length >= maxQuestions) {
      alert(`Máximo ${maxQuestions} preguntas por sección`);
      return;
    }
    append({ text: "", image: undefined });
  };

  const removeQuestion = useCallback((i: number) => remove(i), [remove]);
  const puedeEliminar = preguntas.length > minQuestions;

  return (
    <Accordion
      expanded={abierta}
      onChange={() => onToggleExpanded(sectionIndex)}
      sx={{
        mb: 2,
        opacity: disabled ? 0.7 : 1,
        pointerEvents: disabled ? "none" : "auto",
        border: "2px solid",
        borderColor: "primary.light",
        backgroundColor: "primary.50",
      }}
    >
      <Box display="flex" alignItems="center">
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{ flexGrow: 1, "&:hover": { backgroundColor: "primary.100" } }}
        >
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Typography variant="h6" color="primary.dark">
              📷 Sección con Imágenes {sectionIndex + 1}
              {titulo && `: ${titulo}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {preguntas.length} pregunta{preguntas.length !== 1 ? "s" : ""}
              {cantidadConImagen > 0 && (
                <span> • {cantidadConImagen} con imagen</span>
              )}
            </Typography>
          </Box>
        </AccordionSummary>
        {showRemoveButton && (
          <Box display="flex" alignItems="center" px={1}>
            <IconButton
              color="error"
              onClick={() => onRemove(sectionIndex)}
              size="small"
              title="Eliminar sección"
              aria-label="Eliminar sección"
              disabled={disabled}
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>

      <AccordionDetails>
        <Box mb={3}>
          <FormField
            name={`${basePath}.title`}
            control={control}
            label="Título de la Sección con Imágenes"
            rules={{ required: "Título es requerido" }}
            disabled={disabled}
          />
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            Preguntas ({preguntas.length}/{maxQuestions})
          </Typography>
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={addQuestion}
            disabled={disabled || preguntas.length >= maxQuestions}
            color="primary"
          >
            Agregar Pregunta
          </Button>
        </Box>

        {preguntas.length === 0 ? (
          <Box
            p={3}
            textAlign="center"
            sx={{
              border: 1,
              borderColor: "primary.light",
              borderStyle: "dashed",
              borderRadius: 1,
              backgroundColor: "primary.50",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No hay preguntas. Haz clic en &quot;Agregar Pregunta&quot; para
              comenzar.
            </Typography>
          </Box>
        ) : (
          <ListaOrdenable
            ids={preguntas.map((p) => p.id)}
            onMover={move}
            deshabilitada={disabled}
          >
            {preguntas.map((pregunta, i) => (
              <PreguntaConImagen
                key={pregunta.id}
                id={pregunta.id}
                sectionIndex={sectionIndex}
                index={i}
                control={control}
                setValue={setValue}
                disabled={disabled}
                puedeEliminar={puedeEliminar}
                minPreguntas={minQuestions}
                onRemove={removeQuestion}
              />
            ))}
          </ListaOrdenable>
        )}

        <Box mt={2} p={2} sx={{ backgroundColor: "info.50", borderRadius: 1 }}>
          <Typography variant="caption" color="info.main">
            📷 Sección especial: Esta sección permite preguntas con imágenes
            opcionales. Las imágenes se convierten automáticamente a Base64 para
            almacenamiento en base de datos. Formatos soportados: JPG, PNG, GIF.
            Tamaño máximo: 10MB (se optimiza automáticamente). Las imágenes se
            redimensionan y comprimen para optimizar el almacenamiento.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

interface PreguntaConImagenProps {
  id: string;
  sectionIndex: number;
  index: number;
  control: Control<FormBuilderData>;
  setValue: UseFormSetValue<FormBuilderData>;
  disabled: boolean;
  puedeEliminar: boolean;
  minPreguntas: number;
  onRemove: (index: number) => void;
}

const PreguntaConImagen = memo(function PreguntaConImagen({
  id,
  sectionIndex,
  index,
  control,
  setValue,
  disabled,
  puedeEliminar,
  minPreguntas,
  onRemove,
}: PreguntaConImagenProps) {
  const rutaImagen =
    `simpleSections.${sectionIndex}.questions.${index}.image` as const;
  const imagen = useWatch({ control, name: rutaImagen });
  const [procesando, setProcesando] = useState(false);
  const { nodoRef, estilo, arrastrando, asa } = useOrdenable(
    id,
    disabled || procesando,
  );

  const subirImagen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 10MB permitido");
      return;
    }

    const temporal = URL.createObjectURL(file);
    setProcesando(true);
    setValue(rutaImagen, temporal);
    try {
      let base64: string;
      try {
        base64 = await processImage(file, 1200, 800, 0.8);
      } catch (e) {
        console.warn(
          "Error al procesar imagen con optimización, usando conversión directa:",
          e,
        );
        base64 = await convertFileToBase64(file);
      }
      if ((base64.length * 3) / 4 > 2 * 1024 * 1024) {
        try {
          base64 = await processImage(file, 800, 600, 0.6);
        } catch (e) {
          console.error("Error en compresión adicional:", e);
        }
      }
      setValue(rutaImagen, base64);
    } catch (error) {
      console.error("Error uploading/processing image:", error);
      alert(
        "Error al procesar la imagen. Por favor, intenta con otra imagen o un formato diferente.",
      );
      setValue(rutaImagen, undefined);
    } finally {
      URL.revokeObjectURL(temporal);
      setProcesando(false);
      event.target.value = "";
    }
  };

  const quitarImagen = () => {
    if (imagen?.startsWith("blob:")) URL.revokeObjectURL(imagen);
    setValue(rutaImagen, undefined);
  };

  return (
    <Card
      ref={nodoRef}
      style={estilo}
      variant="outlined"
      sx={{
        mb: 2,
        backgroundColor: "background.paper",
        borderColor: arrastrando ? "primary.main" : "primary.light",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          {!disabled && (
            <Grid size="auto">
              <AsaArrastre
                asa={asa}
                arrastrando={arrastrando}
                deshabilitado={procesando}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, md: "grow" }}>
            <FormField
              name={`simpleSections.${sectionIndex}.questions.${index}.text`}
              control={control}
              label={`Pregunta ${index + 1}`}
              inputProps={INPUT_TEXTO}
              rules={REGLAS_TEXTO}
              disabled={disabled}
            />
          </Grid>

          {imagen && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  position: "relative",
                  border: 2,
                  borderColor: procesando ? "warning.main" : "primary.light",
                  borderRadius: 1,
                  overflow: "hidden",
                  backgroundColor: "primary.50",
                  minHeight: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={imagen}
                  alt={`Imagen pregunta ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "150px",
                    objectFit: "contain",
                    opacity: procesando ? 0.7 : 1,
                  }}
                />
                {procesando && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    sx={{
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0,0,0,0.7)",
                      color: "white",
                      padding: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption">Procesando...</Typography>
                  </Box>
                )}
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                  }}
                  onClick={quitarImagen}
                  disabled={disabled || procesando}
                  aria-label="Quitar imagen"
                >
                  <Delete fontSize="small" color="error" />
                </IconButton>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {imagen.startsWith("data:image/") ? (
                  <>✅ Listo para guardar - {describirImagen(imagen)}</>
                ) : (
                  <>💡 {describirImagen(imagen)} - Se convertirá a Base64</>
                )}
              </Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" gap={1}>
                <Button
                  component="label"
                  variant={imagen ? "outlined" : "contained"}
                  size="small"
                  startIcon={imagen ? <ImageIcon /> : <CloudUpload />}
                  disabled={disabled || procesando}
                  color="primary"
                >
                  {procesando
                    ? "Procesando..."
                    : imagen
                      ? "Cambiar imagen"
                      : "Agregar imagen"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={subirImagen}
                  />
                </Button>
                {imagen && !procesando && (
                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    color="error"
                    onClick={quitarImagen}
                    disabled={disabled}
                  >
                    Quitar imagen
                  </Button>
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  #{index + 1}
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => onRemove(index)}
                  size="small"
                  disabled={disabled || !puedeEliminar}
                  title={
                    puedeEliminar
                      ? "Eliminar pregunta"
                      : `Mínimo ${minPreguntas} pregunta(s)`
                  }
                  aria-label="Eliminar pregunta"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});
