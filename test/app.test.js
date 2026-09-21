const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");

test("GET /health informa que el servicio está disponible", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("GET /v1/orders/:id devuelve el pedido solicitado", async () => {
  const response = await request(app).get("/v1/orders/ORD-123");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { id: "ORD-123", status: "CREATED" });
});
