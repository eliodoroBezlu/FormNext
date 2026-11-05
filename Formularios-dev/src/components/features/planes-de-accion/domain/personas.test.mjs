import { test } from "node:test";
import assert from "node:assert/strict";
import { personasDe, textoDePersonas } from "./personas.ts";

test("un nombre solo sigue siendo una persona", () => {
  assert.deepEqual(personasDe("Prueba Supervisor"), ["Prueba Supervisor"]);
  assert.deepEqual(personasDe(""), []);
  assert.deepEqual(personasDe(undefined), []);
});

test("varias personas separadas por coma, sin vacíos ni repetidos", () => {
  assert.deepEqual(personasDe(" Ana Pérez ,, luis  mamani, Ana Pérez"), ["Ana Pérez", "luis mamani"]);
});

test("se guardan con coma y espacio", () => {
  assert.equal(textoDePersonas(["Ana Pérez", " Luis Mamani ", "ana pérez"]), "Ana Pérez, Luis Mamani");
  assert.equal(textoDePersonas([]), "");
});
