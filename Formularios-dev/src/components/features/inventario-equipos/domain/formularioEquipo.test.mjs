import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clasificacionSugerida,
  esVehiculo,
  numero,
  opcionesDe,
  parecidoA,
  payloadDesdeValores,
  referenciaElegida,
  tiposDeEquipo,
  valoresDesdeEquipo,
  valoresParaDuplicar,
  valoresParaOtro,
  valoresVacios,
} from "./formularioEquipo.ts";
import { filtrarEquipos, filtrosVacios } from "./filtrosEquipos.ts";

const amoladora = {
  _id: "e1",
  codigo: "ZE-AM-TG-0076",
  codigo_parte: "76",
  descripcion: "Amoladora",
  marca: "MAKITA",
  modelo: "GA7040S",
  cantidad: 1,
  costo: 0,
  num_serie: "51541v",
  tipo_equipo: "Amoladora",
  responsable: "contratista",
  ambito: "area",
  area_id: { _id: "TG", nombre: "TALLER GENERAL" },
  ubicacion_id: { _id: "U1", nombre: "Taller", ancestros: ["U0"] },
  clasificacion_id: { _id: "C1", nombre: "Herramientas_eléctricas" },
  especificaciones: { voltaje: 220, rpm: 8500 },
  fotos: [{ url: "/uploads/a.jpg" }],
};

const config = {
  tipo_equipo: "Amoladora",
  campos: [
    { name: "voltaje", label: "Voltaje", type: "number", required: false },
    { name: "disco", label: "Diámetro de disco", type: "text", required: false },
    { name: "guarda", label: "Tiene guarda", type: "boolean", required: false },
  ],
};

test("numero acepta coma decimal y distingue vacío de inválido", () => {
  assert.equal(numero("12,5"), 12.5);
  assert.equal(numero(" "), undefined);
  assert.equal(numero("abc"), undefined);
});

test("al editar, un costo 0 se muestra vacío y los datos técnicos como texto", () => {
  const v = valoresDesdeEquipo(amoladora);
  assert.equal(v.costo, "");
  assert.deepEqual(v.especificaciones, { voltaje: "220", rpm: "8500" });
  assert.equal(v.area_id, "TG");
  assert.equal(v.cantidad, "1");
});

test("el payload manda solo la referencia del nivel elegido y opcionales vacíos como undefined", () => {
  const v = { ...valoresVacios(), codigo: " X-1 ", descripcion: "Amoladora", tipo_equipo: "Amoladora",
    area_id: "TG", superintendencia_id: "S1", ubicacion_id: "U1", clasificacion_id: "C1" };
  const p = payloadDesdeValores(v);
  assert.equal(p.codigo, "X-1");
  assert.equal(p.area_id, "TG");
  assert.equal(p.superintendencia_id, undefined);
  assert.equal(p.costo, undefined);
  assert.equal(p.marca, undefined);
  assert.equal(p.cantidad, 1);

  const s = payloadDesdeValores({ ...v, ambito: "superintendencia" });
  assert.equal(s.area_id, undefined);
  assert.equal(s.superintendencia_id, "S1");
});

test("con configuración del tipo, solo van sus datos técnicos y los numéricos como número", () => {
  const v = { ...valoresDesdeEquipo(amoladora), especificaciones: { voltaje: "220", disco: " 7\" ", guarda: "true", rpm: "8500", vacio: "" } };
  assert.deepEqual(payloadDesdeValores(v, config).especificaciones, { voltaje: 220, disco: "7\"", guarda: true });
  // Sin configuración se conserva lo que haya, menos lo vacío.
  assert.deepEqual(payloadDesdeValores(v).especificaciones, { voltaje: "220", disco: "7\"", guarda: "true", rpm: "8500" });
});

