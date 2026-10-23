import { test } from "node:test";
import assert from "node:assert/strict";
import { campoDeArea, valorInicialDelCampo } from "./valoresIniciales.ts";

const HOY = new Date(2026, 9, 23, 15, 40);

test("la fecha de inspección nace con el día de hoy, a medianoche", () => {
  const fecha = valorInicialDelCampo({ label: "Fecha inspección:", type: "date" }, HOY);
  assert.ok(fecha instanceof Date);
  assert.equal(fecha.getDate(), 23);
  assert.equal(fecha.getHours(), 0);
});

test("la empresa nace como MSC", () => {
  assert.equal(valorInicialDelCampo({ label: "Empresa", type: "autocomplete", dataSource: "empresa" }), "MSC");
});

test("el resto nace vacío", () => {
  assert.equal(valorInicialDelCampo({ label: "Supervisor", type: "autocomplete" }), "");
  assert.equal(valorInicialDelCampo({ label: "Fecha", type: "text" }), "");
});

test("gana el área del maestro aunque antes venga un «Area Física» de texto", () => {
  // F47, F48 y F51: «Area Física:» (texto libre) y después «Area» (lista del maestro).
  const campos = [
    { label: "Area Física:", type: "text" },
    { label: "Area", type: "autocomplete", dataSource: "area" },
  ];
  const esArea = () => true;
  assert.equal(campoDeArea(campos, esArea)?.label, "Area");
});

test("sin área del maestro, la primera que el detector reconoce, no el lugar", () => {
  const campos = [{ label: "Lugar" }, { label: "Área" }];
  const esArea = (e) => e.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("AREA");
  assert.equal(campoDeArea(campos, esArea)?.label, "Área");
});
