"use client";

import { useState } from "react";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Block, Edit, MoreVert, SwapHoriz } from "@mui/icons-material";
import { ReclasificarDialog } from "./ReclasificarDialog";
import { AnularDialog } from "./AnularDialog";
import { CorregirObservacionDialog } from "./CorregirObservacionDialog";
import {
  admiteAnulacion,
  admiteCorreccion,
  estaFirmada,
  type AnularEntregaPayload,
  type CorregirEntregaPayload,
  type EntregaLinterna,
  type ReclasificarEntregaPayload,
} from "../../domain/models/Linterna";

type Abierto = "reclasificar" | "anular" | "corregir" | null;

export interface AccionesEntregaProps {
  entrega: EntregaLinterna;
  /** Admin y superintendente. */
  puedeReclasificar: boolean;
  /** Solo admin: dejar un registro sin efecto es más grave que corregirlo. */
  puedeAnular: boolean;
  onReclasificar: (
    id: string,
    payload: ReclasificarEntregaPayload,
  ) => Promise<unknown>;
  onAnular: (id: string, payload: AnularEntregaPayload) => Promise<unknown>;
  onCorregir: (id: string, payload: CorregirEntregaPayload) => Promise<unknown>;
}

/**
 * Las correcciones de una entrega, colgadas de su fila del historial.
 *
 * Van en un menú y no en tres botones porque son excepciones: lo normal es
 * mirar el historial, no arreglarlo, y tres botones por fila convertirían la
 * lista en una botonera.
 *
 * Cuando una acción no se puede hacer **se muestra desactivada con el
 * motivo**, en vez de desaparecer: que un botón no esté no explica por qué, y
 * la razón —está firmada— es justo lo que hay que entender.
 */
export function AccionesEntrega({
  entrega,
  puedeReclasificar,
  puedeAnular,
  onReclasificar,
  onAnular,
  onCorregir,
}: AccionesEntregaProps) {
  const [ancla, setAncla] = useState<HTMLElement | null>(null);
  const [abierto, setAbierto] = useState<Abierto>(null);

  const firmada = estaFirmada(entrega);
  const corregible = admiteCorreccion(entrega);
  const anulable = admiteAnulacion(entrega);

  const porQueNo = firmada
    ? "El acta ya está firmada: dice lo que alguien firmó y no se reescribe."
    : "Esta entrega ya no tiene efecto.";

  const abrir = (cual: Exclude<Abierto, null>) => {
    setAbierto(cual);
    setAncla(null);
  };

  /**
   * Un elemento del menú que puede estar desactivado con su explicación.
   *
   * MUI no dispara el `title` de un elemento desactivado —no recibe eventos de
   * ratón—, así que el Tooltip envuelve un `span` que sí los recibe.
   */
  const opcion = (
    clave: Exclude<Abierto, null>,
    icono: React.ReactNode,
    texto: string,
    habilitada: boolean,
  ) => (
    <Tooltip title={habilitada ? "" : porQueNo} placement="left">
      <span>
        <MenuItem disabled={!habilitada} onClick={() => abrir(clave)}>
          <ListItemIcon>{icono}</ListItemIcon>
          <ListItemText>{texto}</ListItemText>
        </MenuItem>
      </span>
    </Tooltip>
  );

  return (
    <>
      <Tooltip title="Corregir esta entrega">
        <IconButton size="small" onClick={(e) => setAncla(e.currentTarget)}>
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={ancla} open={!!ancla} onClose={() => setAncla(null)}>
        {puedeReclasificar &&
          opcion(
            "reclasificar",
            <SwapHoriz fontSize="small" />,
            "Reclasificar…",
            corregible,
          )}
        {puedeReclasificar &&
          opcion(
            "corregir",
            <Edit fontSize="small" />,
            "Corregir observación…",
            corregible,
          )}
        {puedeAnular &&
          opcion("anular", <Block fontSize="small" />, "Anular…", anulable)}
      </Menu>

      {abierto === "reclasificar" && (
        <ReclasificarDialog
          entrega={entrega}
          onCerrar={() => setAbierto(null)}
          onReclasificar={onReclasificar}
        />
      )}
      {abierto === "anular" && (
        <AnularDialog
          entrega={entrega}
          onCerrar={() => setAbierto(null)}
          onAnular={onAnular}
        />
      )}
      {abierto === "corregir" && (
        <CorregirObservacionDialog
          entrega={entrega}
          onCerrar={() => setAbierto(null)}
          onCorregir={onCorregir}
        />
      )}
    </>
  );
}
