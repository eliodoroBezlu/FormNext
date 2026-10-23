import { test } from "node:test";
import assert from "node:assert/strict";
import { faltantesParaEstado, siguienteEstado, valorDelHistorial } from "./requisitosTarea.ts";

const HOY = new Date(2026, 9, 22);
const programada = (extra = {}) => ({
  familiaPeligro: "Sustancias peligrosas",
  accionPropuesta: "Rotular los bidones según la hoja SDS",
  responsableAreaCierre: "Jhonny Eugenio",
  fechaHallazgo: new Date(2026, 9, 20),
  fechaCumplimientoAcordada: new Date(2026, 9, 30),
  ...extra,
});

test("una tarea programada puede pasar a en progreso", () => {
  assert.deepEqual(faltantesParaEstado(programada(), "en-progreso", HOY), []);
});

test("una acción de pocas letras no alcanza", () => {
  assert.deepEqual(faltantesParaEstado(programada({ accionPropuesta: "ok" }), "en-progreso", HOY), [
    "una acción propuesta más completa (al menos 10 caracteres)",
  ]);
});

test("cerrar exige fecha efectiva y evidencia", () => {
  assert.deepEqual(faltantesParaEstado(programada(), "cerrado", HOY), [
    "la fecha de cumplimiento efectiva",
    "al menos una evidencia del cierre",
  ]);
});

test("con fecha efectiva de hoy y una evidencia, cierra", () => {
  const lista = faltantesParaEstado(
    programada({ fechaCumplimientoEfectiva: HOY, evidencias: [{ nombre: "f.jpg", url: "/u/f.jpg" }] }),
    "cerrado",
    HOY,
  );
  assert.deepEqual(lista, []);
});

test("el flujo normal avanza de a un paso", () => {
  assert.equal(siguienteEstado("abierto"), "en-progreso");
  assert.equal(siguienteEstado("en-progreso"), "cerrado");
  assert.equal(siguienteEstado("cerrado"), null);
});

test("el historial muestra el nombre del estado y «—» para vacío", () => {
  assert.equal(valorDelHistorial("estado", "en-progreso"), "En progreso");
  assert.equal(valorDelHistorial("fechaCumplimientoEfectiva", ""), "—");
});
