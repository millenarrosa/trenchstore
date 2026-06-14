const { Router } = require("express");
const { atualizarUsuario } = require("../controllers/usuarioController");
const { autenticar } = require("../middlewares/auth");

const router = Router();

router.put("/:id", autenticar, atualizarUsuario);

module.exports = router;
