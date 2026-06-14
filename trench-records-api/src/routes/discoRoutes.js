const { Router } = require('express');
const {
  listarDiscos,
  buscarDisco,
  criarDisco,
  atualizarDisco,
  deletarDisco,
} = require('../controllers/discoController');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = Router();

// Rotas públicas — qualquer um pode ver os discos da loja
router.get('/', listarDiscos);
router.get('/:id', buscarDisco);

// Rotas protegidas — só admin gerencia o catálogo
router.post('/', autenticar, autorizar('admin'), criarDisco);
router.put('/:id', autenticar, autorizar('admin'), atualizarDisco);
router.delete('/:id', autenticar, autorizar('admin'), deletarDisco);

module.exports = router;