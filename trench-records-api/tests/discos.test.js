const request = require("supertest");
const app = require("../src/app");
const { resetDB } = require("./helpers/resetDB");

let tokenAdmin;
let tokenCliente;
let discoId;

// Antes de todos os testes: limpa o banco e cria usuários reais
beforeAll(async () => {
  await resetDB();

  // Cria e loga o admin
  await request(app).post("/auth/signup").send({
    nome: "Admin",
    email: "admin@trench.com",
    senha: "123456",
    telefone: "54991895737",
    role: "admin",
  });
  const loginAdmin = await request(app).post("/auth/login").send({
    email: "admin@trench.com",
    senha: "123456",
  });
  tokenAdmin = loginAdmin.body.token;

  // Cria e loga o cliente
  await request(app).post("/auth/signup").send({
    nome: "Cliente",
    email: "cliente@trench.com",
    telefone: "54991895737",
    senha: "123456",
  });
  const loginCliente = await request(app).post("/auth/login").send({
    email: "cliente@trench.com",
    senha: "123456",
  });
  tokenCliente = loginCliente.body.token;
});

describe("POST /discos", () => {
  it("admin deve criar um disco com sucesso", async () => {
    const res = await request(app)
      .post("/discos")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        titulo: "Rumours",
        artista: "Fleetwood Mac",
        genero: "Rock",
        preco: 139.9,
        estoque: 8,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.titulo).toBe("Rumours");
    discoId = res.body.id; // salva para os próximos testes
  });

  it("cliente não deve conseguir criar disco (403)", async () => {
    const res = await request(app)
      .post("/discos")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        titulo: "Tentativa",
        artista: "Ninguém",
        genero: "Pop",
        preco: 50,
      });

    expect(res.status).toBe(403);
  });

  it("requisição sem token deve retornar 401", async () => {
    const res = await request(app).post("/discos").send({
      titulo: "Sem Token",
      artista: "Ninguém",
      genero: "Pop",
      preco: 50,
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /discos", () => {
  it("deve listar discos sem autenticação (rota pública)", async () => {
    const res = await request(app).get("/discos");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("deve buscar um disco por ID", async () => {
    const res = await request(app).get(`/discos/${discoId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(discoId);
  });

  it("deve retornar 404 para disco inexistente", async () => {
    const res = await request(app).get("/discos/99999");
    expect(res.status).toBe(404);
  });
});

describe("PUT /discos/:id", () => {
  it("admin deve atualizar um disco", async () => {
    const res = await request(app)
      .put(`/discos/${discoId}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ preco: 159.9, estoque: 15 });

    expect(res.status).toBe(200);
    expect(res.body.preco).toBe(159.9);
    expect(res.body.estoque).toBe(15);
  });
});

describe("DELETE /discos/:id", () => {
  it("admin deve deletar um disco", async () => {
    // Cria um disco temporário só para deletar
    const criado = await request(app)
      .post("/discos")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        titulo: "Para Deletar",
        artista: "Temporário",
        genero: "Jazz",
        preco: 99.9,
      });

    const res = await request(app)
      .delete(`/discos/${criado.body.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(204);
  });
});
