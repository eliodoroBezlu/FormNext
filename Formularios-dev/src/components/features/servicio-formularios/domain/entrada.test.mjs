import { test } from "node:test";
import assert from "node:assert/strict";
import { esPedidoDeToken, origenDe, urlDeEntrada } from "./models/entrada.ts";

test("el origen de la web, sin ruta ni barra", () => {
  assert.equal(origenDe("http://localhost:3201/"), "http://localhost:3201");
  assert.equal(origenDe("https://formularios.ejemplo.com/x"), "https://formularios.ejemplo.com");
  assert.equal(origenDe(""), null);
  assert.equal(origenDe("localhost:3201"), null);
});

test("el token va en el fragmento, nunca en la consulta", () => {
  const url = urlDeEntrada("http://localhost:3201/", "a.b.c");
  assert.equal(url, "http://localhost:3201/entrar#token=a.b.c");
  assert.ok(!url.includes("?"));
  assert.equal(
    urlDeEntrada("http://localhost:3201", "a.b.c", "/registros"),
    "http://localhost:3201/entrar#token=a.b.c&volver=%2Fregistros",
  );
});

test("solo se contesta el pedido que viene de la web del servicio", () => {
  const web = "http://localhost:3201";
  assert.equal(esPedidoDeToken(web, { tipo: "formularios:token-pedido" }, web), true);
  assert.equal(esPedidoDeToken("http://otro.com", { tipo: "formularios:token-pedido" }, web), false);
  assert.equal(esPedidoDeToken(web, { tipo: "otra-cosa" }, web), false);
  assert.equal(esPedidoDeToken(web, null, web), false);
});
