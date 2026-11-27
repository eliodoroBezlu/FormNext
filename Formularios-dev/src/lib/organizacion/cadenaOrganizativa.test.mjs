import { test } from "node:test";
import assert from "node:assert/strict";
import {
  esCampoDeArea,
  esCampoDeGerencia,
  esCampoDeSuperintendencia,
  indexarCadenas,
  necesitaCadena,
  valoresDesdeElArea,
  valorDeVerificacion,
  mismoNombre,
  superintendenciasDelMaestro,
  areasDelMaestro,
  superintendenciaDelArea,
  esDeSuperintendencia,
} from "./cadenaOrganizativa.ts";

const porArea = indexarCadenas([
  { area: "Filtros", superintendencia: "Sup. Mantenimiento Flotación", gerencia: "Gerencia de Mantenimiento Planta" },
  { area: "Chancado", superintendencia: "Sup. Chancado", gerencia: null },
]);

test("reconoce los campos como los escribe cada plantilla", () => {
  for (const e of ["Área", "Area Física:", "Área Física:", "Sección"]) assert.ok(esCampoDeArea(e), e);
  for (const e of ["Superintendencia", "Superintendencia:"]) assert.ok(esCampoDeSuperintendencia(e), e);
  for (const e of ["Gerencia", "Dirección/Gerencia", "Dirección/Gerencia:"]) assert.ok(esCampoDeGerencia(e), e);
});

test("la superintendencia sénior no se toca: el maestro no la tiene", () => {
  for (const e of ["Superintendencia Sénior", "Superintendencia Senior:", "Superintendencia Sénior:"]) {
    assert.equal(esCampoDeSuperintendencia(e), false, e);
    assert.equal(esCampoDeGerencia(e), false, e);
  }
});

test("del área salen superintendencia y gerencia", () => {
  const etiquetas = ["Dirección/Gerencia", "Superintendencia Sénior", "Area Física", "Superintendencia"];
  assert.deepEqual(valoresDesdeElArea(etiquetas, "filtros ", porArea), [
    { etiqueta: "Dirección/Gerencia", valor: "Gerencia de Mantenimiento Planta" },
    { etiqueta: "Superintendencia", valor: "Sup. Mantenimiento Flotación" },
  ]);
});

test("sin gerencia asignada o con un área desconocida no borra nada", () => {
  assert.deepEqual(valoresDesdeElArea(["Gerencia", "Superintendencia"], "Chancado", porArea), [
    { etiqueta: "Superintendencia", valor: "Sup. Chancado" },
  ]);
  assert.deepEqual(valoresDesdeElArea(["Gerencia"], "Otra", porArea), []);
});

test("solo se pide la cadena si la plantilla tiene algo que llenar", () => {
  assert.equal(necesitaCadena(["Área", "Supervisor"]), false);
  assert.equal(necesitaCadena(["Área", "Superintendencia:"]), true);
});

test("el área y la superintendencia de una inspección, la plantilla las nombre como las nombre", () => {
  const f48 = { "Area Física:": "", Area: "Confiabilidad", "Superintendencia Sénior": "Sup. Mant.", "Superintendencia:": "Ing. de Confiabilidad" };
  assert.equal(valorDeVerificacion(f48, "area"), "Confiabilidad");
  assert.equal(valorDeVerificacion(f48, "superintendencia"), "Ing. de Confiabilidad");
  assert.equal(valorDeVerificacion({ "Area Física": "Filtros" }, "area"), "Filtros");
  assert.equal(valorDeVerificacion(undefined, "area"), "");
});

test("los nombres se comparan sin tildes ni mayúsculas", () => {
  assert.ok(mismoNombre("Flotación ", "FLOTACION"));
  assert.equal(mismoNombre("Filtros", "Flotación"), false);
});

const maestro = [
  { area: "Filtros", superintendencia: "Mec. Plta. Flot., Filtros, Taller Gral. y RH", gerencia: null },
  { area: "Generacion", superintendencia: "Mec. Plta. Flot., Filtros, Taller Gral. y RH", gerencia: null },
  // El maestro tiene dos «Generacion»: en las listas sale una sola.
  { area: "Generacion", superintendencia: "Mec. Plta. Flot., Filtros, Taller Gral. y RH", gerencia: null },
  { area: "Chancado", superintendencia: "Mec. Plta. Chancado, Molienda y Lubricación", gerencia: null },
  { area: "Sin jefe", superintendencia: null, gerencia: null },
];
const indice = indexarCadenas(maestro);

test("listas del maestro para los filtros de los reportes", () => {
  assert.deepEqual(superintendenciasDelMaestro(maestro), [
    "Mec. Plta. Chancado, Molienda y Lubricación",
    "Mec. Plta. Flot., Filtros, Taller Gral. y RH",
  ]);
  assert.deepEqual(areasDelMaestro(maestro, "mec. plta. flot., filtros, taller gral. y rh"), ["Filtros", "Generacion"]);
  assert.equal(areasDelMaestro(maestro).length, 4);
  assert.equal(superintendenciaDelArea("generación", indice), "Mec. Plta. Flot., Filtros, Taller Gral. y RH");
  assert.equal(superintendenciaDelArea("Otra", indice), null);
});

test("una inspección con el nombre viejo de la superintendencia entra por su área", () => {
  const vieja = { area: "Generacion", superintendencia: "Superintendencia de Mantenimiento - Mec. Planta Flotación, Filtros, Taller General y RH" };
  assert.ok(esDeSuperintendencia(vieja, "Mec. Plta. Flot., Filtros, Taller Gral. y RH", indice));
  // El maestro manda aunque el texto guardado diga otra cosa.
  assert.equal(esDeSuperintendencia({ area: "Chancado", superintendencia: "Mec. Plta. Flot., Filtros, Taller Gral. y RH" }, "Mec. Plta. Flot., Filtros, Taller Gral. y RH", indice), false);
  // Área que el maestro no conoce: se compara lo guardado.
  assert.ok(esDeSuperintendencia({ area: "Bodega vieja", superintendencia: "mec. plta. chancado, molienda y lubricacion" }, "Mec. Plta. Chancado, Molienda y Lubricación", indice));
});
