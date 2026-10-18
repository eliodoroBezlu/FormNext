import { test } from "node:test";
import assert from "node:assert/strict";
import { accionesDelReporte } from "./accionesReporte.ts";

const r = (estado) => ({ estado, elaboradoPor: "santos" });

test("un reporte nuevo se edita y se envía", () => {
  assert.equal(accionesDelReporte(null, "santos").enviar, true);
});

test("el borrador es solo de quien lo elaboró", () => {
  assert.equal(accionesDelReporte(r("borrador"), "santos").editar, true);
  const otro = accionesDelReporte(r("borrador"), "wilmers");
  assert.equal(otro.editar, false);
  assert.match(otro.aviso, /santos/);
});

test("lo revisa otra persona, nunca quien lo elaboró", () => {
  assert.equal(accionesDelReporte(r("pendiente_revision"), "wilmers").revisar, true);
  assert.equal(accionesDelReporte(r("pendiente_revision"), "santos").revisar, false);
});

test("emitido no se toca", () => {
  const a = accionesDelReporte(r("emitido"), "santos");
  assert.deepEqual([a.editar, a.enviar, a.revisar, a.darDeBaja], [false, false, false, false]);
});

test("sin usuario conocido no es autor de nada", () => {
  assert.equal(accionesDelReporte(r("borrador"), undefined).editar, false);
});

test("por revisar son los pendientes de otros; mis borradores, los propios", async () => {
  const { enBandeja } = await import("./accionesReporte.ts");
  const pendienteMio = { estado: "pendiente_revision", elaboradoPor: "santos" };
  const borradorMio = { estado: "borrador", elaboradoPor: "santos" };
  const borradorAjeno = { estado: "borrador", elaboradoPor: "saul" };
  assert.equal(enBandeja(pendienteMio, "wilmers", "por_revisar"), true);
  assert.equal(enBandeja(pendienteMio, "santos", "por_revisar"), false);
  assert.equal(enBandeja(borradorMio, "santos", "mis_borradores"), true);
  assert.equal(enBandeja(borradorAjeno, "santos", "mis_borradores"), false);
  assert.equal(enBandeja(pendienteMio, undefined, "por_revisar"), false);
  assert.equal(enBandeja(borradorAjeno, "santos", "todos"), true);
});
