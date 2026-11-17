import { test } from "node:test";
import assert from "node:assert/strict";
import { puedeContinuarTarea } from "./accionesTarea.ts";

test("el supervisor puede continuar una tarea de un plan manual", () => {
  assert.equal(puedeContinuarTarea({ aprobado: false }, false), true);
  assert.equal(puedeContinuarTarea({}, false), true);
});

test("y también una que salió de una inspección", () => {
  assert.equal(puedeContinuarTarea({ instanceId: "abc", aprobado: false }, false), true);
});

test("una tarea aprobada ya no se continúa", () => {
  assert.equal(puedeContinuarTarea({ aprobado: true }, false), false);
  assert.equal(puedeContinuarTarea({ instanceId: "abc", aprobado: true }, false), false);
});

test("el admin no ve «Continuar»: tiene «Editar»", () => {
  assert.equal(puedeContinuarTarea({ aprobado: false }, true), false);
});
