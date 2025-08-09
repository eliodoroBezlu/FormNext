"use client";

import type React from "react";
import { Control, useFieldArray, UseFormSetValue, useWatch } from "react-hook-form";
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
import { Add, Delete, ExpandMore, Image, CloudUpload } from "@mui/icons-material";
import { Button } from "../../atoms/button/Button";
import {
  FormField,
  FormFieldValue,
} from "../../molecules/form-field/FormField";
import { FormBuilderData, SimpleSection, SimpleQuestion } from "@/types/formTypes";
import { useState } from "react";

// Props del componente
export interface ImageSectionBuilderProps {
  sectionIndex: number;
  section: SimpleSection;
  control: Control<FormBuilderData>;
  setValue: UseFormSetValue<FormBuilderData>;
  onRemove: () => void;
  onUpdate?: (sectionIndex: number, updatedSection: Partial<SimpleSection>) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  minQuestions?: number;
  maxQuestions?: number;
}

// Función para convertir archivo a base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Error al convertir archivo a base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Función para validar y redimensionar imagen si es necesario
const processImage = async (file: File, maxWidth = 1200, maxHeight = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
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

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a base64 con calidad especificada
      const base64 = canvas.toDataURL('image/jpeg', quality);
      resolve(base64);
    };

    img.onerror = () => reject(new Error('Error al procesar la imagen'));
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
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [processingImages, setProcessingImages] = useState<Set<number>>(new Set());

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: `simpleSections.${sectionIndex}.questions` as const,
  });

  // Watch the current questions to get real-time updates including images
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

  const handleSectionUpdate = (field: keyof SimpleSection, value: FormFieldValue) => {
    if (onUpdate) {
      onUpdate(sectionIndex, { [field]: value });
    }
  };

  const handleImageUpload = async (questionIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño del archivo original (ejemplo: máximo 10MB para el archivo original)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      alert('La imagen es demasiado grande. Máximo 10MB permitido');
      return;
    }

    try {
      // Marcar como cargando
      setUploadingImages(prev => new Set([...prev, questionIndex]));
      setProcessingImages(prev => new Set([...prev, questionIndex]));

      // Crear URL temporal para previsualización inmediata
      const tempImageUrl = URL.createObjectURL(file);
      
      // Actualizar inmediatamente en el formulario para mostrar la previsualización
      setValue(`simpleSections.${sectionIndex}.questions.${questionIndex}.image`, tempImageUrl);

      // Procesar y convertir imagen a base64
      let base64Image: string;
      
      try {
        // Redimensionar y comprimir la imagen para optimizar el base64
        base64Image = await processImage(file, 1200, 800, 0.8);
        console.log('Imagen procesada y convertida a base64');
      } catch (processError) {
        console.warn('Error al procesar imagen, usando conversión directa:', processError);
        // Fallback: conversión directa sin procesamiento
        base64Image = await convertFileToBase64(file);
      }

      // Validar tamaño del base64 (opcional: máximo 2MB en base64)
      const base64Size = (base64Image.length * 3) / 4; // Aproximación del tamaño en bytes
      const maxBase64Size = 2 * 1024 * 1024; // 2MB
      
      if (base64Size > maxBase64Size) {
        console.warn('Base64 muy grande, intentando mayor compresión...');
        try {
          // Intentar con mayor compresión
          base64Image = await processImage(file, 800, 600, 0.6);
        } catch (compressionError) {
          console.error('Error en compresión adicional:', compressionError);
          // Continuar con la imagen original si falla la compresión
        }
      }

      // Liberar URL temporal
      URL.revokeObjectURL(tempImageUrl);

      // Guardar la imagen en base64 en el formulario
      setValue(`simpleSections.${sectionIndex}.questions.${questionIndex}.image`, base64Image);

      console.log('Imagen guardada como base64. Tamaño aproximado:', Math.round(base64Size / 1024), 'KB');
      
    } catch (error) {
      console.error('Error uploading/processing image:', error);
      alert('Error al procesar la imagen. Por favor, intenta con otra imagen o un formato diferente.');
      
      // Limpiar la imagen si hay error
      setValue(`simpleSections.${sectionIndex}.questions.${questionIndex}.image`, undefined);
    } finally {
      // Quitar del estado de carga
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });
      setProcessingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });

      // Limpiar el input file
      event.target.value = '';
    }
  };

  const removeImage = (questionIndex: number) => {
    const currentImage = watchedQuestions?.[questionIndex]?.image;
    
    // Si es una URL temporal (blob), liberarla
    if (currentImage && currentImage.startsWith('blob:')) {
      URL.revokeObjectURL(currentImage);
    }
    
    setValue(`simpleSections.${sectionIndex}.questions.${questionIndex}.image`, undefined);
    console.log('Remove image from question:', questionIndex);
  };

  // Función helper para determinar si una imagen es base64
  const isBase64Image = (imageUrl?: string): boolean => {
    return imageUrl?.startsWith('data:image/') || false;
  };

  // Función helper para obtener info del tamaño de la imagen
  const getImageInfo = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    
    if (isBase64Image(imageUrl)) {
      const sizeInBytes = (imageUrl.length * 3) / 4;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      return `Base64 (~${sizeInKB}KB)`;
    } else if (imageUrl.startsWith('blob:')) {
      return 'Procesando...';
    } else {
      return 'URL externa';
    }
  };

  // Usar watchedQuestions en lugar de questions para obtener datos actualizados
  const currentQuestions = watchedQuestions || questions;
  const questionsWithImages = currentQuestions.filter(q => q?.image).length;

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
              {currentQuestions.length} pregunta{currentQuestions.length !== 1 ? "s" : ""}
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
        {/* Título de la sección */}
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

        {/* Header de preguntas */}
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

        {/* Lista de preguntas */}
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
              No hay preguntas. Haz clic en &quot;Agregar Pregunta&quot; para comenzar.
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
                "&:hover": { borderColor: "primary.main" }
              }}
            >
              <CardContent>
                <Grid container spacing={2}>
                  {/* Campo de texto de la pregunta */}
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
                          message: "La pregunta debe tener al menos 5 caracteres",
                        },
                      }}
                      disabled={disabled}
                    />
                  </Grid>

                  {/* Sección de imagen - Previsualización */}
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
                            opacity: (uploadingImages.has(questionIndex) || processingImages.has(questionIndex)) ? 0.7 : 1,
                          }}
                          onError={(e) => {
                            console.error('Error loading image:', e);
                            // Opcional: mostrar imagen placeholder en caso de error
                          }}
                        />
                        
                        {/* Indicador de procesamiento */}
                        {(uploadingImages.has(questionIndex) || processingImages.has(questionIndex)) && (
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
                              {processingImages.has(questionIndex) ? "Procesando..." : "Subiendo..."}
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
                            "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                          }}
                          onClick={() => removeImage(questionIndex)}
                          disabled={disabled || uploadingImages.has(questionIndex) || processingImages.has(questionIndex)}
                        >
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>

                      {/* Info de la imagen */}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        {isBase64Image(question.image) ? (
                          <>✅ Listo para guardar - {getImageInfo(question.image)}</>
                        ) : (
                          <>💡 {getImageInfo(question.image)} - Se convertirá a Base64</>
                        )}
                      </Typography>
                    </Grid>
                  )}

                  {/* Controles de acción */}
                  <Grid size={{ xs: 12 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" gap={1}>
                        {/* Botón para subir imagen */}
                        <Button
                          component="label"
                          variant={question?.image ? "outlined" : "contained"}
                          size="small"
                          startIcon={question?.image ? <Image /> : <CloudUpload />}
                          disabled={disabled || uploadingImages.has(questionIndex) || processingImages.has(questionIndex)}
                          color="primary"
                        >
                          {processingImages.has(questionIndex) 
                            ? "Procesando..." 
                            : uploadingImages.has(questionIndex)
                              ? "Subiendo..."
                              : question?.image 
                                ? "Cambiar imagen" 
                                : "Agregar imagen"
                          }
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(questionIndex, e)}
                          />
                        </Button>

                        {question?.image && !uploadingImages.has(questionIndex) && !processingImages.has(questionIndex) && (
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

                      {/* Número de pregunta y botón eliminar */}
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                          #{questionIndex + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveQuestion(questionIndex)}
                          size="small"
                          disabled={disabled || currentQuestions.length <= minQuestions}
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

        {/* Información adicional */}
        <Box mt={2} p={2} sx={{ backgroundColor: "info.50", borderRadius: 1 }}>
          <Typography variant="caption" color="info.main">
            📷 Sección especial: Esta sección permite preguntas con imágenes opcionales.
            Las imágenes se convierten automáticamente a Base64 para almacenamiento en base de datos.
            Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 10MB (se optimiza automáticamente).
            Las imágenes se redimensionan y comprimen para optimizar el almacenamiento.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};