"use client";

import type React from "react";
import {
  Control,
  useFieldArray,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add,
  Delete,
  ExpandMore,
  Image,
  CloudUpload,
} from "@mui/icons-material";
import { Button } from "../../atoms/button/Button";
import {
  FormField,
  FormFieldValue,
} from "../../molecules/form-field/FormField";
import {
  FormBuilderData,
  SimpleSection,
  SimpleQuestion,
} from "@/types/formTypes";
import { useState } from "react";

export interface ImageSectionBuilderProps {
  sectionIndex: number;
  section: SimpleSection;
  control: Control<FormBuilderData>;
  setValue: UseFormSetValue<FormBuilderData>;
  onRemove: () => void;
  onUpdate?: (
    sectionIndex: number,
    updatedSection: Partial<SimpleSection>
  ) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  minQuestions?: number;
  maxQuestions?: number;
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Error al convertir archivo a base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

const processImage = async (
  file: File,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

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

      const base64 = canvas.toDataURL("image/jpeg", quality);
      resolve(base64);
    };

    img.onerror = () => reject(new Error("Error al procesar la imagen"));
    img.src = URL.createObjectURL(file);
  });
};

export const ImageSectionBuilder: React.FC<ImageSectionBuilderProps> = ({
  sectionIndex,
  section,
  control,
  setValue,
  onRemove,
  onUpdate,
  expanded = false,
  onToggleExpanded,
  disabled = false,
  showRemoveButton = true,
  minQuestions = 1,
  maxQuestions = 50,
}) => {
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  );
  const [processingImages, setProcessingImages] = useState<Set<number>>(
    new Set()
  );

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: `simpleSections.${sectionIndex}.questions` as const,
  });

  const watchedQuestions = useWatch({
    control,
    name: `simpleSections.${sectionIndex}.questions`,
  }) as SimpleQuestion[];

  const addQuestion = () => {
    if (questions.length >= maxQuestions) {
      alert(`Máximo ${maxQuestions} preguntas por sección`);
      return;
    }

    const newQuestion: SimpleQuestion = {
      text: "",
      image: undefined,
    };

    appendQuestion(newQuestion);
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    if (questions.length <= minQuestions) {
      alert(`Mínimo ${minQuestions} pregunta(s) por sección`);
      return;
    }
    removeQuestion(questionIndex);
  };

  const handleSectionUpdate = (
    field: keyof SimpleSection,
    value: FormFieldValue
  ) => {
    if (onUpdate) {
      onUpdate(sectionIndex, { [field]: value });
    }
  };

  const handleImageUpload = async (
    questionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      alert("La imagen es demasiado grande. Máximo 10MB permitido");
      return;
    }

    try {
      setUploadingImages((prev) => new Set([...prev, questionIndex]));
      setProcessingImages((prev) => new Set([...prev, questionIndex]));

      const tempImageUrl = URL.createObjectURL(file);

      setValue(
        `simpleSections.${sectionIndex}.questions.${questionIndex}.image`,
        tempImageUrl
      );

      let base64Image: string;

      try {
        base64Image = await processImage(file, 1200, 800, 0.8);
      } catch (processError) {
        console.warn(
          "Error al procesar imagen con optimización, usando conversión directa:",
          processError
        );
        base64Image = await convertFileToBase64(file);
      }

      const base64Size = (base64Image.length * 3) / 4;
      const maxBase64Size = 2 * 1024 * 1024;

      if (base64Size > maxBase64Size) {
        console.warn("Base64 muy grande, intentando mayor compresión...");
        try {
          base64Image = await processImage(file, 800, 600, 0.6);
        } catch (compressionError) {
          console.error("Error en compresión adicional:", compressionError);
        }
      }

      URL.revokeObjectURL(tempImageUrl);

      setValue(
        `simpleSections.${sectionIndex}.questions.${questionIndex}.image`,
        base64Image
      );
    } catch (error) {
      console.error("Error uploading/processing image:", error);
      alert(
        "Error al procesar la imagen. Por favor, intenta con otra imagen o un formato diferente."
      );

      setValue(
        `simpleSections.${sectionIndex}.questions.${questionIndex}.image`,
        undefined
      );
    } finally {
      setUploadingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });
      setProcessingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });

      event.target.value = "";
    }
  };

  const removeImage = (questionIndex: number) => {
    const currentImage = watchedQuestions?.[questionIndex]?.image;

    if (currentImage && currentImage.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage);
    }

    setValue(
      `simpleSections.${sectionIndex}.questions.${questionIndex}.image`,
      undefined
    );
  };

  const isBase64Image = (imageUrl?: string): boolean => {
    return imageUrl?.startsWith("data:image/") || false;
  };

  const getImageInfo = (imageUrl?: string): string => {
    if (!imageUrl) return "";

    if (isBase64Image(imageUrl)) {
      const sizeInBytes = (imageUrl.length * 3) / 4;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      return `Base64 (~${sizeInKB}KB)`;
    } else if (imageUrl.startsWith("blob:")) {
      return "Procesando...";
    } else {
      return "URL externa";
    }
  };

  const currentQuestions = watchedQuestions || questions;
  const questionsWithImages = currentQuestions.filter((q) => q?.image).length;

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggleExpanded}
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
          sx={{
            flexGrow: 1,
            "&:hover": { backgroundColor: "primary.100" },
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Typography variant="h6" color="primary.dark">
              📷 Sección con Imágenes {sectionIndex + 1}
              {section.title && `: ${section.title}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentQuestions.length} pregunta
              {currentQuestions.length !== 1 ? "s" : ""}
              {questionsWithImages > 0 && (
                <span> • {questionsWithImages} con imagen</span>
              )}
            </Typography>
          </Box>
        </AccordionSummary>

        {showRemoveButton && (
          <Box display="flex" alignItems="center" px={1}>
            <IconButton
              color="error"
              onClick={onRemove}
              size="small"
              title="Eliminar sección"
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
            name={`simpleSections.${sectionIndex}.title`}
            control={control}
            label="Título de la Sección con Imágenes"
            rules={{ required: "Título es requerido" }}
            disabled={disabled}
            onChange={(value) => handleSectionUpdate("title", value)}
          />
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            Preguntas ({currentQuestions.length}/{maxQuestions})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={addQuestion}
            disabled={disabled || currentQuestions.length >= maxQuestions}
            color="primary"
          >
            Agregar Pregunta
          </Button>
        </Box>

        {currentQuestions.length === 0 ? (
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
          currentQuestions.map((question, questionIndex) => (
            <Card
              key={`question-${questionIndex}`}
              variant="outlined"
              sx={{
                mb: 2,
                backgroundColor: "background.paper",
                borderColor: "primary.light",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: question?.image ? 7 : 10 }}>
                    <FormField
                      name={`simpleSections.${sectionIndex}.questions.${questionIndex}.text`}
                      control={control}
                      label={`Pregunta ${questionIndex + 1}`}
                      inputProps={{
                        multiline: true,
                        rows: 3,
                        placeholder: "Escribe aquí la pregunta...",
                      }}
                      rules={{
                        required: "Pregunta es requerida",
                        minLength: {
                          value: 5,
                          message:
                            "La pregunta debe tener al menos 5 caracteres",
                        },
                      }}
                      disabled={disabled}
                    />
                  </Grid>

                  {question?.image && (
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box
                        sx={{
                          position: "relative",
                          border: 2,
                          borderColor: processingImages.has(questionIndex)
                            ? "warning.main"
                            : uploadingImages.has(questionIndex)
                            ? "info.main"
                            : "primary.light",
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
                          src={question.image}
                          alt={`Imagen pregunta ${questionIndex + 1}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "150px",
                            objectFit: "contain",
                            opacity:
                              uploadingImages.has(questionIndex) ||
                              processingImages.has(questionIndex)
                                ? 0.7
                                : 1,
                          }}
                          onError={(e) => {
                            console.error("Error loading image:", e);
                          }}
                        />

                        {(uploadingImages.has(questionIndex) ||
                          processingImages.has(questionIndex)) && (
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
                            <Typography variant="caption">
                              {processingImages.has(questionIndex)
                                ? "Procesando..."
                                : "Subiendo..."}
                            </Typography>
                          </Box>
                        )}

                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            backgroundColor: "rgba(255,255,255,0.9)",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,1)",
                            },
                          }}
                          onClick={() => removeImage(questionIndex)}
                          disabled={
                            disabled ||
                            uploadingImages.has(questionIndex) ||
                            processingImages.has(questionIndex)
                          }
                        >
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {isBase64Image(question.image) ? (
                          <>
                            ✅ Listo para guardar -{" "}
                            {getImageInfo(question.image)}
                          </>
                        ) : (
                          <>
                            💡 {getImageInfo(question.image)} - Se convertirá a
                            Base64
                          </>
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
                          variant={question?.image ? "outlined" : "contained"}
                          size="small"
                          startIcon={
                            question?.image ? <Image /> : <CloudUpload />
                          }
                          disabled={
                            disabled ||
                            uploadingImages.has(questionIndex) ||
                            processingImages.has(questionIndex)
                          }
                          color="primary"
                        >
                          {processingImages.has(questionIndex)
                            ? "Procesando..."
                            : uploadingImages.has(questionIndex)
                            ? "Subiendo..."
                            : question?.image
                            ? "Cambiar imagen"
                            : "Agregar imagen"}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(questionIndex, e)
                            }
                          />
                        </Button>

                        {question?.image &&
                          !uploadingImages.has(questionIndex) &&
                          !processingImages.has(questionIndex) && (
                            <Button
                              variant="text"
                              size="small"
                              color="error"
                              onClick={() => removeImage(questionIndex)}
                              disabled={disabled}
                            >
                              Quitar imagen
                            </Button>
                          )}
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                          #{questionIndex + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveQuestion(questionIndex)}
                          size="small"
                          disabled={
                            disabled || currentQuestions.length <= minQuestions
                          }
                          title={
                            currentQuestions.length <= minQuestions
                              ? `Mínimo ${minQuestions} pregunta(s)`
                              : "Eliminar pregunta"
                          }
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
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
};
