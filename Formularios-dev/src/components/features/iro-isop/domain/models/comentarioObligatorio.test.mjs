import { test } from "node:test";
import assert from "node:assert/strict";
import { motivoDelComentario } from "./comentarioObligatorio.ts";

const pregunta = (respuesta, obligatoria = false, seccionEnteraNoAplica = false) => ({
  respuesta,
  obligatoria,
  seccionEnteraNoAplica,
});

test("un 0, 1 o 2 se justifica en cualquier pregunta, roja o blanca", () => {
  for (const r of ["0", "1", "2", 0, 2]) {
    assert.ok(motivoDelComentario(pregunta(r, false)));
    assert.ok(motivoDelComentario(pregunta(r, true)));
  }
});

test("un 3 no pide comentario", () => {
  assert.equal(motivoDelComentario(pregunta("3", true)), null);
});

test("«No aplica» se justifica solo en las obligatorias", () => {
  assert.ok(motivoDelComentario(pregunta("N/A", true)));
  assert.equal(motivoDelComentario(pregunta("N/A", false)), null);
});

test("si toda la sección no aplica, se justifica en la sección y no pregunta por pregunta", () => {
  assert.equal(motivoDelComentario(pregunta("N/A", true, true)), null);
});

test("sin responder todavía no pide comentario", () => {
  assert.equal(motivoDelComentario(pregunta("", true)), null);
});