test("duplicar conserva el modelo y vacía lo que identifica a la unidad", () => {
  const v = valoresParaDuplicar(amoladora);
  assert.equal(v.codigo, "");
  assert.equal(v.num_serie, "");
  assert.equal(v.responsable, "");
  assert.deepEqual(v.fotos, []);
  assert.equal(v.modelo, "GA7040S");
  assert.equal(v.especificaciones.voltaje, "220");
  assert.equal(v.ubicacion_id, "U1");
});

test("«agregar otro» deja tipo, lugar, clasificación y marca, y vacía el resto", () => {
  const v = valoresParaOtro(valoresDesdeEquipo(amoladora));
  assert.equal(v.tipo_equipo, "Amoladora");
  assert.equal(v.area_id, "TG");
  assert.equal(v.ubicacion_id, "U1");
  assert.equal(v.clasificacion_id, "C1");
  assert.equal(v.marca, "MAKITA");
  assert.equal(v.codigo, "");
  assert.equal(v.modelo, "");
  assert.equal(v.num_serie, "");
  assert.deepEqual(v.especificaciones, {});
});

test("referenciaElegida devuelve el id del nivel", () => {
  const v = { ambito: "gerencia", area_id: "A", superintendencia_id: "S", gerencia_id: "G" };
  assert.equal(referenciaElegida(v), "G");
  assert.equal(referenciaElegida({ ...v, ambito: "area" }), "A");
});

test("la clasificación sugerida es la más usada por el tipo", () => {
  const otro = { ...amoladora, _id: "e2", clasificacion_id: { _id: "C2", nombre: "Otra" } };
  const tercero = { ...amoladora, _id: "e3" };
  assert.equal(clasificacionSugerida([amoladora, otro, tercero], "Amoladora"), "C1");
  assert.equal(clasificacionSugerida([amoladora], "Esmeril"), null);
});

test("las opciones juntan variantes de mayúsculas y quedan con la escritura más usada", () => {
  const eq = (marca) => ({ ...amoladora, marca });
  const op = opcionesDe([eq("BOSCH"), eq("Bosch"), eq("BOSCH"), eq("BOCH"), eq("MAKITA")], "marca");
  assert.deepEqual(op, [
    { valor: "BOCH", usos: 1 },
    { valor: "BOSCH", usos: 3 },
    { valor: "MAKITA", usos: 1 },
  ]);
});

test("parecidoA sugiere la escritura más usada ante una errata, y calla si no hay", () => {
  const op = [{ valor: "BOCH", usos: 1 }, { valor: "BOSCH", usos: 3 }, { valor: "MAKITA", usos: 5 }];
  assert.equal(parecidoA("boch", op), "BOSCH");
  assert.equal(parecidoA("BOSH", op), "BOSCH");
  assert.equal(parecidoA("BOSCH", op), null);
  assert.equal(parecidoA("DEWALT", op), null);
  assert.equal(parecidoA("MA", op), null);
});

test("la placa es solo de vehículos", () => {
  assert.equal(esVehiculo("Vehiculo"), true);
  assert.equal(esVehiculo("Camioneta 4x4"), true);
  assert.equal(esVehiculo("Amoladora"), false);
});

test("los tipos son los configurados más los que ya existen, ordenados", () => {
  assert.deepEqual(tiposDeEquipo([config, { tipo_equipo: "Escalera", campos: [] }], [amoladora, { ...amoladora, tipo_equipo: "Arnes" }]), [
    "Amoladora",
    "Arnes",
    "Escalera",
  ]);
});

test("filtrar por ubicación incluye lo que está dentro; el texto busca también responsable", () => {
  const f = filtrosVacios();
  assert.equal(filtrarEquipos([amoladora], { ...f, ubicacion: "U0" }).length, 1);
  assert.equal(filtrarEquipos([amoladora], { ...f, ubicacion: "U9" }).length, 0);
  assert.equal(filtrarEquipos([amoladora], { ...f, texto: "CONTRAT" }).length, 1);
  assert.equal(filtrarEquipos([amoladora], { ...f, area: "TG", tipo: "Esmeril" }).length, 0);
});
