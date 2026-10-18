import { test } from "node:test";
import assert from "node:assert/strict";
import {
  faltantesParaEnviar,
  numero,
  payloadDesdeValores,
  TAREA_VACIA,
  valoresDesdeReporte,
  valoresVacios,
} from "./formularioReporte.ts";

const completo = () => ({
  ...valoresVacios("2026-10-06"),
  tag: " 230pp013 ",
  tecnica: "TERMOGRAFIA MECANICA",
  alcance: "Seguimiento",
  analisis: "Sin anomalías",
  resultado: "NORMAL",
});

test("numero admite coma decimal y distingue vacío de inválido", () => {
  assert.equal(numero("0,95"), 0.95);
  assert.equal(numero(" 2044 "), 2044);
  assert.equal(numero(""), undefined);
  assert.equal(numero("dos mil"), undefined);
});

test("el payload lleva números de verdad y los textos vacíos para vaciar", () => {
  const v = completo();
  v.lecturas.horas = "2044";
  v.lecturas.emisividad = "0,95";
  v.ot = "";
  const p = payloadDesdeValores(v);
  assert.equal(p.tag, "230PP013");
  assert.deepEqual(p.lecturas, { horas: 2044, emisividad: 0.95 });
  assert.equal(p.ot, "");
  assert.equal(p.grafico, null);
});

test("recomendaciones vacías no viajan; tareas sin sus campos vacíos", () => {
  const v = completo();
  v.recomendaciones = [{ texto: "Nueva medición" }, { texto: "  " }];
  v.tareas = [{ ...TAREA_VACIA, descripcion: " Medir ", comunicado_con: "Wilmers Cruz" }];
  const p = payloadDesdeValores(v);
  assert.deepEqual(p.recomendaciones, ["Nueva medición"]);
  assert.deepEqual(p.tareas, [{ descripcion: "Medir", comunicado_con: "Wilmers Cruz" }]);
});

test("ida y vuelta: lo que vuelve del servidor llena el formulario igual", () => {
  const v = valoresDesdeReporte({
    _id: "1",
    tipo_equipo: "Bomba",
    tag: "230PP013",
    fecha: "2026-10-06T00:00:00.000Z",
    lecturas: { horas: 2044 },
    fotos: [],
    fotos_por_fila: 3,
    recomendaciones: ["Nueva medición"],
    tareas: [],
    antecedentes: { tomados_en: "", ficha: {}, componentes: [] },
    estado: "borrador",
    elaboradoPor: "santos",
    historial: [],
  });
  assert.equal(v.fecha, "2026-10-06");
  assert.equal(v.lecturas.horas, "2044");
  assert.deepEqual(v.recomendaciones, [{ texto: "Nueva medición" }]);
});

test("faltantes: lo mismo que exige el backend, con el campo a marcar", () => {
  assert.deepEqual(
    faltantesParaEnviar(valoresVacios("2026-10-06")).map((f) => f.campo),
    ["tecnica", "alcance", "analisis", "resultado"],
  );
  assert.deepEqual(faltantesParaEnviar(completo()), []);

  const v = completo();
  v.recomendaciones = [{ texto: "Nueva medición" }];
  assert.deepEqual(faltantesParaEnviar(v).map((f) => f.campo), ["tareas"]);
  v.tareas = [{ ...TAREA_VACIA }];
  assert.deepEqual(faltantesParaEnviar(v).map((f) => f.campo), [
    "tareas.0.descripcion",
    "tareas.0.comunicado_con",
  ]);
});
