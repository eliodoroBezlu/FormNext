"use client";

import { useCallback, useEffect, useState } from "react";
import {
  esPedidoDeToken,
  origenDe,
  RESPUESTA_DE_TOKEN,
  urlDeEntrada,
} from "../../domain/models/entrada";
import {
  obtenerTokenDelServicio,
  WEB_DEL_SERVICIO,
} from "../../infrastructure/adapters/servicioFormulariosAdapter";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "listo"; url: string }
  | { tipo: "error"; mensaje: string };

const ORIGEN_DE_LA_WEB = origenDe(WEB_DEL_SERVICIO);

/**
 * La web del servicio de formularios dentro de forms: pide el token al abrir
 * y le da uno nuevo cada vez que la web lo pide (vence a los 15 minutos).
 * `recargar` vuelve a entrar desde cero, con otro token.
 */
export function useServicioFormularios() {
  const [estado, setEstado] = useState<Estado>(
    ORIGEN_DE_LA_WEB
      ? { tipo: "cargando" }
      : {
          tipo: "error",
          mensaje:
            "Falta NEXT_PUBLIC_FORMULARIOS_WEB_URL en el .env.local de FormNext (por ejemplo, http://localhost:3201).",
        },
  );
  const [entrada, setEntrada] = useState(0);

  useEffect(() => {
    if (!ORIGEN_DE_LA_WEB) return;
    let vigente = true;
    obtenerTokenDelServicio()
      .then((resultado) => {
        if (!vigente) return;
        setEstado(
          resultado.ok
            ? { tipo: "listo", url: urlDeEntrada(WEB_DEL_SERVICIO, resultado.token) }
            : { tipo: "error", mensaje: resultado.mensaje },
        );
      })
      .catch((error: unknown) => {
        if (vigente) {
          setEstado({
            tipo: "error",
            mensaje: error instanceof Error ? error.message : "No se pudo pedir el token",
          });
        }
      });
    return () => {
      vigente = false;
    };
  }, [entrada]);

  // Renovación: la web solo acepta la respuesta si viene del origen firmado
  // en el token (FORMULARIOS_ORIGEN_ANFITRION en el backend).
  useEffect(() => {
    if (!ORIGEN_DE_LA_WEB) return;
    const origenWeb = ORIGEN_DE_LA_WEB;
    const escuchar = (evento: MessageEvent<unknown>) => {
      if (!esPedidoDeToken(evento.origin, evento.data, origenWeb)) return;
      const ventana = evento.source as Window | null;
      obtenerTokenDelServicio().then((resultado) => {
        if (resultado.ok) {
          ventana?.postMessage({ tipo: RESPUESTA_DE_TOKEN, token: resultado.token }, origenWeb);
        }
      });
    };
    window.addEventListener("message", escuchar);
    return () => window.removeEventListener("message", escuchar);
  }, []);

  const recargar = useCallback(() => {
    if (!ORIGEN_DE_LA_WEB) return;
    setEstado({ tipo: "cargando" });
    setEntrada((n) => n + 1);
  }, []);

  return { estado, recargar, web: WEB_DEL_SERVICIO };
}
