import { test } from "node:test";
import assert from "node:assert/strict";
import {
  esCampoDeArea,
  esCampoDeGerencia,
  esCampoDeSuperintendencia,
  indexarCadenas,
  necesitaCadena,
  valoresDesdeElArea,
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
