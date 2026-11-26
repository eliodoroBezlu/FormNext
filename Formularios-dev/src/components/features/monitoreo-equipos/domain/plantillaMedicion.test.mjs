// Pruebas del editor de plantillas de medición. Correr con: yarn test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  celdasDeValores,
  payloadDePlantilla,
  PIEZA_VACIA,
  valoresDePlantilla,
} from "./plantillaMedicion.ts";

const PLANTILLA = {
  _id: "p1",
  tag: "250SA225",
  tecnica: "ULTRASONIDO ACTIVO",
  titulo: "Muestreador",
  piezas: [
    {
      nombre: "1",
      zonas: [{ nombre: "Lado Oeste", anillos: 4, puntos: 8 }],
      espesor_nominal_mm: 6.5,
      espesor_alerta_mm: 5.5,
    },
    { nombre: "Cuello", zonas: [{ nombre: "", anillos: 1, puntos: 8 }] },
  ],
  diagramas: [{ archivo: "a.png", descripcion: " Muestreador " }],
};

test("ida y vuelta: la plantilla se edita como texto y vuelve igual", () => {
  const v = valoresDePlantilla(PLANTILLA);
  assert.equal(v.piezas[0].espesor_nominal_mm, "6,5");
  assert.equal(v.piezas[1].espesor_alerta_mm, "");
  const p = payloadDePlantilla(v);
  assert.deepEqual(p.piezas, PLANTILLA.piezas);
  assert.equal(p.diagramas[0].descripcion, "Muestreador");
});

test("una nueva arranca con una pieza y la técnica sugerida", () => {
  const v = valoresDePlantilla(null, "ULTRASONIDO ACTIVO");
  assert.equal(v.tecnica, "ULTRASONIDO ACTIVO");
  assert.deepEqual(v.piezas, [PIEZA_VACIA]);
});

test("el tag va en mayúsculas y un tamaño vacío no pasa como válido", () => {
  const v = valoresDePlantilla(null);
  v.tag = " 250sa225 ";
  v.piezas[0].zonas[0].anillos = "";
  const p = payloadDePlantilla(v);
  assert.equal(p.tag, "250SA225");
  assert.ok(Number.isNaN(p.piezas[0].zonas[0].anillos));
});

test("se cuentan los puntos de la grilla", () => {
  assert.equal(celdasDeValores(valoresDePlantilla(PLANTILLA).piezas), 40);
});
