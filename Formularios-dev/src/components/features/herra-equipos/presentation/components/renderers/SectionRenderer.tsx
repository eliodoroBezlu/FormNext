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
import {
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Close,
  FolderOpen,
  Article,
} from "@mui/icons-material";
import { Chip as MuiChip } from "@mui/material";
import { FormDataHerraEquipos, Section, FormFeatureConfig, SectionImage } from "../../../types/IProps";
import { QuestionRenderer } from "./QuestionRenderer";
import Image from "next/image";

interface SectionRendererProps<T extends FormDataHerraEquipos = FormDataHerraEquipos> {
  section: Section;
  sectionPath: string;
  control: Control<T>;
  errors: FieldErrors<T>;
  level?: number;
  readonly?: boolean;
  formConfig: FormFeatureConfig;
  parentImages?: SectionImage[];
}

export const SectionRenderer = <T extends FormDataHerraEquipos = FormDataHerraEquipos>({
  section,
  sectionPath,
  control,
  errors,
  level = 0,
  readonly = false,
  formConfig,
  parentImages,
}: SectionRendererProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const effectiveImages = (section.images && section.images.length > 0)
    ? section.images
    : (parentImages && parentImages.length > 0 ? parentImages : (section.images || []));

  const hasImages = effectiveImages && effectiveImages.length > 0;
  
  // En escritorio, si es una subsección (level > 0) y hereda del padre,
  // no renderizamos de nuevo las imágenes en la derecha para evitar duplicación
  const showDesktopImages = hasImages && (!parentImages || (section.images && section.images.length > 0));

  const hasQuestions = !section.isParent && section.questions.length > 0;

  // Count validation errors under this section's path
  const countNestedErrors = (obj: unknown): number => {
    if (!obj || typeof obj !== "object") return 0;
    const rec = obj as Record<string, unknown>;
    if ("message" in rec && typeof rec.message === "string") return 1;
    return Object.values(rec).reduce<number>(
      (sum, val) => sum + countNestedErrors(val),
      0,
    );
  };
  const getAtPath = (obj: unknown, path: string): unknown =>
    path.split(".").reduce<unknown>((cur, part) => {
      if (!cur || typeof cur !== "object") return undefined;
      return (cur as Record<string, unknown>)[part];
    }, obj);

  const errorCount = countNestedErrors(getAtPath(errors, sectionPath));


  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (effectiveImages?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (effectiveImages?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const currentImage = effectiveImages?.[currentImageIndex];

  return (
    <Accordion defaultExpanded={level < 2} sx={{ mb: 2, ml: level * 2 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: "100%" }}>
          {section.isParent ? (
            <FolderOpen fontSize="small" color="action" aria-hidden="true" />
          ) : (
            <Article fontSize="small" color="action" aria-hidden="true" />
          )}
          <Typography variant="h6" fontWeight="medium" sx={{ flex: 1 }}>
            {section.title}
          </Typography>
          {errorCount > 0 && (
            <MuiChip
              label={`${errorCount} error${errorCount > 1 ? "es" : ""}`}
              size="small"
              color="error"
              variant="filled"
              sx={{ mr: 1, fontSize: "0.7rem", height: 20 }}
              aria-label={`${errorCount} campo${errorCount > 1 ? "s" : ""} con error en esta sección`}
            />
          )}
          {section.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ width: "100%", mt: 0.25 }}
            >
              {section.description}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: showDesktopImages ? 6 : 12 }}>
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
                      formConfig={formConfig}
                    />
                    {isMobile && hasImages && (qIdx + 1) % 2 === 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setOpenModal(true)}
                        sx={{ width: "100%", my: 1.5, fontSize: "0.75rem" }}
                      >
                        📸 Ver imagen ({currentImageIndex + 1}/{effectiveImages!.length})
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            )}

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
                    formConfig={formConfig}
                    parentImages={effectiveImages}
                  />
                ))}
              </Box>
            )}
          </Grid>

          {showDesktopImages && !isMobile && (
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex", flexDirection: "column", gap: 2, alignSelf: "stretch" }}
            >
              {effectiveImages?.map((img, idx) => (
                <Card
                  key={img._id || idx}
                  variant="outlined"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 200,
                  }}
                >
                  <Box sx={{ position: "relative", width: "100%", minHeight: 200, flex: 1 }}>
                    <Image
                      src={img.url}
                      alt={img.caption || "Imagen"}
                      fill
                      style={{ objectFit: "contain", padding: "8px" }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Box>
                  {img.caption && (
                    <Box sx={{ p: 1.5, textAlign: "center", borderTop: "1px solid #e0e0e0", flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        {img.caption}
                      </Typography>
                    </Box>
                  )}
                </Card>
              ))}
            </Grid>
          )}
        </Grid>
      </AccordionDetails>

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
          <IconButton
            onClick={() => setOpenModal(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.1)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
              zIndex: 1,
            }}
          >
            <Close />
          </IconButton>

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
              style={{ objectFit: "contain" }}
              sizes="90vw"
            />
          </Box>

          {currentImage?.caption && (
            <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
              {currentImage.caption}
            </Typography>
          )}

          {effectiveImages!.length > 1 && (
            <>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
              >
                <IconButton onClick={handlePrevImage}>
                  <ChevronLeft />
                </IconButton>
                <Typography variant="body2">
                  {currentImageIndex + 1} / {effectiveImages!.length}
                </Typography>
                <IconButton onClick={handleNextImage}>
                  <ChevronRight />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                {effectiveImages!.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: idx === currentImageIndex ? "#1976d2" : "#ccc",
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
