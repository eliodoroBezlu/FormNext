"use client";

import { useEffect, useState } from "react";

interface Espera {
  /** ¿Hay que seguir mostrando la pantalla de bienvenida? */
  mostrar: boolean;
  /** Lleva demasiado: conviene decírselo a quien espera. */
  tarda: boolean;
}

/**
 * Cuánto tiempo permanece la pantalla de bienvenida.
 *
 * Resuelve dos problemas opuestos:
 *
 * **El destello.** Si la sesión valida en 80 ms, la animación aparece y
 * desaparece en un parpadeo que se lee como un fallo gráfico, no como una
 * bienvenida. Por eso hay un mínimo: una vez mostrada, se queda ese rato
 * aunque el trabajo ya haya terminado.
 *
 * **La espera eterna.** Si algo se cuelga, nadie debe quedarse mirando una
 * animación sin información. Pasado el máximo se marca `tarda` para que la
 * pantalla lo diga. **No desbloquea nada**: dejar pasar por tiempo cumplido
 * sería saltarse la validación de sesión, y eso no es una decisión de diseño
 * visual.
 *
 * Si al montar ya no se estaba cargando, no se muestra nada: una pantalla de
 * espera para algo que no hizo esperar es solo una molestia.
 */
export function useEsperaEnPantalla(
  cargando: boolean,
  minimoMs: number,
  maximoMs: number,
): Espera {
  /**
   * Se fija al montar y no cambia nunca —nunca se llama al modificador—. Es lo
   * que distingue «entré y hubo que esperar» de «esto ya estaba listo»: sin
   * esta marca, cualquier render posterior mostraría la pantalla por el mínimo
   * aunque no hubiera nada que esperar.
   *
   * Con `useState` y no con `useRef`: leer un ref durante el render no es
   * seguro con renderizado concurrente, y aquí se lee en cada render para
   * decidir qué devolver.
   */
  const [huboEspera] = useState(cargando);

  const [minimoCumplido, setMinimoCumplido] = useState(false);
  const [tarda, setTarda] = useState(false);

  useEffect(() => {
    if (!huboEspera) return;

    // Los setState van dentro de los temporizadores, no en el cuerpo del
    // efecto: no son cascada de renders, son cosas que pasan más tarde.
    const aMinimo = setTimeout(() => setMinimoCumplido(true), minimoMs);
    const aMaximo = setTimeout(() => setTarda(true), maximoMs);

    return () => {
      clearTimeout(aMinimo);
      clearTimeout(aMaximo);
    };
    // `huboEspera` va en las dependencias aunque nunca cambie: satisfacer la
    // regla cuesta nada y evita que el próximo que la lea se pregunte si el
    // hueco es intencionado o un olvido.
  }, [minimoMs, maximoMs, huboEspera]);

  if (!huboEspera) return { mostrar: false, tarda: false };

  return { mostrar: cargando || !minimoCumplido, tarda };
}
