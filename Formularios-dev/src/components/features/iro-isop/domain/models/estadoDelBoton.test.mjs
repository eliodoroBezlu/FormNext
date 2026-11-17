import { test } from "node:test";
import assert from "node:assert/strict";
import { estadoDelBoton } from "./estadoDelBoton.ts";

test("solo el botón pulsado muestra que guarda y que guardó", () => {
  const guardandoAvance = { accion: "avance", guardando: true, guardado: false };
  assert.equal(estadoDelBoton("avance", guardandoAvance), "guardando");
  assert.equal(estadoDelBoton("terminar", guardandoAvance), "inactivo");

  const terminada = { accion: "terminar", guardando: false, guardado: true };
  assert.equal(estadoDelBoton("terminar", terminada), "guardado");
  assert.equal(estadoDelBoton("avance", terminada), "inactivo");
});

test("si falló, el botón vuelve a reposo", () => {
  assert.equal(estadoDelBoton("terminar", { accion: "terminar", guardando: false, guardado: false }), "inactivo");
  assert.equal(estadoDelBoton("avance", { accion: null, guardando: false, guardado: false }), "inactivo");
});
