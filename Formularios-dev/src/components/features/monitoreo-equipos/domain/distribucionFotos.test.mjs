// Pruebas de la distribución de fotos. Correr con:
//   yarn test
// (node --experimental-strip-types --test). El backend tiene los mismos casos
// para su copia de la función, que es la que usa el PDF.
import { test } from "node:test";
import assert from "node:assert/strict";
import { distribuirFotos, fotosPorFila, proporcionDeCaja } from "./distribucionFotos.ts";

test("las filas se reparten parejo, las largas primero", () => {
  const casos = {
    1: [1],
    2: [2],
    3: [3],
    4: [2, 2],
    5: [3, 2],
    6: [3, 3],
    7: [3, 2, 2],
    8: [3, 3, 2],
    9: [3, 3, 3],
  };
  for (const [n, esperado] of Object.entries(casos)) {
    assert.deepEqual(fotosPorFila(Number(n), 3), esperado, `${n} fotos`);
  }
});

test("el máximo por fila es configurable", () => {
  assert.deepEqual(fotosPorFila(5, 2), [2, 2, 1]);
  assert.deepEqual(fotosPorFila(5, 4), [3, 2]);
  assert.deepEqual(fotosPorFila(4, 1), [1, 1, 1, 1]);
  assert.deepEqual(fotosPorFila(6, 6), [6]);
  assert.deepEqual(fotosPorFila(7, 6), [4, 3]);
  assert.deepEqual(fotosPorFila(12, 6), [6, 6]);
  assert.deepEqual(fotosPorFila(0, 3), []);
});

test("todas las fotos miden lo mismo y una fila corta se centra", () => {
  // 5 fotos en 620 de ancho con 10 de separación: 3 columnas de 200.
  const d = distribuirFotos(5, 3, 620, 10);
  assert.equal(d.anchoCelda, 200);
  assert.deepEqual(d.filas[0], { indices: [0, 1, 2], desplazamiento: 0 });
  // La fila de 2 ocupa 410: sobra 210, la mitad a cada lado.
  assert.deepEqual(d.filas[1], { indices: [3, 4], desplazamiento: 105 });
});

test("una sola foto no ocupa todo el ancho", () => {
  const d = distribuirFotos(1, 3, 620, 10);
  assert.equal(d.columnas, 2);
  assert.equal(d.anchoCelda, 305);
  assert.equal(d.filas[0].desplazamiento, 157.5);
});

test("con una por fila, sí ocupa el ancho completo", () => {
  assert.equal(distribuirFotos(2, 1, 620, 10).anchoCelda, 620);
});

test("la caja la marca la foto más alta, entre 4:3 apaisada y 3:4 vertical", () => {
  const flirDePie = { ancho: 348, alto: 464 };
  const apaisada = { ancho: 464, alto: 348 };
  assert.equal(proporcionDeCaja([apaisada]), 0.75);
  assert.ok(Math.abs(proporcionDeCaja([apaisada, flirDePie]) - 4 / 3) < 1e-9);
  assert.ok(Math.abs(proporcionDeCaja([{ ancho: 100, alto: 400 }]) - 4 / 3) < 1e-9);
  assert.equal(proporcionDeCaja([{ ancho: 400, alto: 100 }]), 0.75);
  assert.equal(proporcionDeCaja([{}, {}]), 0.75);
});
