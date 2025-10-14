"use client";

import React, { useState } from "react";
import { Control, FieldErrors } from "react-hook-form";
import {
  Box,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
  Modal,
  Button,
} from "@mui/material";
import { ExpandMore, ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import { FormDataHerraEquipos, Section } from "./types/IProps";
import { QuestionRenderer } from "./QuestionRenderer";
import Image from "next/image";

interface SectionRendererProps<
  T extends FormDataHerraEquipos = FormDataHerraEquipos
> {
  section: Section;
  sectionPath: string;
  control: Control<T>;
  errors: FieldErrors<T>;
  level?: number;
  readonly?: boolean;
}

export const SectionRenderer = <
  T extends FormDataHerraEquipos = FormDataHerraEquipos
>({
  section,
  sectionPath,
  control,
  errors,
  level = 0,
  readonly = false,
}: SectionRendererProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const hasImages = section.images && section.images.length > 0;
  const hasQuestions = !section.isParent && section.questions.length > 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (section.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (section.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const currentImage = section.images?.[currentImageIndex];

  return (
    <Accordion defaultExpanded={level < 2} sx={{ mb: 2, ml: level * 2 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box>
          <Typography variant="h6" fontWeight="medium">
            {section.isParent ? "📁" : "📄"} {section.title}
          </Typography>
          {section.description && (
            <Typography variant="caption" color="text.secondary">
              {section.description}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
          {/* Columna de Contenido - 10 xs, 6 md */}
          <Grid size={{ xs: hasImages ? 10 : 12, md: 6 }}>
            {/* Preguntas de la sección */}
            {hasQuestions && (
              <Box mb={2}>
                {section.questions.map((question, qIdx) => (
                  <Box key={question._id || qIdx}>
                    <QuestionRenderer
                      question={question}
                      sectionPath={sectionPath}
                      questionIndex={qIdx}
                      control={control}
                      errors={errors}
                      readonly={readonly}
                    />
                    {/* Botón "Ver imagen" cada 3 preguntas */}
                    {isMobile && hasImages && (qIdx + 1) % 2 === 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setOpenModal(true)}
                        sx={{
                          width: "100%",
                          my: 1.5,
                          fontSize: "0.75rem",
                        }}
                      >
                        📸 Ver imagen ({currentImageIndex + 1}/{section.images!.length})
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Subsecciones recursivas */}
            {section.subsections && section.subsections.length > 0 && (
              <Box>
                {section.subsections.map((subsection, subIdx) => (
                  <SectionRenderer
                    key={subsection._id || subIdx}
                    section={subsection}
                    sectionPath={`${sectionPath}.sub${subIdx}`}
                    control={control}
                    errors={errors}
                    level={level + 1}
                    readonly={readonly}
                  />
                ))}
              </Box>
            )}
          </Grid>

          {/* Columna de Imágenes - 2 xs, 6 md (solo en móvil muestra botón) */}
          {hasImages && (
            <Grid
              size={{ xs: 2, md: 6 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                justifyContent: "flex-start",
              }}
            >
              {!isMobile ? (
                // GRID PARA DESKTOP
                <>
                  {section.images?.map((img, idx) => (
                    <Card
                      key={img._id || idx}
                      variant="outlined"
                      sx={{
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minHeight: 0,
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.02)" },
                      }}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setOpenModal(true);
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "150px",
                        }}
                      >
                        <Image
                          src={img.url}
                          alt={img.caption || "Imagen"}
                          fill
                          style={{
                            objectFit: "contain",
                            padding: "8px",
                          }}
                        />
                      </Box>
                      {img.caption && (
                        <Box
                          sx={{
                            p: 1,
                            textAlign: "center",
                            borderTop: "1px solid #e0e0e0",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {img.caption}
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  ))}
                </>
              ) : (
                // BOTÓN "VER IMAGEN" EN MÓVIL
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setOpenModal(true)}
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: "0.75rem",
                  }}
                >
                  Ver imagen
                  {section.images!.length > 1 && ` (${section.images!.length})`}
                </Button>
              )}
            </Grid>
          )}
        </Grid>
      </AccordionDetails>

      {/* MODAL CON CARRUSEL */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            width: { xs: "95%", sm: "500px", md: "700px" },
          }}
        >
          {/* Botón cerrar */}
          <IconButton
            onClick={() => setOpenModal(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.1)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
            }}
          >
            <Close />
          </IconButton>

          {/* Imagen del carrusel */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: { xs: "300px", sm: "400px", md: "500px" },
              mb: 2,
            }}
          >
            <Image
              key={currentImageIndex}
              src={currentImage?.url || ""}
              alt={currentImage?.caption || "Imagen"}
              fill
              style={{
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Pie de foto */}
          {currentImage?.caption && (
            <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
              {currentImage.caption}
            </Typography>
          )}

          {/* Controles de navegación */}
          {section.images!.length > 1 && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <IconButton onClick={handlePrevImage}>
                  <ChevronLeft />
                </IconButton>

                <Typography variant="body2">
                  {currentImageIndex + 1} / {section.images!.length}
                </Typography>

                <IconButton onClick={handleNextImage}>
                  <ChevronRight />
                </IconButton>
              </Box>

              {/* Indicadores de puntos */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                {section.images!.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor:
                        idx === currentImageIndex ? "#1976d2" : "#ccc",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Accordion>
  );
};