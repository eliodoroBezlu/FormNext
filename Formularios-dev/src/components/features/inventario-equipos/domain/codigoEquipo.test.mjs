import { test } from "node:test";
import assert from "node:assert/strict";
import { codigoParteDesde, equipoConCodigo, sugerirCodigo } from "./codigoEquipo.ts";

let id = 0;
const equipo = (codigo, tipo, area, extra = {}) => ({
  _id: String(++id),
  codigo,
  tipo_equipo: tipo,
  descripcion: tipo,
  cantidad: 1,
  area_id: area ? { _id: area, nombre: area } : undefined,
  ...extra,
});

const numeros = (desde, hasta, saltar = []) =>
  Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i).filter((n) => !saltar.includes(n));

const tallerGeneral = numeros(1, 76, [68]).map((n) =>
  equipo(`ZE-AM-TG-${String(n).padStart(4, "0")}`, "Amoladora", "TG"),
);

test("propone el siguiente de la serie del tipo en el área, después del mayor", () => {
  const s = sugerirCodigo(tallerGeneral, "Amoladora", "area", "TG");
  assert.deepEqual(s, { codigo: "ZE-AM-TG-0077", ultimo: "ZE-AM-TG-0076" });
});

test("no reusa un número que falta: puede ser una etiqueta que nunca se grabó", () => {
  const s = sugerirCodigo(tallerGeneral, "Amoladora", "area", "TG");
  assert.notEqual(s.codigo, "ZE-AM-TG-0068");
});

test("salta un código que ya usa otro equipo", () => {
  const equipos = [
    equipo("ZE-AM-TG-0003", "Amoladora", "TG"),
    equipo("ze-am-tg-0004", "Esmeril", "OTRA"),
  ];
  assert.equal(sugerirCodigo(equipos, "Amoladora", "area", "TG").codigo, "ZE-AM-TG-0005");
});

test("el primero del tipo en un área arma el código con el prefijo del tipo y el segmento del área", () => {
  const equipos = [
    equipo("ZE-AM-INS-0003", "Amoladora", "INS"),
    equipo("ZE-ES-TG-0005", "Esmeril", "TG"),
  ];
  assert.deepEqual(sugerirCodigo(equipos, "Amoladora", "area", "TG"), {
    codigo: "ZE-AM-TG-0001",
    ultimo: null,
  });
});

test("sigue series de otra forma (SPCC) y respeta el ancho", () => {
  const equipos = [equipo("505-D-0026", "SPCC", "CH"), equipo("505-D-0009", "SPCC", "CH")];
  assert.equal(sugerirCodigo(equipos, "SPCC", "area", "CH").codigo, "505-D-0027");
});

test("sin datos de dónde deducirlo, no propone nada", () => {
  assert.equal(sugerirCodigo([], "Amoladora", "area", "TG"), null);
  assert.equal(sugerirCodigo(tallerGeneral, "", "area", "TG"), null);
  assert.equal(sugerirCodigo(tallerGeneral, "Amoladora", "area", ""), null);
  assert.equal(sugerirCodigo(tallerGeneral, "Amoladora", "superintendencia", "S1"), null);
});

test("en una superintendencia sigue la serie de sus equipos", () => {
  const equipos = [
    equipo("CAM-0002", "Camioneta", null, { ambito: "superintendencia", superintendencia_id: { _id: "S1", nombre: "S1" } }),
  ];
  assert.equal(sugerirCodigo(equipos, "Camioneta", "superintendencia", "S1").codigo, "CAM-0003");
});

test("un código repetido se detecta sin importar mayúsculas ni espacios", () => {
  const equipos = [equipo("ZE-AM-TG-0010", "Amoladora", "TG")];
  assert.equal(equipoConCodigo(equipos, " ze-am-tg-0010 ", "")?.codigo, "ZE-AM-TG-0010");
  assert.equal(equipoConCodigo(equipos, "ZE-AM-TG-0011", ""), undefined);
  assert.equal(equipoConCodigo(equipos, "", ""), undefined);
});

test("al editar no choca consigo mismo; con otro RFID tampoco (SPCC)", () => {
  const a = equipo("505-D-0026", "SPCC", "CH", { rfid: "E200A" });
  assert.equal(equipoConCodigo([a], "505-D-0026", "E200A", a._id), undefined);
  assert.equal(equipoConCodigo([a], "505-D-0026", "E200B"), undefined);
  assert.equal(equipoConCodigo([a], "505-D-0026", "E200A")?._id, a._id);
});

test("el código de parte es el número final sin ceros", () => {
  assert.equal(codigoParteDesde("ZE-AM-TG-0076"), "76");
  assert.equal(codigoParteDesde("L-266"), "266");
  assert.equal(codigoParteDesde("SIN-NUMERO"), "");
});
