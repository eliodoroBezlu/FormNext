import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filasParaRevisar,
  problemaDelArchivo,
  textoDelResumen,
} from "./cargaPlanilla.ts";

const fila = (n, resultado, avisos = []) => ({
  fila: n,
  resultado,
  avisos,
  cambios: [],
});

test("solo la planilla .xlsx y hasta 10 MB", () => {
  assert.equal(problemaDelArchivo({ name: "Planilla.XLSX", size: 2_000_000 }), null);
  assert.match(problemaDelArchivo({ name: "planilla.xls", size: 10 }), /\.xlsx/);
  assert.match(problemaDelArchivo({ name: "p.xlsx", size: 11 * 1024 * 1024 }), /fotos de la columna L/);
});

test("primero lo que pide atención; sin cambios y sin avisos no se lista", () => {
  const orden = filasParaRevisar([
    fila(12, "sin-cambios"),
    fila(13, "actualiza"),
    fila(14, "conflicto"),
    fila(15, "rechazada"),
    fila(16, "sin-cambios", ["No se aplicó el cambio en la empresa"]),
    fila(11, "rechazada"),
  ]).map((f) => f.fila);
  assert.deepEqual(orden, [11, 15, 14, 13, 16]);
});

test("el resumen dice qué pasó, en revisión y ya aplicado", () => {
  const resumen = { actualiza: 3, "sin-cambios": 5, rechazada: 1, conflicto: 0, ignorada: 0 };
  assert.equal(
    textoDelResumen(resumen, false),
    "3 tareas se actualizan · 1 fila rechazada · 5 sin cambios",
  );
  assert.match(textoDelResumen(resumen, true), /^3 tareas actualizadas/);
  assert.equal(
    textoDelResumen({ actualiza: 0, "sin-cambios": 0, rechazada: 0, conflicto: 0, ignorada: 0 }, false),
    "La planilla no trae tareas.",
  );
});
