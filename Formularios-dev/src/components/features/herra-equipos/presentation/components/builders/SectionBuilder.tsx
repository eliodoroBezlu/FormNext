"use client";

import { memo, useCallback } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button as MuiButton,
  Chip,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, ExpandMore } from "@mui/icons-material";
import { ImageManager } from "./ImageManager";
import { QuestionBuilder } from "./QuestionEditor";
import { ListaOrdenable } from "@/components/ui/sortable/ListaOrdenable";
import type {
  FormBuilderDataHerraEquipos,
  QuestionHerraEquipos,
  SectionHerraEquipos,
  SectionImageHerraEquipos,
} from "../../../domain/models/BuilderTypes";

const DEFAULT_SI_NO_NA_OPTIONS = [
  { label: "SI", value: "si", color: "#4caf50" },
  { label: "NO", value: "no", color: "#f44336" },
  { label: "N/A", value: "na", color: "#ff9800" },
];

export interface SectionBuilderProps {
  sectionIndex: number;
  control: Control<FormBuilderDataHerraEquipos>;
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>;
  onRemove: (index: number) => void;
  disabled?: boolean;
  /** Ruta de la sección padre, si esta es una subsección. */
  parentPath?: string;
}

/** Lee un valor del formulario por ruta dinámica (secciones anidadas). */
function useValor<T>(
  control: Control<FormBuilderDataHerraEquipos>,
  ruta: string,
): T {
  return useWatch({ control, name: ruta as never }) as T;
}

const cajaVacia = {
  border: "2px dashed #ddd",
  borderRadius: 2,
  backgroundColor: "#fafafa",
};

/**
 * Una sección del constructor de herramientas, recursiva para subsecciones.
 *
 * No recibe la sección como objeto: lee de a un campo lo que muestra y deja
 * cada pregunta a su propio componente memoizado. Preguntas y subsecciones se
 * agregan con los métodos del field array (antes se reescribía el array
 * entero con `setValue`), y las keys son `field.id`, estables al reordenar.
 */
