import { test } from "node:test";
import assert from "node:assert/strict";
import {
  describirUltima,
  estaAlDia,
  filtrarItems,
  resumirResultado,
  seleccionInicial,
} from "./sincronizacionTrabajadores.ts";

const item = (idIam, tipo, nomina, extra = {}) => ({
  idIam, tipo, nomina, ci: null, puesto: "Operador", cambios: [], ...extra,
});

const vista = (extra = {}) => ({
  nuevos: [], conCambios: [], bajas: [], problemas: [], sinCambios: 0,
  supervisores: { rol: "supervisor", ganan: [], pierden: [] },
  ultima: null,
  ...extra,
});

test("vienen marcados los nuevos, los cambios y las bajas; los problemas no", () => {
  const v = vista({
    nuevos: [item("a", "nuevo", "A")],
    conCambios: [item("b", "cambio", "B")],
    bajas: [item("c", "baja", "C")],
    problemas: [item("d", "problema", "D")],
  });
  assert.deepEqual([...seleccionInicial(v)].sort(), ["a", "b", "c"]);
});

test("al día: nada para aplicar ni supervisores que cambien", () => {
  assert.equal(estaAlDia(vista({ sinCambios: 40 })), true);
  assert.equal(
    estaAlDia(vista({ supervisores: { rol: "supervisor", ganan: [{ idIam: "x", nomina: "X" }], pierden: [] } })),
    false,
  );
});

test("la búsqueda ignora tildes y mayúsculas y mira nómina, CI y puesto", () => {
  const items = [
    item("a", "nuevo", "JOSÉ PÉREZ", { ci: "123" }),
    item("b", "nuevo", "ANA LÓPEZ", { puesto: "Mecánico" }),
  ];
  assert.deepEqual(filtrarItems(items, "jose").map((i) => i.idIam), ["a"]);
  assert.deepEqual(filtrarItems(items, "123").map((i) => i.idIam), ["a"]);
  assert.deepEqual(filtrarItems(items, "mecanico").map((i) => i.idIam), ["b"]);
  assert.equal(filtrarItems(items, "  ").length, 2);
});

test("resumen de lo aplicado", () => {
  const r = resumirResultado({
    resultados: [
      { idIam: "a", nomina: "A", tipo: "nuevo", ok: true },
      { idIam: "b", nomina: "B", tipo: "nuevo", ok: true },
      { idIam: "c", nomina: "C", tipo: "baja", ok: true },
    ],
    omitidos: [],
    supervisores: { ganan: 1, pierden: 0 },
  });
  assert.deepEqual(r, {
    severidad: "success",
    mensaje: "Listo: se agregaron 2 trabajadores, se dieron de baja 1 ficha y cambiaron 1 supervisor.",
  });
});

test("con fallas o elegidos que cambiaron es una advertencia; si todo falló, un error", () => {
  const parcial = resumirResultado({
    resultados: [
      { idIam: "a", nomina: "A", tipo: "cambio", ok: true },
      { idIam: "b", nomina: "B", tipo: "cambio", ok: false, error: "x" },
    ],
    omitidos: ["z"],
    supervisores: null,
  });
  assert.equal(parcial.severidad, "warning");
  assert.match(parcial.mensaje, /1 ficha no se pudo aplicar/);
  assert.match(parcial.mensaje, /1 elegida cambió en el IAM/);

  const todoMal = resumirResultado({
    resultados: [{ idIam: "b", nomina: "B", tipo: "nuevo", ok: false, error: "x" }],
    omitidos: [],
    supervisores: null,
  });
  assert.equal(todoMal.severidad, "error");
});

test("última sincronización", () => {
  assert.equal(describirUltima(null), "Todavía no se sincronizó desde esta pantalla.");
  const texto = describirUltima({
    fecha: "2026-11-17T18:05:00.000Z", usuario: "ana", nuevos: 2, actualizados: 0, bajas: 1, fallidos: 0,
  });
  assert.match(texto, /por ana \(2 nuevos, 1 baja\)\.$/);
});
