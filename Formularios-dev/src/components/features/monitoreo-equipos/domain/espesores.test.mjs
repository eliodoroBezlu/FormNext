// Pruebas de la medición de espesores. Correr con:
//   yarn test
// El backend tiene los mismos casos para su copia (la que usa el PDF).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bajoAlerta,
  celdasDe,
  letraDePunto,
  minimoDe,
  minimosAnteriores,
} from "./espesores.ts";

const SIMPLE = {
  titulo: "Medición",
  piezas: [
    {
      nombre: "1",
      zonas: [
        { nombre: "Lado Oeste", anillos: 2, puntos: 3 },
        { nombre: "Lado Este", anillos: 1, puntos: 2 },
      ],
      espesor_alerta_mm: 5.5,
    },
  ],
};

test("el mínimo ignora lo que no se midió", () => {
  assert.equal(minimoDe([6.32, null, 5.69, undefined]), 5.69);
  assert.equal(minimoDe([null, undefined]), undefined);
});

test("la alerta es estrictamente por debajo del espesor de alerta", () => {
  const p = SIMPLE.piezas[0];
  assert.equal(bajoAlerta(p, 5.49), true);
  assert.equal(bajoAlerta(p, 5.5), false);
  assert.equal(bajoAlerta(p, undefined), false);
  assert.equal(bajoAlerta({ nombre: "x", zonas: [] }, 1), false);
});

test("el anterior se busca por pieza y zona, sin importar mayúsculas ni espacios", () => {
  assert.deepEqual(
    minimosAnteriores(SIMPLE, [
      { pieza: "1", zona: "lado  oeste", minimo: 5.8 },
      { pieza: "2", zona: "Lado Este", minimo: 4 },
    ]),
    [[5.8, undefined]],
  );
});

test("los puntos se nombran con letras y se cuentan las celdas", () => {
  assert.deepEqual([0, 1, 7].map(letraDePunto), ["A", "B", "H"]);
  assert.equal(celdasDe(SIMPLE), 8);
});
