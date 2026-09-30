"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconButton, Tooltip } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";

/**
 * Lista vertical que se reordena arrastrando (o con teclado).
 * ────────────────────────────────────────────────────────────
 *
 * Genérica: no sabe de formularios. Recibe los ids de los elementos en orden
 * y avisa `onMover(desde, hasta)`; con React Hook Form eso es directamente
 * `useFieldArray().move`.
 *
 * Cada elemento usa {@link useOrdenable} **dentro de su propio componente**
 * (no un envoltorio con render-prop): así el elemento puede seguir
 * memoizado y no se redibuja al escribir en otro.
 *
 * Solo se arrastra desde el asa ({@link AsaArrastre}), para que seleccionar
 * texto dentro de un campo no empiece un arrastre. El sensor de puntero pide
 * moverse 5 px antes de activarse, así un clic en el asa no mueve nada.
 */

const INSTRUCCIONES: ScreenReaderInstructions = {
  draggable:
    "Para reordenar, presiona espacio o enter sobre el asa, muévete con las flechas y vuelve a presionar espacio o enter para soltar. Escape cancela.",
};

const posicion = (ids: string[], id: string | number) => ids.indexOf(String(id)) + 1;

const anuncios = (ids: string[]): Announcements => ({
  onDragStart: ({ active }) => `Elemento ${posicion(ids, active.id)} tomado.`,
  onDragOver: ({ over }) => (over ? `Sobre la posición ${posicion(ids, over.id)}.` : "Fuera de la lista."),
  onDragEnd: ({ over }) => (over ? `Soltado en la posición ${posicion(ids, over.id)}.` : "Soltado fuera de la lista."),
  onDragCancel: () => "Reordenamiento cancelado.",
});

interface ListaOrdenableProps {
  /** Ids de los elementos, en el orden actual. */
  ids: string[];
  onMover: (desde: number, hasta: number) => void;
  deshabilitada?: boolean;
  children: ReactNode;
}

export function ListaOrdenable({ ids, onMover, deshabilitada = false, children }: ListaOrdenableProps) {
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const alSoltar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const desde = ids.indexOf(String(active.id));
    const hasta = ids.indexOf(String(over.id));
    if (desde >= 0 && hasta >= 0) onMover(desde, hasta);
  };

  return (
    <DndContext
      sensors={sensores}
      collisionDetection={closestCenter}
      onDragEnd={alSoltar}
      accessibility={{ announcements: anuncios(ids), screenReaderInstructions: INSTRUCCIONES }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy} disabled={deshabilitada}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

/** Props del asa, tal como las entrega {@link useOrdenable}. */
export type PropsAsa = ReturnType<typeof useOrdenable>["asa"];

/**
 * Para usar dentro del componente de cada elemento de una
 * {@link ListaOrdenable}: `nodoRef` y `estilo` van en el contenedor del
 * elemento, `asa` en {@link AsaArrastre}.
 */
export function useOrdenable(id: string, deshabilitado = false) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: deshabilitado });

  const estilo: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 2 : undefined,
    boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.18)" : undefined,
  };

  return {
    nodoRef: setNodeRef,
    estilo,
    arrastrando: isDragging,
    asa: { ref: setActivatorNodeRef, ...attributes, ...listeners },
  };
}

interface AsaArrastreProps {
  asa: PropsAsa;
  arrastrando?: boolean;
  deshabilitado?: boolean;
  etiqueta?: string;
}

/** El asa (⋮⋮) desde la que se arrastra un elemento. */
export function AsaArrastre({ asa, arrastrando = false, deshabilitado = false, etiqueta = "Arrastrar para reordenar" }: AsaArrastreProps) {
  if (deshabilitado) return null;
  const { ref, ...resto } = asa;
  return (
    <Tooltip title={etiqueta} disableInteractive>
      <IconButton
        ref={ref}
        {...resto}
        size="small"
        aria-label={etiqueta}
        sx={{ cursor: arrastrando ? "grabbing" : "grab", touchAction: "none", color: "text.secondary" }}
      >
        <DragIndicator fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
