import { test } from "node:test";
import assert from "node:assert/strict";
import { claveDeTipo, etiquetaDeTipo, opcionesDeTipo, SIN_INSPECCION } from "./tipoInspeccion.ts";

test("la etiqueta corta de una IRO y de la ISOP", () => {
  assert.equal(etiquetaDeTipo("INSPECCIÓN REGLAS DE ORO, (IRO) - TRABAJO EN ALTURA"), "IRO · Trabajo en altura");
  assert.equal(etiquetaDeTipo("INSPECCIÓN DE SEGURIDAD OPERATIVA (ISOP)"), "ISOP");
  assert.equal(etiquetaDeTipo("Otra plantilla"), "Otra plantilla");
});

test("el tipo es el código: dos revisiones de la ISOP son el mismo", () => {
  const isop7 = { codigo: "1.02.P06.F12", nombre: "INSPECCIÓN DE SEGURIDAD OPERATIVA (ISOP)" };
  const isop8 = { ...isop7 };
  assert.deepEqual(opcionesDeTipo([isop7, isop8]), [{ valor: "1.02.P06.F12", etiqueta: "ISOP" }]);
});

test("un plan manual cae en «sin inspección»", () => {
  assert.equal(claveDeTipo(undefined), SIN_INSPECCION);
  const opciones = opcionesDeTipo([undefined, { codigo: "1.02.P06.F50", nombre: "(IRO) - IZAJE" }]);
  assert.deepEqual(
    opciones.map((o) => o.etiqueta),
    ["IRO · Izaje", "Sin inspección (manual)"],
  );
});

test("el día de la inspección se muestra tal cual, sin correrse por la zona horaria", async () => {
  const { diaLegible } = await import("./tipoInspeccion.ts");
  assert.equal(diaLegible("2026-10-21"), "21/10/2026");
  assert.equal(diaLegible(undefined), "");
  assert.equal(diaLegible("2026-10-21T04:00:00.000Z"), "");
});
