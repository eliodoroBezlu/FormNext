/**
 * Lleva la pantalla a la primera pregunta con error, le da el foco y la hace
 * destellar y vibrar una vez, para que se vea qué falta (Patrón 2 de
 * `CLAUDE.md`: doble `requestAnimationFrame`, porque MUI pinta el error un
 * cuadro después del intento de envío).
 *
 * Con «reducir movimiento» desplaza sin animación y no destella.
 */
export const SELECTOR_DE_ERROR = '[data-question-error="true"], [aria-invalid="true"]';

/** El rojo de error del tema (`error.main`), para el destello. */
const ROJO = "185, 28, 28";

export function irAlPrimerError(selector: string = SELECTOR_DE_ERROR): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const elemento = document.querySelector<HTMLElement>(selector);
      if (!elemento) return;

      const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      elemento.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "center" });

      const enfocable = elemento.querySelector<HTMLElement>("input, textarea, button[aria-pressed]");
      // Sin desplazar de nuevo: el foco cortaba el desplazamiento suave.
      (enfocable ?? elemento).focus?.({ preventScroll: true });

      if (quieto || typeof elemento.animate !== "function") return;
      // Espera a que termine de llegar para que el destello se vea.
      setTimeout(() => {
        elemento.animate(
          [
            { transform: "translateX(0)", boxShadow: `0 0 0 0 rgba(${ROJO}, 0)` },
            { transform: "translateX(-6px)", boxShadow: `0 0 0 4px rgba(${ROJO}, 0.45)`, offset: 0.15 },
            { transform: "translateX(5px)", offset: 0.3 },
            { transform: "translateX(-3px)", offset: 0.45 },
            { transform: "translateX(2px)", offset: 0.6 },
            { transform: "translateX(0)", boxShadow: `0 0 0 4px rgba(${ROJO}, 0.3)`, offset: 0.7 },
            { transform: "translateX(0)", boxShadow: `0 0 0 0 rgba(${ROJO}, 0)` },
          ],
          { duration: 900, easing: "ease-out" },
        );
      }, 400);
    });
  });
}
