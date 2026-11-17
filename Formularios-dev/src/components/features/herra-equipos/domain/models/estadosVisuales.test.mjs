import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ESTADO_DE_INSPECCION, estadoDeInspeccion } from "./estadosVisuales.ts";

test("cada valor de InspectionStatus tiene su etiqueta y su color", () => {
  // Los valores del enum se leen del archivo para no transpilarlo.
  const fuente = readFileSync(new URL("./Inspection.ts", import.meta.url), "utf8");
  const bloque = fuente.slice(fuente.indexOf("export enum InspectionStatus"));
  const valores = [...bloque.slice(0, bloque.indexOf("}")).matchAll(/=\s*'([^']+)'/g)].map((m) => m[1]);
  assert.ok(valores.length >= 6, "no se leyeron los valores del enum");
  for (const valor of valores) assert.ok(ESTADO_DE_INSPECCION[valor], `falta ${valor}`);
});

test("aprobada en verde, rechazada en rojo, pendiente en azul", () => {
  assert.deepEqual(estadoDeInspeccion("approved"), { etiqueta: "Aprobada", color: "success" });
  assert.equal(estadoDeInspeccion("rejected").color, "error");
  assert.equal(estadoDeInspeccion("pending_approval").color, "info");
});

test("un estado desconocido o vacío se muestra en gris", () => {
  assert.deepEqual(estadoDeInspeccion("archivada"), { etiqueta: "archivada", color: "default" });
  assert.deepEqual(estadoDeInspeccion(undefined), { etiqueta: "—", color: "default" });
});
