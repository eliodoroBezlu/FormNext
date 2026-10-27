import { test } from "node:test";
import assert from "node:assert/strict";
import { camposDeCierre, usuariosDeCierre } from "./responsablesCierre.ts";

test("una tarea de antes, con un solo usuario, lo tiene como lista", () => {
  assert.deepEqual(usuariosDeCierre({ responsableAreaCierreUsername: "jperez" }), ["jperez"]);
  assert.deepEqual(usuariosDeCierre(null), []);
});

test("con lista, la lista manda", () => {
  assert.deepEqual(
    usuariosDeCierre({
      responsableAreaCierreUsername: "jperez",
      responsablesAreaCierreUsernames: ["jperez", "mlopez"],
    }),
    ["jperez", "mlopez"],
  );
});

test("varios responsables: nombres con coma, el primero como único", () => {
  assert.deepEqual(
    camposDeCierre([
      { nomina: "Juan Pérez", username: "jperez" },
      { nomina: "María López", username: "mlopez" },
    ]),
    {
      responsableAreaCierre: "Juan Pérez, María López",
      responsableAreaCierreUsername: "jperez",
      responsablesAreaCierreUsernames: ["jperez", "mlopez"],
    },
  );
});

test("sin selección los tres quedan vacíos", () => {
  assert.deepEqual(camposDeCierre([]), {
    responsableAreaCierre: "",
    responsableAreaCierreUsername: "",
    responsablesAreaCierreUsernames: [],
  });
});
