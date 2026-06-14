const prisma = require("../prisma");

const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, telefone } = req.body;
  const usuarioLogado = req.usuario;

  // Cliente só pode atualizar o próprio perfil
  if (usuarioLogado.role !== "admin" && usuarioLogado.id !== Number(id)) {
    return res.status(403).json({ erro: "Acesso negado." });
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { nome, telefone },
    });

    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      role: usuario.role,
    });
  } catch {
    return res.status(500).json({ erro: "Erro ao atualizar usuário." });
  }
};

module.exports = { atualizarUsuario };
