const express = require("express");

const app = express();

app.disable("x-powered-by");
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/v1/orders/:id", (req, res) => {
  res.status(200).json({ id: req.params.id, status: "CREATED" });
});

module.exports = app;
