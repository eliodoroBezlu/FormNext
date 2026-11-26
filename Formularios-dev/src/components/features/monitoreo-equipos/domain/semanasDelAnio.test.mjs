// Pruebas de las semanas del año. Correr con: yarn test
import { test } from "node:test";
import assert from "node:assert/strict";
import { opcionesDeSemana, SEGUN_PLAN, semanaISO, semanasDelAnio } from "./semanasDelAnio.ts";

test("los años que empiezan en jueves tienen 53 semanas", () => {
  assert.equal(semanasDelAnio(2026), 53); // 1-ene-2026 es jueves
  assert.equal(semanasDelAnio(2027), 52);
  assert.equal(semanasDelAnio(2020), 53); // bisiesto que empieza en miércoles
  assert.equal(semanasDelAnio(2024), 52);
});

test("la semana ISO de un día, con el cambio de año", () => {
  assert.deepEqual(semanaISO("2026-11-12"), { anio: 2026, semana: 46 });
  assert.deepEqual(semanaISO("2026-01-01"), { anio: 2026, semana: 1 });
  assert.deepEqual(semanaISO("2027-01-01"), { anio: 2026, semana: 53 });
  assert.deepEqual(semanaISO("2024-12-30"), { anio: 2025, semana: 1 });
  assert.equal(semanaISO("x"), null);
});

test("las opciones: según plan y las semanas del año del reporte", () => {
  const o = opcionesDeSemana("2027-05-10");
  assert.equal(o[0], SEGUN_PLAN);
  assert.equal(o[1], "Semana 1");
  assert.equal(o.at(-1), "Semana 52");
  assert.equal(o.length, 53);
});

test("en diciembre se suman las semanas del año siguiente", () => {
  const o = opcionesDeSemana("2026-12-15");
  assert.equal(o.length, 1 + 53 + 52);
  assert.equal(o[54], "Semana 1 de 2027");
});
