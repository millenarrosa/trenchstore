const { Router } = require("express");
const {
  criarPedido,
  listarPedidos,
  buscarPedido,
  listarDiscosDoPedido,
  atualizarStatus,
  deletarPedido,
  removerDiscoDoPedido,
} = require("../controllers/pedidoController");
const { autenticar, autorizar } = require("../middlewares/auth");

const router = Router();

// Todas as rotas exigem login
router.use(autenticar);

router.post("/", criarPedido);
router.get("/", listarPedidos);
router.get("/:id", buscarPedido);
router.get("/:id/discos", listarDiscosDoPedido);
router.delete("/:id", deletarPedido);
router.patch("/:id/status", autorizar("admin"), atualizarStatus);
router.delete("/:id/discos/:discoId", removerDiscoDoPedido);

module.exports = router;
