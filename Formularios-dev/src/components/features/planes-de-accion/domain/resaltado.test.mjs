import { test } from "node:test";
import assert from "node:assert/strict";
import { idsActualizados, idsNuevos } from "./resaltado.ts";

test("las tareas recién agregadas son las que no estaban antes", () => {
  assert.deepEqual(idsNuevos([{ _id: "a" }, { _id: "b" }], [{ _id: "a" }, { _id: "b" }, { _id: "c" }]), ["c"]);
  assert.deepEqual(idsNuevos([{ _id: "a" }], [{ _id: "a" }]), []);
  assert.deepEqual(idsNuevos([], [{}, { _id: "x" }]), ["x"]);
});

test("de la planilla se iluminan solo las filas que actualizaron una tarea", () => {
  const filas = [
    { resultado: "actualiza", tareaId: "a" },
    { resultado: "rechazada", tareaId: "b" },
    { resultado: "sin-cambios", tareaId: "c" },
    { resultado: "actualiza" },
  ];
  assert.deepEqual(idsActualizados(filas), ["a"]);
});
