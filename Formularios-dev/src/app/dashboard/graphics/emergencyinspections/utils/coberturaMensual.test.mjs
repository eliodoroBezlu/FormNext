import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularCoberturaMes, claveCodigo, extintoresACsv, fechaCorta, nivelCobertura } from "./coberturaMensual.ts";

const tags = [
  { tag: "T1", area: "Electrico", activo: true },
  { tag: "T2", area: "Molienda", activo: true },
  { tag: "T3", area: "Molienda", activo: false },
];

const extintores = [
  { CodigoExtintor: "PLA-1", Ubicacion: "Sala 1", tag: "T1", area: "Electrico", activo: true },
  // Mal escrita en el catálogo: cuenta en el área de su tag.
  { CodigoExtintor: "94", Ubicacion: "Sala 2", tag: "T1", area: "Electrica", activo: true },
  { CodigoExtintor: "MS-5", Ubicacion: "Bodega", tag: "T2", area: "Molienda", activo: true },
  // Versión vieja del mismo código, dada de baja: no cuenta.
  { CodigoExtintor: "MS 5", Ubicacion: "Bodega", tag: "T2", area: "Molienda", activo: false },
  { CodigoExtintor: "OLD-9", Ubicacion: "Patio", tag: "T2", area: "Molienda", activo: false },
];

const reg = (codigo, extra = {}) => ({ codigo, ubicacion: "x", fechaInspeccion: "2026-10-02", inspeccionMensual: "✓", ...extra });

test("el mes se busca dentro de cada formulario, no en su «mes actual»", () => {
  // El formulario ya avanzó a noviembre, pero octubre está inspeccionado.
  const formularios = [
    { _id: "a", tag: "T1", area: "Electrico", año: 2026, mesActual: "NOVIEMBRE", meses: { OCTUBRE: { inspeccionesExtintor: [reg("PLA-1"), reg("94")] }, NOVIEMBRE: {} } },
  ];
  const c = calcularCoberturaMes(formularios, extintores, tags, "OCTUBRE", 2026);
  assert.equal(c.totales.cantidad, 3);
  assert.equal(c.totales.inspeccionados, 2);
  assert.equal(c.totales.pct, 67);
  assert.deepEqual(c.areas.map((a) => a.area), ["Electrico", "Molienda"]);
});

test("se juntan los formularios repetidos del mismo tag (agosto en el otro documento)", () => {
  const formularios = [
    { _id: "a", tag: "T2", area: "Molienda", año: 2026, fechaUltimaModificacion: "2026-11-03", meses: { JULIO: { inspeccionesExtintor: [reg("MS-5")] } } },
    { _id: "b", tag: "T2", area: "Molienda", año: 2026, fechaUltimaModificacion: "2026-07-04", meses: { AGOSTO: { inspeccionesExtintor: [reg("ms5")], inspector: { nombre: "Ana" } } } },
  ];
  const c = calcularCoberturaMes(formularios, extintores, tags, "AGOSTO", 2026);
  const t2 = c.tags.find((t) => t.tag === "T2");
  assert.equal(t2.inspeccionado, true);
  assert.equal(t2.inspeccionados, 1);
  assert.equal(t2.inspector, "Ana");
});

test("lo inspeccionado que no está activo en el catálogo se informa aparte, y X es «con observación»", () => {
  const formularios = [
    { _id: "a", tag: "T2", area: "Molienda", año: 2026, meses: { OCTUBRE: { inspeccionesExtintor: [reg("MS-5", { senalizacionSoporte: "X" }), reg("OLD-9"), reg("ZZ-1")] } } },
  ];
  const c = calcularCoberturaMes(formularios, extintores, tags, "OCTUBRE", 2026);
  const ms5 = c.extintores.find((x) => x.codigo === "MS-5");
  assert.equal(ms5.estado, "con-observacion");
  assert.deepEqual(ms5.observaciones, ["Señalización y soporte"]);
  assert.deepEqual(
    c.fueraDeCatalogo.map((x) => `${x.codigo}:${x.motivo}`),
    ["OLD-9:dado-de-baja", "ZZ-1:sin-registro"],
  );
  assert.equal(c.totales.conObservacion, 1);
  // Los tags dados de baja no cuentan.
  assert.equal(c.totales.tagsActivos, 2);
  assert.equal(c.totales.tagsInspeccionados, 1);
});

test("sin año elegido se usa el más reciente con ese mes, por tag", () => {
  const formularios = [
    { _id: "a", tag: "T1", area: "Electrico", año: 2025, meses: { OCTUBRE: { inspeccionesExtintor: [reg("PLA-1"), reg("94")] } } },
    { _id: "b", tag: "T1", area: "Electrico", año: 2026, meses: { OCTUBRE: { inspeccionesExtintor: [reg("PLA-1")] } } },
  ];
  const c = calcularCoberturaMes(formularios, extintores, tags, "OCTUBRE", null);
  assert.equal(c.año, 2026);
  assert.equal(c.tags.find((t) => t.tag === "T1").inspeccionados, 1);
});

test("el alcance por área deja fuera lo demás", () => {
  const c = calcularCoberturaMes([], extintores, tags, "OCTUBRE", 2026, { areas: ["Molienda"] });
  assert.deepEqual(c.extintores.map((x) => x.codigo), ["MS-5"]);
  assert.equal(c.totales.noInspeccionados, 1);
});

test("la fecha del tag es la de inspección más reciente del mes, no la del formulario", () => {
  const formularios = [
    {
      _id: "a", tag: "T1", area: "Electrico", año: 2026, fechaUltimaModificacion: "2026-11-20",
      meses: { OCTUBRE: { inspeccionesExtintor: [reg("PLA-1", { fechaInspeccion: "2026-10-03T00:00:00.000Z" }), reg("94", { fechaInspeccion: "2026-10-09T00:00:00.000Z" })] } },
    },
  ];
  const c = calcularCoberturaMes(formularios, extintores, tags, "OCTUBRE", 2026);
  assert.equal(c.tags.find((t) => t.tag === "T1").fecha, "2026-10-09T00:00:00.000Z");
  assert.equal(fechaCorta("2026-10-09T00:00:00.000Z"), "09/10/2026");
  assert.equal(fechaCorta(undefined), "");
});

test("semáforo de cobertura", () => {
  assert.equal(nivelCobertura(90), "success");
  assert.equal(nivelCobertura(89), "warning");
  assert.equal(nivelCobertura(60), "warning");
  assert.equal(nivelCobertura(59), "error");
});

test("claveCodigo y CSV", () => {
  assert.equal(claveCodigo(" GCM - 1171 "), "GCM1171");
  const c = calcularCoberturaMes([], extintores, tags, "OCTUBRE", 2026);
  const csv = extintoresACsv(c.extintores);
  assert.ok(csv.startsWith("﻿\"Área\";\"Tag\""));
  assert.match(csv, /"No inspeccionado"/);
});
