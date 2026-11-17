import { test } from "node:test";
import assert from "node:assert/strict";
import { completarOpciones } from "./opcionesConfirmacion.ts";

test("eliminar: botón «Eliminar» en rojo", () => {
  const o = completarOpciones("¿Estás seguro de que quieres eliminar este tag?");
  assert.equal(o.textoConfirmar, "Eliminar");
  assert.equal(o.peligro, true);
  assert.match(o.titulo, /^Eliminar/);
});

test("dar de baja: botón «Dar de baja» en rojo", () => {
  const o = completarOpciones("¿Está seguro de que desea dar de baja esta tarea?");
  assert.equal(o.textoConfirmar, "Dar de baja");
  assert.equal(o.peligro, true);
});

test("lo demás: «Continuar», sin rojo; las opciones explícitas mandan", () => {
  const o = completarOpciones("¿Desea iniciar la migración del inventario?");
  assert.equal(o.textoConfirmar, "Continuar");
  assert.equal(o.peligro, false);
  const p = completarOpciones({ mensaje: "x", titulo: "Traer datos de la IRO", textoConfirmar: "Traer datos" });
  assert.equal(p.titulo, "Traer datos de la IRO");
  assert.equal(p.textoConfirmar, "Traer datos");
  assert.equal(p.textoCancelar, "Cancelar");
});
