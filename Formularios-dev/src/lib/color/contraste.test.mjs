import { test } from "node:test";
import assert from "node:assert/strict";
import { contraste, textoLegibleSobre } from "./contraste.ts";

const texto = { claro: "#FFFFFF", oscuro: "#0F1E29" };

test("negro sobre blanco da 21:1 y un color consigo mismo 1:1", () => {
  assert.equal(Math.round(contraste("#000000", "#FFFFFF")), 21);
  assert.equal(contraste("#18364A", "#18364A"), 1);
  assert.equal(contraste("#FFF", "#FFFFFF"), 1);
});

test("el semáforo de la matriz: cada nivel con el texto que se lee (AA, 4,5:1)", () => {
  const esperado = {
    "#2e7d32": "#FFFFFF", // ACEPTABLE
    "#689f38": "#0F1E29", // BAJA: con blanco daba 3,18:1
    "#f9a825": "#0F1E29", // ACEPTABLE CON REVISIÓN: con blanco daba 1,97:1
    "#ef6c00": "#0F1E29", // SUSTANCIAL: con blanco daba 3,08:1
    "#c62828": "#FFFFFF", // INACEPTABLE
    "#9e9e9e": "#0F1E29", // sin nivel
  };
  for (const [fondo, color] of Object.entries(esperado)) {
    const elegido = textoLegibleSobre(fondo, texto);
    assert.equal(elegido, color, fondo);
    assert.ok(contraste(fondo, elegido) >= 4.5, `${fondo}: ${contraste(fondo, elegido).toFixed(2)}`);
  }
});
