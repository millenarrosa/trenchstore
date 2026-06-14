const prisma = require("../prisma");

// POST /pedidos — cria ou atualiza pedido pendente existente
const criarPedido = async (req, res) => {
  const { discos } = req.body;
  const usuarioId = req.usuario.id;

  if (!discos || !Array.isArray(discos) || discos.length === 0) {
    return res
      .status(400)
      .json({ erro: "Informe ao menos um disco no pedido." });
  }

  try {
    const idsInformados = discos.map((d) => d.discoId);
    const discosExistentes = await prisma.disco.findMany({
      where: { id: { in: idsInformados } },
    });

    if (discosExistentes.length !== idsInformados.length) {
      return res
        .status(404)
        .json({ erro: "Um ou mais discos não foram encontrados." });
    }

    let pedido = await prisma.pedido.findFirst({
      where: { usuarioId, status: "pendente" },
      include: { pedidoDiscos: true },
    });

    if (pedido) {
      for (const item of discos) {
        const jaExiste = pedido.pedidoDiscos.find(
          (pd) => pd.discoId === item.discoId,
        );
        if (jaExiste) {
          await prisma.pedidoDisco.update({
            where: { id: jaExiste.id },
            data: { quantidade: jaExiste.quantidade + (item.quantidade || 1) },
          });
        } else {
          await prisma.pedidoDisco.create({
            data: {
              pedidoId: pedido.id,
              discoId: item.discoId,
              quantidade: item.quantidade || 1,
            },
          });
        }
      }
    } else {
      pedido = await prisma.pedido.create({
        data: {
          usuarioId,
          pedidoDiscos: {
            create: discos.map((d) => ({
              discoId: d.discoId,
              quantidade: d.quantidade || 1,
            })),
          },
        },
      });
    }

    const pedidoAtualizado = await prisma.pedido.findUnique({
      where: { id: pedido.id },
      include: {
        pedidoDiscos: { include: { disco: true } },
      },
    });

    return res.status(201).json(pedidoAtualizado);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao criar pedido." });
  }
};

// GET /pedidos
const listarPedidos = async (req, res) => {
  const { id, role } = req.usuario;

  try {
    const pedidos = await prisma.pedido.findMany({
      where: role === "admin" ? {} : { usuarioId: id },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        pedidoDiscos: {
          include: { disco: true },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    return res.json(pedidos);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao listar pedidos." });
  }
};

// GET /pedidos/:id
const buscarPedido = async (req, res) => {
  const { id } = req.params;
  const { id: usuarioId, role } = req.usuario;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        pedidoDiscos: {
          include: { disco: true },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado." });
    }

    if (role !== "admin" && pedido.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: "Acesso negado." });
    }

    return res.json(pedido);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar pedido." });
  }
};

// GET /pedidos/:id/discos
const listarDiscosDoPedido = async (req, res) => {
  const { id } = req.params;
  const { id: usuarioId, role } = req.usuario;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: {
        pedidoDiscos: {
          include: { disco: true },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado." });
    }

    if (role !== "admin" && pedido.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: "Acesso negado." });
    }

    const discos = pedido.pedidoDiscos.map((pd) => ({
      quantidade: pd.quantidade,
      disco: pd.disco,
    }));

    return res.json(discos);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao listar discos do pedido." });
  }
};

// PATCH /pedidos/:id/status — atualiza status (só admin)
const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = [
    "pendente",
    "em processamento",
    "concluido",
    "cancelado",
  ];
  if (!statusValidos.includes(status)) {
    return res
      .status(400)
      .json({ erro: `Status inválido. Use: ${statusValidos.join(", ")}` });
  }

  try {
    const existe = await prisma.pedido.findUnique({
      where: { id: Number(id) },
    });
    if (!existe) {
      return res.status(404).json({ erro: "Pedido não encontrado." });
    }

    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res.json(pedido);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao atualizar status." });
  }
};

// DELETE /pedidos/:id
const deletarPedido = async (req, res) => {
  const { id } = req.params;
  const { id: usuarioId, role } = req.usuario;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
    });

    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado." });
    }

    if (role !== "admin" && pedido.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: "Acesso negado." });
    }

    if (pedido.status !== "pendente" && role !== "admin") {
      return res
        .status(400)
        .json({ erro: "Só é possível excluir pedidos pendentes." });
    }

    await prisma.pedidoDisco.deleteMany({ where: { pedidoId: Number(id) } });
    await prisma.pedido.delete({ where: { id: Number(id) } });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao deletar pedido." });
  }
};

// DELETE /pedidos/:id/discos/:discoId
const removerDiscoDoPedido = async (req, res) => {
  const { id, discoId } = req.params;
  const { id: usuarioId, role } = req.usuario;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
    });

    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado." });
    }

    if (role !== "admin" && pedido.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: "Acesso negado." });
    }

    if (pedido.status !== "pendente") {
      return res
        .status(400)
        .json({ erro: "Só é possível remover itens de pedidos pendentes." });
    }

    await prisma.pedidoDisco.deleteMany({
      where: {
        pedidoId: Number(id),
        discoId: Number(discoId),
      },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao remover disco do pedido." });
  }
};

module.exports = {
  criarPedido,
  listarPedidos,
  buscarPedido,
  listarDiscosDoPedido,
  atualizarStatus,
  deletarPedido,
  removerDiscoDoPedido,
};
