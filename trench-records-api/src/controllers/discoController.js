const prisma = require("../prisma");

// GET /discos — público, lista todos
const listarDiscos = async (req, res) => {
  try {
    const discos = await prisma.disco.findMany({
      orderBy: { criadoEm: "desc" },
    });
    return res.json(discos);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao listar discos." });
  }
};

// GET /discos/:id — público, busca um disco
const buscarDisco = async (req, res) => {
  const { id } = req.params;
  try {
    const disco = await prisma.disco.findUnique({
      where: { id: Number(id) },
    });

    if (!disco) {
      return res.status(404).json({ erro: "Disco não encontrado." });
    }

    return res.json(disco);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar disco." });
  }
};

// POST /discos — protegido (admin)
const criarDisco = async (req, res) => {
  const {
    titulo,
    artista,
    genero,
    preco,
    estoque,
    imagemUrl,
    destaque,
    nacional,
    internacional,
    oferta,
  } = req.body;

  if (!titulo || !artista || !genero || preco === undefined) {
    return res
      .status(400)
      .json({ erro: "Título, artista, gênero e preço são obrigatórios." });
  }

  try {
    const disco = await prisma.disco.create({
      data: {
        titulo,
        artista,
        genero,
        preco: Number(preco),
        estoque: Number(estoque) || 0,
        imagemUrl: imagemUrl || null,
        destaque: destaque === true || destaque === "true",
        nacional: nacional === true || nacional === "true",
        internacional: internacional === true || internacional === "true",
        oferta: oferta === true || oferta === "true",
      },
    });
    return res.status(201).json(disco);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao criar disco." });
  }
};

// PUT /discos/:id — protegido (admin)
const atualizarDisco = async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    artista,
    genero,
    preco,
    estoque,
    imagemUrl,
    destaque,
    nacional,
    internacional,
    oferta,
  } = req.body;

  try {
    const existe = await prisma.disco.findUnique({ where: { id: Number(id) } });
    if (!existe) {
      return res.status(404).json({ erro: "Disco não encontrado." });
    }

    const disco = await prisma.disco.update({
      where: { id: Number(id) },
      data: {
        titulo,
        artista,
        genero,
        preco: preco !== undefined ? Number(preco) : undefined,
        estoque: estoque !== undefined ? Number(estoque) : undefined,
        imagemUrl,
        destaque:
          destaque !== undefined
            ? destaque === true || destaque === "true"
            : undefined,
        nacional:
          nacional !== undefined
            ? nacional === true || nacional === "true"
            : undefined,
        internacional:
          internacional !== undefined
            ? internacional === true || internacional === "true"
            : undefined,
        oferta:
          oferta !== undefined
            ? oferta === true || oferta === "true"
            : undefined,
      },
    });
    return res.json(disco);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao atualizar disco." });
  }
};

// DELETE /discos/:id — protegido (admin)
const deletarDisco = async (req, res) => {
  const { id } = req.params;

  try {
    const existe = await prisma.disco.findUnique({ where: { id: Number(id) } });
    if (!existe) {
      return res.status(404).json({ erro: "Disco não encontrado." });
    }

    await prisma.disco.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao deletar disco." });
  }
};

module.exports = {
  listarDiscos,
  buscarDisco,
  criarDisco,
  atualizarDisco,
  deletarDisco,
};
