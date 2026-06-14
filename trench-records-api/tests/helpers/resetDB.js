const { PrismaClient } = require('@prisma/client');

// Aponta para o banco de teste
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

// Deleta os dados em ordem para respeitar as foreign keys
const resetDB = async () => {
  await prisma.pedidoDisco.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.disco.deleteMany();
  await prisma.usuario.deleteMany();
};

module.exports = { prisma, resetDB };

//Por que essa ordem? PedidoDisco referencia Pedido e Disco. Se tentarmos deletar Pedido antes de PedidoDisco, o SQLite lança erro de constraint. Sempre deletamos do filho para o pai.

