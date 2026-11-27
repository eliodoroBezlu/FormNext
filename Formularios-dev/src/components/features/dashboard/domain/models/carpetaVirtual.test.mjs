import { test } from "node:test";
import assert from "node:assert/strict";
import { enPeriodo, mismaPersona, filasEmergencia, periodoInicial, añosDisponibles } from "./carpetaVirtual.ts";

test("periodo: año entero o un mes", () => {
  assert.ok(enPeriodo("2026-10-15T12:00:00", { año: 2026, mes: null }));
  assert.ok(enPeriodo("2026-10-15T12:00:00", { año: 2026, mes: 10 }));
  assert.equal(enPeriodo("2026-10-15T12:00:00", { año: 2026, mes: 9 }), false);
  assert.equal(enPeriodo("2025-10-15T12:00:00", { año: 2026, mes: null }), false);
  assert.equal(enPeriodo(undefined, { año: 2026, mes: null }), false);
  assert.equal(enPeriodo("no es fecha", { año: 2026, mes: null }), false);
  assert.deepEqual(periodoInicial(new Date(2026, 10, 27)), { año: 2026, mes: null });
  assert.deepEqual(añosDisponibles(new Date(2026, 0, 1)), [2026, 2025, 2024]);
});

test("el inspector escrito a mano se reconoce en el padrón", () => {
  assert.ok(mismaPersona("Juan Pérez", "PEREZ LOPEZ JUAN CARLOS"));
  assert.ok(mismaPersona("ing. juan perez", "Juan Perez"));
  assert.equal(mismaPersona("Juan", "PEREZ LOPEZ JUAN CARLOS"), false);
  assert.equal(mismaPersona("Juan Rojas", "PEREZ LOPEZ JUAN CARLOS"), false);
  assert.equal(mismaPersona("", "Juan Perez"), false);
});

const formularios = [
  {
    _id: "a",
    año: 2026,
    meses: {
      JULIO: { inspector: { nombre: "Juan Perez" } },
      AGOSTO: { inspector: { nombre: "Ana Rojas" } },
      OCTUBRE: { inspector: { nombre: "juan pérez" } },
    },
  },
  { _id: "b", año: 2025, meses: { OCTUBRE: { inspector: { nombre: "Juan Perez" } } } },
];

test("emergencia por técnico: solo los meses que hizo esa persona", () => {
  const filas = filasEmergencia(formularios, { año: 2026, mes: null }, "PEREZ LOPEZ JUAN CARLOS");
  assert.equal(filas.length, 1);
  assert.deepEqual(filas[0].meses, ["JULIO", "OCTUBRE"]);
  assert.deepEqual(filas[0].inspectores, ["Juan Perez", "juan pérez"]);
  assert.equal(filasEmergencia(formularios, { año: 2026, mes: 8 }, "Juan Perez").length, 0);
});

test("emergencia por área: cualquier mes con inspección del periodo", () => {
  assert.deepEqual(filasEmergencia(formularios, { año: 2026, mes: 8 })[0].meses, ["AGOSTO"]);
  assert.equal(filasEmergencia(formularios, { año: 2026, mes: 12 }).length, 0);
  assert.equal(filasEmergencia(formularios, { año: 2025, mes: null }).length, 1);
});
