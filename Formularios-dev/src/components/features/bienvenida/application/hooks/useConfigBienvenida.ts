"use client";

import { useEffect, useSyncExternalStore } from "react";
import { bienvenidaAdapter } from "../../infrastructure/adapters/bienvenidaAdapter";
import {
  BIENVENIDA_POR_DEFECTO,
  normalizar,
  type ConfigBienvenida,
} from "../../domain/models/Bienvenida";

const CLAVE_CONFIG = "bienvenida.config";
const CLAVE_AREA = "bienvenida.area";
const EVENTO = "bienvenida-actualizada";

/**
 * Memo de la caché.
 *
 * `useSyncExternalStore` compara el resultado de `getSnapshot` con `Object.is`,
 * así que devolver un objeto recién parseado en cada llamada haría un bucle
 * infinito de renders. Se guarda el texto crudo junto al objeto y solo se
 * vuelve a parsear cuando el texto cambia de verdad.
 */
let memo: { crudo: string; valor: ConfigBienvenida } | null = null;

const leerCache = (): ConfigBienvenida => {
  if (typeof window === "undefined") return BIENVENIDA_POR_DEFECTO;

  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(CLAVE_CONFIG);
  } catch {
    // Modo privado o almacenamiento lleno: se sigue con los valores por
    // defecto en vez de tumbar la pantalla de entrada.
    return BIENVENIDA_POR_DEFECTO;
  }

  if (!crudo) return BIENVENIDA_POR_DEFECTO;
  if (memo?.crudo === crudo) return memo.valor;

  try {
    const valor = normalizar(JSON.parse(crudo));
    memo = { crudo, valor };
    return valor;
  } catch {
    return BIENVENIDA_POR_DEFECTO;
  }
};

const suscribir = (avisar: () => void) => {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar); // cambios en otra pestaña
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
};

/** En el servidor no hay caché: siempre los valores por defecto. */
const enElServidor = (): ConfigBienvenida => BIENVENIDA_POR_DEFECTO;

const guardarEnCache = (config: ConfigBienvenida) => {
  try {
    window.localStorage.setItem(CLAVE_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new Event(EVENTO));
  } catch {
    /* sin caché se sigue funcionando: solo se pierde la instantaneidad */
  }
};

/**
 * Recuerda el área de quien entró.
 *
 * La pantalla se dibuja **mientras** se valida la sesión, así que en ese
 * momento todavía no se sabe quién es. Guardando el área de la última entrada,
 * a partir de la segunda vez el mensaje de su área aparece desde el primer
 * fotograma en vez de cambiar a mitad de la animación.
 */
export const recordarArea = (area?: string): void => {
  if (typeof window === "undefined") return;
  try {
    if (area?.trim()) window.localStorage.setItem(CLAVE_AREA, area.trim());
    else window.localStorage.removeItem(CLAVE_AREA);
  } catch {
    /* no pasa nada: se usará el mensaje general */
  }
};

export const areaRecordada = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(CLAVE_AREA) ?? undefined;
  } catch {
    return undefined;
  }
};

/**
 * La configuración de bienvenida, lista para pintar.
 *
 * Sigue el patrón de `ThemeContext`: `useSyncExternalStore` en vez de leer
 * `localStorage` en el primer render. Es lo que evita el desajuste de
 * hidratación —en el servidor ese almacenamiento no existe— sin necesidad de
 * un render extra ni de un `mounted` a mano.
 *
 * La red se consulta **después**, y solo escribe en la caché: la pantalla ya
 * se pintó con lo de la vez anterior, así que la petición es para la próxima
 * entrada, no para ésta. Esa es la razón de que se sienta instantánea.
 */
export function useConfigBienvenida(): ConfigBienvenida {
  const config = useSyncExternalStore(suscribir, leerCache, enElServidor);

  useEffect(() => {
    let vigente = true;

    bienvenidaAdapter.obtener().then((fresca) => {
      if (!vigente) return;
      // Solo se escribe si cambió algo: `dispatchEvent` en cada arranque
      // provocaría un render de más sin ninguna diferencia visible.
      const anterior = window.localStorage.getItem(CLAVE_CONFIG);
      const nueva = JSON.stringify(fresca);
      if (anterior !== nueva) guardarEnCache(fresca);
    });

    return () => {
      vigente = false;
    };
  }, []);

  return config;
}
