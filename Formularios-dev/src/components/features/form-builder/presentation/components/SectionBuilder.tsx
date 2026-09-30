"use client";

import { memo, useCallback, useState } from "react";
import { get, useFieldArray, useFormState, useWatch, type Control } from "react-hook-form";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Add, Delete, Description, ExpandMore, FolderOpen } from "@mui/icons-material";
import { Button } from "@/components/ui/buttons/Button";
import { FormField } from "@/components/ui/inputs/FormField";
import type { FormBuilderData, Question, Section } from "@/types/formTypes";
import { preguntasDeSeccion, puntosDeSeccion } from "../../domain/models/estadisticasPlantilla";
import { PreguntaFila } from "./PreguntaFila";
import { ListaOrdenable } from "@/components/ui/sortable/ListaOrdenable";

export interface SectionBuilderProps {
  sectionIndex: number;
  control: Control<FormBuilderData>;
  onRemove: (index: number) => void;
  expanded: boolean;
  onToggleExpanded: (index: number) => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  minQuestions?: number;
  maxQuestions?: number;
  /** Ruta de la sección padre, si esta es una subsección. */
  parentPath?: string;
  isNested?: boolean;
}

/** Lee un valor del formulario por ruta dinámica (secciones anidadas). */
function useValor<T>(control: Control<FormBuilderData>, ruta: string): T {
  return useWatch({ control, name: ruta as never }) as T;
}

const INPUT_DESCRIPCION = { multiline: true, rows: 2, placeholder: "Descripción de la sección..." };

/**
 * Una sección (simple o padre) del constructor IRO/ISOP, recursiva para las
 * subsecciones.
 *
 * **No recibe la sección como objeto.** Lee de a un campo lo que muestra
 * (título, descripción, puntaje, si es padre) y deja cada pregunta a su propio
 * componente. Antes la raíz vigilaba todas las secciones y le pasaba a cada
 * una un objeto nuevo en cada tecla: escribir una letra redibujaba todas las
 * preguntas del formulario.
 */
