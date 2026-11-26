import { test } from "node:test";
import assert from "node:assert/strict";
import {
  faltantesParaEnviar,
  grillaCalza,
  grillaDeTexto,
  numero,
  payloadDesdeValores,
  piezasDesdeAntecedentes,
  piezasSinTocar,
  PIEZAS_BOMBA,
  soloDigitos,
  soloEspesor,
  TAREA_VACIA,
  valoresDeGrilla,
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

// ── Retroalimentación de Confiabilidad (2026-11-18) ──────────────────────

test("el N° de OT y las horas aceptan solo dígitos", () => {
  assert.equal(soloDigitos("OT-952 013"), "952013");
  assert.equal(soloDigitos("836 hrs"), "836");
  const v = completo();
  v.ot = "952013x";
  assert.equal(payloadDesdeValores(v).ot, "952013");
});

test("la emisividad arranca en 0,95 y es obligatoria para enviar", () => {
  assert.equal(valoresVacios("2026-11-18").lecturas.emisividad, "0,95");
  const v = completo();
  v.lecturas.emisividad = "";
  assert.deepEqual(faltantesParaEnviar(v).map((f) => f.campo), ["lecturas.emisividad"]);
});

test("las piezas se cargan de la ficha (las cuatro, sin horas) y se reconocen sin tocar", () => {
  const piezas = piezasDesdeAntecedentes({
    tomados_en: "",
    ficha: {},
    componentes: [
      { pieza: "Voluta", proveedor: "ALTONA", fecha_instalacion: "2026-04-14T00:00:00.000Z", horas_trabajo: 2601 },
    ],
  });
  assert.deepEqual(piezas.map((p) => p.pieza), [...PIEZAS_BOMBA]);
  assert.deepEqual(piezas[0], {
    pieza: "Voluta",
    fecha_instalacion: "2026-04-14",
    proveedor: "ALTONA",
    condicion_inicial: "",
    material: "",
    horas_trabajo: "",
  });
  assert.equal(piezasSinTocar(valoresVacios("2026-11-18").piezas), true);
  assert.equal(piezasSinTocar(piezas), false);
});

test("el payload lleva las piezas, el enlace y los anexos", () => {
  const v = completo();
  v.piezas[0] = { ...v.piezas[0], proveedor: " WEIR ", horas_trabajo: "2601" };
  v.informe_anterior_url = " https://sharepoint/cotem136.pdf ";
  v.anexos = [{ archivo: "a.jpg", descripcion: " Detalle ", referencia: false }];
  const p = payloadDesdeValores(v);
  assert.deepEqual(p.piezas[0], { pieza: "Voluta", proveedor: "WEIR", horas_trabajo: 2601 });
  assert.deepEqual(p.piezas[1], { pieza: "Impulsor" });
  assert.equal(p.informe_anterior_url, "https://sharepoint/cotem136.pdf");
  assert.deepEqual(p.anexos, [{ archivo: "a.jpg", descripcion: "Detalle", referencia: false }]);
});

test("un reporte anterior a la tabla editable muestra las piezas que tenía", () => {
  const v = valoresDesdeReporte({
    _id: "1",
    tipo_equipo: "Bomba",
    tag: "230PP013",
    fecha: "2026-10-06T00:00:00.000Z",
    lecturas: {},
    fotos: [],
    fotos_por_fila: 3,
    recomendaciones: [],
    tareas: [],
    antecedentes: { tomados_en: "", ficha: {}, componentes: [{ pieza: "Impulsor", material: "A-61" }] },
    estado: "borrador",
    elaboradoPor: "santos",
    historial: [],
  });
  assert.equal(v.piezas[1].material, "A-61");
  assert.deepEqual(v.anexos, []);
  assert.equal(v.informe_anterior_url, "");
});

const ESTRUCTURA = {
  titulo: "Medición",
  piezas: [
    {
      nombre: "1",
      zonas: [
        { nombre: "Lado Oeste", anillos: 2, puntos: 2 },
        { nombre: "Lado Este", anillos: 1, puntos: 1 },
      ],
    },
  ],
};

test("la grilla va y vuelve: texto con coma en pantalla, números al servidor", () => {
  const g = grillaDeTexto(ESTRUCTURA, [[[[6.1, null], [5.69, 6]], [[null]]]]);
  assert.deepEqual(g, [[[["6,1", ""], ["5,69", "6"]], [[""]]]]);
  assert.deepEqual(grillaDeTexto(ESTRUCTURA), [[[["", ""], ["", ""]], [[""]]]]);
  g[0][0][1][0] = "x";
  assert.deepEqual(valoresDeGrilla(g), [[[[6.1, null], [null, 6]], [[null]]]]);
});

test("en la grilla solo entran espesores", () => {
  assert.equal(soloEspesor("6.12"), "6,12");
  assert.equal(soloEspesor("6,1.2"), "6,12");
  assert.equal(soloEspesor("a5 mm"), "5");
  assert.equal(soloEspesor(""), "");
});

test("con medición: van los valores, no la emisividad, y se pide al menos un espesor", () => {
  const v = completo();
  v.medicion_valores = grillaDeTexto(ESTRUCTURA);
  v.lecturas.velocidad_ms = "5920";
  v.lecturas.frecuencia_mhz = "7,5";
  const p = payloadDesdeValores(v, true);
  assert.deepEqual(p.lecturas, { velocidad_ms: 5920, frecuencia_mhz: 7.5 });
  assert.deepEqual(p.medicion_valores, [[[[null, null], [null, null]], [[null]]]]);
  assert.equal(payloadDesdeValores(v).medicion_valores, undefined);

  assert.deepEqual(
    faltantesParaEnviar(v, true).map((f) => f.campo),
    ["medicion_valores"],
  );
  v.medicion_valores[0][1][0][0] = "6,2";
  assert.deepEqual(faltantesParaEnviar(v, true), []);
});

test("la grilla calza con su plantilla y no con otra", () => {
  const g = grillaDeTexto(ESTRUCTURA);
  assert.equal(grillaCalza(g, ESTRUCTURA), true);
  assert.equal(grillaCalza([], ESTRUCTURA), false);
  const otra = { ...ESTRUCTURA, piezas: [{ ...ESTRUCTURA.piezas[0], zonas: [{ nombre: "", anillos: 2, puntos: 3 }] }] };
  assert.equal(grillaCalza(g, otra), false);
});
