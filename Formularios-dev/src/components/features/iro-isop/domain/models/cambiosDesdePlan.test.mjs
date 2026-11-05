import { test } from "node:test";
import assert from "node:assert/strict";
import { ultimoCambioDesdePlan, textoDelCambio } from "./cambiosDesdePlan.ts";

const cambio = (fecha, extra = {}) => ({
  fecha,
  usuario: "eliodoro",
  seccion: "GENERAL",
  pregunta: "¿Las sustancias peligrosas están ordenadas?",
  ...extra,
});

test("devuelve el último cambio de esa pregunta, aunque cambien tildes y mayúsculas", () => {
  const cambios = [
    cambio("2026-11-05T14:00:00Z", { usuario: "primero" }),
    cambio("2026-11-05T16:00:00Z", { usuario: "ultimo" }),
    cambio("2026-11-05T15:00:00Z", { usuario: "medio" }),
  ];
  const hallado = ultimoCambioDesdePlan(
    cambios,
    "general ",
    "¿LAS SUSTANCIAS PELIGROSAS ESTAN ORDENADAS?",
  );
  assert.equal(hallado?.usuario, "ultimo");
});

test("otra pregunta o sin cambios: nada", () => {
  assert.equal(ultimoCambioDesdePlan([cambio("2026-11-05T14:00:00Z")], "GENERAL", "Otra"), undefined);
  assert.equal(ultimoCambioDesdePlan(undefined, "GENERAL", "x"), undefined);
});

test("el texto dice quién y cuándo", () => {
  const texto = textoDelCambio(cambio("2026-11-05T14:00:00Z"));
  assert.match(texto, /^Corregido desde el plan de acción por eliodoro el /);
  assert.match(texto, /2026/);
});
