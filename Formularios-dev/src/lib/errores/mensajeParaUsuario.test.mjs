import { test } from "node:test";
import assert from "node:assert/strict";
import { FALLA_DEL_SERVIDOR, SIN_CONEXION, mensajeParaUsuario } from "./mensajeParaUsuario.ts";

test("los errores de red de cada navegador y del servidor de Next se leen igual", () => {
  for (const crudo of [
    "Failed to fetch",
    "fetch failed",
    "Load failed",
    "NetworkError when attempting to fetch resource.",
    "connect ECONNREFUSED 127.0.0.1:3002",
    "The operation was aborted.",
  ]) {
    assert.equal(mensajeParaUsuario(new TypeError(crudo), "x"), SIN_CONEXION, crudo);
  }
});

test("un «HTTP 500» pelado se explica; uno con motivo del servidor pasa tal cual", () => {
  assert.equal(mensajeParaUsuario(new Error("HTTP 502"), "x"), FALLA_DEL_SERVIDOR);
  assert.equal(
    mensajeParaUsuario(new Error("La fecha no puede ser anterior a hoy"), "x"),
    "La fecha no puede ser anterior a hoy",
  );
});

test("la validación de Mongoose en inglés se traduce", () => {
  assert.match(mensajeParaUsuario(new Error("Path `familiaPeligro` is required."), "x"), /^Falta un dato obligatorio \(familiaPeligro\)/);
});

test("sin mensaje, el texto por defecto", () => {
  assert.equal(mensajeParaUsuario(new Error(""), "No se pudo guardar"), "No se pudo guardar");
  assert.equal(mensajeParaUsuario({ algo: 1 }, "No se pudo guardar"), "No se pudo guardar");
  assert.equal(mensajeParaUsuario("Sin permiso", "x"), "Sin permiso");
});
