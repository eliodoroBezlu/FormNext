import { test } from "node:test";
import assert from "node:assert/strict";
import { areaDeLaInspeccion, conTareasQueSeguir, estaEnPestana, nombreDeArea } from "./pestanasPlan.ts";

const plan = (estado, extra = {}) => ({ estado, tareas: [], ...extra });

test("cada plan cae en la pestaña de su estado", () => {
  assert.equal(estaEnPestana(plan("abierto"), "abierto"), true);
  assert.equal(estaEnPestana(plan("abierto"), "cerrado"), false);
});

test("un «sin observaciones» solo aparece en su pestaña, no en Cerradas", () => {
  const sinObs = plan("cerrado", { sinObservaciones: true });
  assert.equal(estaEnPestana(sinObs, "sin-observaciones"), true);
  assert.equal(estaEnPestana(sinObs, "cerrado"), false);
  assert.equal(estaEnPestana(plan("cerrado"), "sin-observaciones"), false);
});

test("aprobadas: todas sus tareas aprobadas, y al menos una", () => {
  const aprobado = plan("cerrado", { tareas: [{ aprobado: true }, { aprobado: true }] });
  const aMedias = plan("cerrado", { tareas: [{ aprobado: true }, { aprobado: false }] });
  assert.equal(estaEnPestana(aprobado, "aprobado"), true);
  assert.equal(estaEnPestana(aMedias, "aprobado"), false);
  assert.equal(estaEnPestana(plan("cerrado"), "aprobado"), false);
});

test("el resumen deja fuera los «sin observaciones»", () => {
  const planes = [plan("cerrado"), plan("cerrado", { sinObservaciones: true })];
  assert.equal(conTareasQueSeguir(planes).length, 1);
});

test("el área se compara sin espacios de más", () => {
  assert.equal(nombreDeArea("Chancado "), "Chancado");
  assert.equal(nombreDeArea(undefined), "");
});

test("el área de la inspección, la escriba la plantilla como la escriba", () => {
  assert.equal(areaDeLaInspeccion({ "Área": "Chancado " }), "Chancado");
  assert.equal(areaDeLaInspeccion({ "Area Física:": "Filtros" }), "Filtros");
  assert.equal(areaDeLaInspeccion({ "Área": "", "Lugar": "Taller" }), "Taller");
  assert.equal(areaDeLaInspeccion({ Supervisor: "x" }), "");
});