export const SectionBuilder = memo(function SectionBuilder({
  sectionIndex,
  control,
  onRemove,
  expanded,
  onToggleExpanded,
  disabled = false,
  showRemoveButton = true,
  minQuestions = 1,
  maxQuestions = 300,
  parentPath = "",
  isNested = false,
}: SectionBuilderProps) {
  const basePath = parentPath ? `${parentPath}.subsections.${sectionIndex}` : `sections.${sectionIndex}`;

  const esPadre = useValor<boolean | undefined>(control, `${basePath}.isParent`) === true;
  const titulo = useValor<string | undefined>(control, `${basePath}.title`);
  const descripcion = useValor<string | undefined>(control, `${basePath}.description`);
  const puntos = useValor<number | string | undefined>(control, `${basePath}.maxPoints`);
  const idSeccion = useValor<string | undefined>(control, `${basePath}._id`);

  // Una sección con errores después de intentar guardar se abre sola: si
  // quedara cerrada, el scroll al primer error no tendría a dónde ir.
  const { errors, submitCount } = useFormState({ control, name: basePath as never });
  const abierta = expanded || (submitCount > 0 && Boolean(get(errors, basePath)));

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

  const [subseccionesAbiertas, setSubseccionesAbiertas] = useState<Set<number>>(() => new Set([0]));

  const alternarSubseccion = useCallback((i: number) => {
    setSubseccionesAbiertas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(i)) siguiente.delete(i);
      else siguiente.add(i);
      return siguiente;
    });
  }, []);

  const addQuestion = () => {
    if (preguntas.length >= maxQuestions) {
      alert(`Máximo ${maxQuestions} preguntas por sección`);
      return;
    }
    const nueva: Question = { text: "", obligatorio: false };
    agregarPregunta(nueva as never);
  };

  const puedeEliminarPregunta = preguntas.length > minQuestions;
  const removeQuestion = useCallback((i: number) => quitarPregunta(i), [quitarPregunta]);
  const removeSubsection = useCallback((i: number) => quitarSubseccion(i), [quitarSubseccion]);

  const addSubsection = (padre: boolean) => {
    const nueva: Section = {
      title: padre ? "Nueva Subsección Padre" : "Nueva Subsección Simple",
      description: "",
      maxPoints: 0,
      questions: padre ? [] : [{ text: "", obligatorio: false }],
      isParent: padre,
      parentId: idSeccion || null,
      subsections: padre ? [] : undefined,
      order: subsecciones.length,
    };
    agregarSubseccion(nueva as never);
    setSubseccionesAbiertas((prev) => new Set([...prev, subsecciones.length]));
  };

  return (
    <Accordion
      expanded={abierta}
      onChange={() => onToggleExpanded(sectionIndex)}
      sx={{
        mb: 2,
        ml: isNested ? 2 : 0,
        opacity: disabled ? 0.7 : 1,
        pointerEvents: disabled ? "none" : "auto",
        border: esPadre ? "2px solid" : "1px solid",
        borderColor: esPadre ? "primary.main" : "divider",
        backgroundColor: esPadre ? "primary.50" : "background.paper",
      }}
    >
      <Box display="flex" alignItems="center">
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ flexGrow: 1, "&:hover": { backgroundColor: "action.hover" } }}>
          <Box display="flex" flexDirection="column" alignItems="flex-start" width="100%">
            <Box display="flex" alignItems="center" gap={1}>
              {esPadre ? <FolderOpen color="primary" /> : <Description color="action" />}
              <Typography variant="h6" fontWeight={esPadre ? "bold" : "medium"}>
                {esPadre ? "📁" : "📄"} {titulo || "Sin título"}
              </Typography>
            </Box>
            {descripcion && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {descripcion}
              </Typography>
            )}
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              {esPadre ? (
                <ResumenSeccionPadre control={control} basePath={basePath} subsecciones={subsecciones.length} />
              ) : (
                <>
                  <Chip
                    label={`${preguntas.length} pregunta${preguntas.length !== 1 ? "s" : ""}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip label={`${puntos || 0} pts`} size="small" color="success" variant="outlined" />
                </>
              )}
            </Box>
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
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: esPadre ? 12 : 8 }}>
            <FormField
              name={`${basePath}.title` as never}
              control={control}
              label={esPadre ? "Título de la Sección Padre" : "Título de la Sección"}
              rules={{ required: "Título es requerido" }}
              disabled={disabled}
            />
          </Grid>
          {!esPadre && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField
                name={`${basePath}.maxPoints` as never}
                control={control}
                type="number"
                label="Puntaje Máximo"
                rules={{
                  required: "Puntaje Máximo es requerido",
                  valueAsNumber: true,
                  min: { value: 0, message: "Debe ser mayor o igual a 0" },
                  max: { value: 1000, message: "Máximo 1000 puntos" },
                }}
                disabled={disabled}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <FormField
              name={`${basePath}.description` as never}
              control={control}
              label="Descripción (opcional)"
              inputProps={INPUT_DESCRIPCION}
              disabled={disabled}
            />
          </Grid>
        </Grid>

        {!esPadre && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">
                Preguntas ({preguntas.length}/{maxQuestions})
              </Typography>
              {!disabled && (
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addQuestion}
                  disabled={preguntas.length >= maxQuestions}
                >
                  Agregar Pregunta
                </Button>
              )}
            </Box>

            {preguntas.length === 0 ? (
              <Box
                p={3}
                textAlign="center"
                sx={{ border: 1, borderColor: "divider", borderStyle: "dashed", borderRadius: 1, backgroundColor: "grey.50" }}
              >
                <Typography variant="body2" color="text.secondary">
                  No hay preguntas. Haz clic en &quot;Agregar Pregunta&quot; para comenzar.
                </Typography>
              </Box>
            ) : (
              <ListaOrdenable ids={preguntas.map((p) => p.id)} onMover={moverPregunta} deshabilitada={disabled}>
                {preguntas.map((pregunta, i) => (
                  <PreguntaFila
                    key={pregunta.id}
                    id={pregunta.id}
                    basePath={basePath}
                    index={i}
                    control={control}
                    disabled={disabled}
                    puedeEliminar={puedeEliminarPregunta}
                    minPreguntas={minQuestions}
                    onRemove={removeQuestion}
                  />
                ))}
              </ListaOrdenable>
            )}
          </>
        )}

        {esPadre && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="medium">
                Subsecciones ({subsecciones.length})
              </Typography>
              {!disabled && (
                <Box display="flex" gap={1}>
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addSubsection(false)}
                    color="primary"
                  >
                    Subsección Simple
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addSubsection(true)}
                    color="secondary"
                  >
                    Subsección Padre
                  </Button>
                </Box>
              )}
            </Box>

            {subsecciones.length === 0 ? (
              <Box
                p={3}
                textAlign="center"
                sx={{ border: 2, borderColor: "primary.main", borderStyle: "dashed", borderRadius: 1, backgroundColor: "primary.50" }}
              >
                <Typography variant="body2" color="primary.main">
                  No hay subsecciones. Haz clic en los botones de arriba para comenzar.
                </Typography>
              </Box>
            ) : (
              subsecciones.map((sub, i) => (
                <Box key={sub.id} mb={2}>
                  <SectionBuilder
                    sectionIndex={i}
                    control={control}
                    onRemove={removeSubsection}
                    disabled={disabled}
                    isNested
                    parentPath={basePath}
                    showRemoveButton
                    expanded={subseccionesAbiertas.has(i)}
                    onToggleExpanded={alternarSubseccion}
                  />
                </Box>
              ))
            )}
          </>
        )}

        <Box mt={2} p={2} sx={{ backgroundColor: "info.50", borderRadius: 1 }}>
          <Typography variant="caption" color="info.main">
            💡{" "}
            {esPadre
              ? "📁 Sección Padre: Contiene subsecciones. Puede tener Subsecciones Padre o Simples."
              : "📄 Sección Simple: Contiene preguntas. No puede tener subsecciones (es terminal)."}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

/**
 * Totales de una sección padre (preguntas y puntos de todo lo que cuelga).
 * Vigila la sección entera, así que va aparte: con cada tecla dentro de la
 * sección se redibujan solo estos dos chips, no la sección.
 */
function ResumenSeccionPadre({
  control,
  basePath,
  subsecciones,
}: {
  control: Control<FormBuilderData>;
  basePath: string;
  subsecciones: number;
}) {
  const seccion = useValor<Section | undefined>(control, basePath);
  return (
    <>
      <Chip
        label={`${subsecciones} subsección${subsecciones !== 1 ? "es" : ""}`}
        size="small"
        color="primary"
        variant="outlined"
      />
      <Chip label={`${preguntasDeSeccion(seccion)} preguntas totales`} size="small" variant="outlined" />
      <Chip label={`${puntosDeSeccion(seccion)} pts totales`} size="small" color="success" variant="outlined" />
    </>
  );
}
