import { test } from "node:test";
import assert from "node:assert/strict";
import { estadoDePlan, estadoDeTarea } from "./estadosVisuales.ts";

test("un estado se ve igual en la tarea y en el plan", () => {
  for (const estado of ["abierto", "en-progreso", "cerrado"]) {
    assert.deepEqual(estadoDeTarea(estado), estadoDePlan(estado));
  }
  assert.equal(estadoDeTarea("abierto").color, "info");
  assert.equal(estadoDeTarea("cerrado").color, "success");
});

test("los estados propios del plan", () => {
  assert.equal(estadoDePlan("aprobado").color, "success");
  assert.equal(estadoDePlan("sin-observaciones").color, "default");
});

test("un estado desconocido se muestra tal cual, en gris", () => {
  assert.deepEqual(estadoDeTarea("pausado"), { etiqueta: "pausado", color: "default" });
  assert.deepEqual(estadoDeTarea(undefined), { etiqueta: "—", color: "default" });
});