export const SectionBuilder = memo(function SectionBuilder({
  sectionIndex,
  control,
  setValue,
  onRemove,
  disabled = false,
  parentPath,
}: SectionBuilderProps) {
  const basePath = parentPath
    ? `${parentPath}.subsections.${sectionIndex}`
    : `sections.${sectionIndex}`;

  const titulo = useValor<string | undefined>(control, `${basePath}.title`);
  const descripcion = useValor<string | undefined>(
    control,
    `${basePath}.description`,
  );
  const esPadre =
    useValor<boolean | undefined>(control, `${basePath}.isParent`) === true;
  const idSeccion = useValor<string | undefined>(control, `${basePath}._id`);
  const imagenes = useValor<SectionImageHerraEquipos[] | undefined>(
    control,
    `${basePath}.images`,
  );

  const {
    fields: preguntas,
    append: agregarPregunta,
    remove: quitarPregunta,
    move: moverPregunta,
  } = useFieldArray({ control, name: `${basePath}.questions` as never });

  const {
    fields: subsecciones,
    append: agregarSubseccion,
    remove: quitarSubseccion,
  } = useFieldArray({ control, name: `${basePath}.subsections` as never });

  const setField = (path: string, value: unknown) =>
    setValue(path as keyof FormBuilderDataHerraEquipos, value as never);

  const addQuestion = () => {
    const nueva: QuestionHerraEquipos = {
      text: "",
      obligatorio: true,
      responseConfig: { type: "si_no_na", options: DEFAULT_SI_NO_NA_OPTIONS },
    };
    agregarPregunta(nueva as never);
  };

  const addSubsection = (padre: boolean) => {
    const nueva: SectionHerraEquipos = {
      title: padre ? "Nueva Subsección Padre" : "Nueva Subsección",
      isParent: padre,
      parentId: idSeccion || null,
      questions: [],
      images: [],
      subsections: padre ? [] : undefined,
    };
    agregarSubseccion(nueva as never);
  };

  const removeQuestion = useCallback(
    (i: number) => quitarPregunta(i),
    [quitarPregunta],
  );
  const removeSubsection = useCallback(
    (i: number) => quitarSubseccion(i),
    [quitarSubseccion],
  );

  return (
    <Accordion defaultExpanded={!esPadre} sx={{ mb: 2 }}>
      <Box display="flex" alignItems="flex-start">
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ flexGrow: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight="medium">
              {esPadre ? "📁" : "📄"} {titulo || "Sin título"}
            </Typography>
            {descripcion && (
              <Typography variant="caption" color="text.secondary">
                {descripcion}
              </Typography>
            )}
            <Box mt={0.5}>
              <Chip label={`${preguntas.length} preguntas`} size="small" />
              {subsecciones.length > 0 && (
                <Chip
                  label={`${subsecciones.length} subsecciones`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
              {(imagenes?.length ?? 0) > 0 && (
                <Chip
                  label={`${imagenes?.length} imágenes`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Box>
        </AccordionSummary>
        {!disabled && (
          <Box display="flex" alignItems="center" p={1}>
            <IconButton
              color="error"
              onClick={() => onRemove(sectionIndex)}
              size="small"
              title="Eliminar sección"
              aria-label="Eliminar sección"
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>

      <AccordionDetails>
        <Box>
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={
                  esPadre
                    ? "Título de la Sección Padre"
                    : "Título de la Sección"
                }
                value={titulo ?? ""}
                onChange={(e) => setField(`${basePath}.title`, e.target.value)}
                size="small"
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={descripcion ?? ""}
                onChange={(e) =>
                  setField(`${basePath}.description`, e.target.value)
                }
                size="small"
                multiline
                rows={2}
                disabled={disabled}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <ImageManager
            sectionPath={basePath}
            control={control}
            setValue={setValue}
            disabled={disabled}
          />

          {!esPadre && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Preguntas ({preguntas.length})
                </Typography>
                {!disabled && (
                  <MuiButton
                    type="button"
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={addQuestion}
                  >
                    Agregar Pregunta
                  </MuiButton>
                )}
              </Box>
              {preguntas.length === 0 ? (
                <Box p={3} textAlign="center" sx={cajaVacia}>
                  <Typography color="text.secondary">
                    No hay preguntas. Haz clic en &ldquo;Agregar Pregunta&rdquo;
                    para comenzar.
                  </Typography>
                </Box>
              ) : (
                <ListaOrdenable
                  ids={preguntas.map((p) => p.id)}
                  onMover={moverPregunta}
                  deshabilitada={disabled}
                >
                  {preguntas.map((pregunta, i) => (
                    <QuestionBuilder
                      key={pregunta.id}
                      id={pregunta.id}
                      sectionPath={basePath}
                      questionIndex={i}
                      control={control}
                      setValue={setValue}
                      onRemove={removeQuestion}
                      disabled={disabled}
                    />
                  ))}
                </ListaOrdenable>
              )}
            </>
          )}

          {esPadre && (
            <Box mt={3}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Subsecciones ({subsecciones.length})
                </Typography>
                {!disabled && (
                  <Box display="flex" gap={1}>
                    <MuiButton
                      type="button"
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => addSubsection(false)}
                      color="primary"
                    >
                      Subsección Simple
                    </MuiButton>
                    <MuiButton
                      type="button"
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => addSubsection(true)}
                      color="secondary"
                    >
                      Subsección Padre
                    </MuiButton>
                  </Box>
                )}
              </Box>

              {subsecciones.length === 0 ? (
                <Box p={3} textAlign="center" sx={cajaVacia}>
                  <Typography color="text.secondary">
                    No hay subsecciones. Haz clic en los botones de arriba para
                    comenzar.
                  </Typography>
                </Box>
              ) : (
                subsecciones.map((sub, i) => (
                  <Box key={sub.id} ml={2} mb={2}>
                    <SectionBuilder
                      sectionIndex={i}
                      control={control}
                      setValue={setValue}
                      onRemove={removeSubsection}
                      disabled={disabled}
                      parentPath={basePath}
                    />
                  </Box>
                ))
              )}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});
