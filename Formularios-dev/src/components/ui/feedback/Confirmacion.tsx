"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import { completarOpciones, type OpcionesConfirmacion } from "./opcionesConfirmacion";

export type { OpcionesConfirmacion };

type Confirmar = (opciones: string | OpcionesConfirmacion) => Promise<boolean>;

const ContextoConfirmacion = createContext<Confirmar | null>(null);

/**
 * Diálogo de confirmación del sistema, en lugar del `confirm()` del navegador
 * (que no sigue el tema ni el modo oscuro y se ve distinto en cada celular).
 * Se monta una vez en el layout del panel; las pantallas usan `useConfirmar`.
 */
export function ConfirmacionProvider({ children }: { children: ReactNode }) {
  const [abierta, setAbierta] = useState<Required<OpcionesConfirmacion> | null>(null);
  const resolver = useRef<((si: boolean) => void) | null>(null);
  // Botón que recibe el foco al abrir: «Cancelar» en lo peligroso (un Enter
  // apurado no borra nada), «Confirmar» en lo demás. Se enfoca al terminar la
  // entrada: en desarrollo el modo estricto monta dos veces la trampa de foco
  // de MUI y el `autoFocus` solo se pierde.
  const inicial = useRef<HTMLButtonElement>(null);

  const confirmar = useCallback<Confirmar>((opciones) => {
    // Si había otra abierta, cuenta como cancelada.
    resolver.current?.(false);
    setAbierta(completarOpciones(opciones));
    return new Promise<boolean>((listo) => {
      resolver.current = listo;
    });
  }, []);

  const responder = (si: boolean) => {
    resolver.current?.(si);
    resolver.current = null;
    setAbierta(null);
  };

  return (
    <ContextoConfirmacion.Provider value={confirmar}>
      {children}
      <Dialog
        open={abierta !== null}
        onClose={() => responder(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="confirmacion-titulo"
        aria-describedby="confirmacion-mensaje"
        slotProps={{ transition: { onEntered: () => inicial.current?.focus() } }}
      >
        {abierta && (
          <>
            <DialogTitle id="confirmacion-titulo" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 600 }}>
              {abierta.peligro && <WarningAmberRounded color="error" aria-hidden />}
              {abierta.titulo}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="confirmacion-mensaje" sx={{ color: "text.primary" }}>
                {abierta.mensaje}
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button
                type="button"
                onClick={() => responder(false)}
                autoFocus={abierta.peligro}
                ref={abierta.peligro ? inicial : undefined}
              >
                {abierta.textoCancelar}
              </Button>
              <Button
                type="button"
                variant="contained"
                color={abierta.peligro ? "error" : "primary"}
                onClick={() => responder(true)}
                autoFocus={!abierta.peligro}
                ref={abierta.peligro ? undefined : inicial}
              >
                {abierta.textoConfirmar}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </ContextoConfirmacion.Provider>
  );
}

/** `await confirmar("¿Eliminar…?")` → `true` si confirmó. Requiere `ConfirmacionProvider`. */
export function useConfirmar(): Confirmar {
  const confirmar = useContext(ContextoConfirmacion);
  if (!confirmar) throw new Error("useConfirmar se usa dentro de ConfirmacionProvider");
  return confirmar;
}
