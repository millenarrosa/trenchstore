const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const discoRoutes = require("./routes/discoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Rotas
app.use("/auth", authRoutes);
app.use("/discos", discoRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/usuarios", usuarioRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", projeto: "TRENCH Records API" });
});

module.exports = app;
