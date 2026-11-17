import { test } from "node:test";
import assert from "node:assert/strict";
import { seccionesParaRevisar } from "./section-utils.ts";

const pregunta = (text) => ({ text, responseConfig: { type: "select" } });
const sub = (_id, title, n) => ({
  _id,
  title,
  questions: Array.from({ length: n }, (_, i) => pregunta(`${title} ${i}`)),
});
const B = "B. SEGÚN EL TIPO DE ESCALERA";
const plantilla = [
  { _id: "a", title: "A. GENERAL", questions: [pregunta("g")] },
  {
    _id: "b",
    title: B,
    isParent: true,
    questions: [],
    subsections: [
      sub("s0", "1. SIMPLE", 1),
      sub("s1", "2. TIJERA", 4),
      sub("s2", "EXTENSIBLE O TELESCÓPICA", 3),
      sub("s3", "PLATAFORMA MOVIBLE", 5),
    ],
  },
  { _id: "c", title: "C. ALMACENAMIENTO", questions: [pregunta("c")] },
];

test("telescópica elegida: la sección B muestra solo esa y en sub0 (como la guarda el formulario)", () => {
  const filas = seccionesParaRevisar(plantilla, { [B]: ["EXTENSIBLE O TELESCÓPICA"] }, true);
  assert.deepEqual(filas.map((f) => f.indice), [0, 1, 2]);
  const subs = filas[1].section.subsections;
  assert.equal(subs.length, 1);
  assert.equal(subs[0].title, "EXTENSIBLE O TELESCÓPICA");
  assert.equal(subs[0].questions.length, 3);
});

test("dos tipos: quedan en el orden de la plantilla, no en el del clic", () => {
  const filas = seccionesParaRevisar(
    plantilla,
    { [B]: ["PLATAFORMA MOVIBLE", "2. TIJERA"] },
    true,
  );
  assert.deepEqual(filas[1].section.subsections.map((s) => s.title), ["2. TIJERA", "PLATAFORMA MOVIBLE"]);
});

test("ROOT elegido: las secciones raíz conservan su posición en la plantilla", () => {
  const filas = seccionesParaRevisar(plantilla, { ROOT: ["C. ALMACENAMIENTO"] }, true);
  assert.deepEqual(filas.map((f) => [f.section.title, f.indice]), [["C. ALMACENAMIENTO", 2]]);
});

test("sin selector o sin elección: la plantilla completa, como antes", () => {
  assert.equal(seccionesParaRevisar(plantilla, { [B]: ["2. TIJERA"] }, false)[1].section.subsections.length, 4);
  assert.equal(seccionesParaRevisar(plantilla, undefined, true)[1].section.subsections.length, 4);
});
