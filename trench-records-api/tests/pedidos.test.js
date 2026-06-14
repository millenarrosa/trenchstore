const request = require("supertest");
const app = require("../src/app");
const { resetDB } = require("./helpers/resetDB");

let tokenAdmin;
let tokenCliente;
let discoId1;
let discoId2;
let pedidoId;

beforeAll(async () => {
  await resetDB();

  // Cria e autentica admin
  await request(app).post("/auth/signup").send({
    nome: "Admin",
    email: "admin@trench.com",
    senha: "123456",
    telefone: "54991895737",
    role: "admin",
  });
  const loginAdmin = await request(app)
    .post("/auth/login")
    .send({ email: "admin@trench.com", senha: "123456" });
  tokenAdmin = loginAdmin.body.token;

  // Cria e autentica cliente
  await request(app).post("/auth/signup").send({
    nome: "Cliente",
    email: "cliente@trench.com",
    telefone: "54991895737",
    senha: "123456",
  });
  const loginCliente = await request(app)
    .post("/auth/login")
    .send({ email: "cliente@trench.com", senha: "123456" });
  tokenCliente = loginCliente.body.token;

  // Cria dois discos para usar nos pedidos
  const disco1 = await request(app)
    .post("/discos")
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({
      titulo: "Kind of Blue",
      artista: "Miles Davis",
      genero: "Jazz",
      preco: 119.9,
      estoque: 5,
    });

  const disco2 = await request(app)
    .post("/discos")
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({
      titulo: "Thriller",
      artista: "Michael Jackson",
      genero: "Pop",
      preco: 99.9,
      estoque: 10,
    });

  discoId1 = disco1.body.id;
  discoId2 = disco2.body.id;
});

describe("POST /pedidos", () => {
  it("cliente autenticado deve criar um pedido", async () => {
    const res = await request(app)
      .post("/pedidos")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({
        discos: [
          { discoId: discoId1, quantidade: 1 },
          { discoId: discoId2, quantidade: 2 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.pedidoDiscos).toHaveLength(2);
    pedidoId = res.body.id; // salva para os próximos testes
  });

  it("deve retornar 400 ao criar pedido sem discos", async () => {
    const res = await request(app)
      .post("/pedidos")
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({ discos: [] });

    expect(res.status).toBe(400);
  });

  it("deve retornar 401 sem token", async () => {
    const res = await request(app)
      .post("/pedidos")
      .send({ discos: [{ discoId: discoId1, quantidade: 1 }] });

    expect(res.status).toBe(401);
  });
});

describe("GET /pedidos", () => {
  it("cliente deve listar apenas seus pedidos", async () => {
    const res = await request(app)
      .get("/pedidos")
      .set("Authorization", `Bearer ${tokenCliente}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Todos os pedidos retornados devem pertencer ao cliente
    res.body.forEach((p) => {
      expect(p.usuario.email).toBe("cliente@trench.com");
    });
  });

  it("admin deve listar todos os pedidos", async () => {
    const res = await request(app)
      .get("/pedidos")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /pedidos/:id/discos", () => {
  it("deve retornar os discos do pedido ⭐", async () => {
    const res = await request(app)
      .get(`/pedidos/${pedidoId}/discos`)
      .set("Authorization", `Bearer ${tokenCliente}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    // Verifica a estrutura de cada item
    expect(res.body[0]).toHaveProperty("quantidade");
    expect(res.body[0]).toHaveProperty("disco");
    expect(res.body[0].disco).toHaveProperty("titulo");
  });

  it("cliente não deve ver discos de pedido de outro usuário (403)", async () => {
    // Cria outro cliente
    await request(app).post("/auth/signup").send({
      nome: "Outro",
      email: "outro@trench.com",
      telefone: "54991895737",
      senha: "123456",
    });
    const loginOutro = await request(app)
      .post("/auth/login")
      .send({ email: "outro@trench.com", senha: "123456" });
    const tokenOutro = loginOutro.body.token;

    const res = await request(app)
      .get(`/pedidos/${pedidoId}/discos`)
      .set("Authorization", `Bearer ${tokenOutro}`);

    expect(res.status).toBe(403);
  });
});

describe("PATCH /pedidos/:id/status", () => {
  it("admin deve atualizar o status do pedido", async () => {
    const res = await request(app)
      .patch(`/pedidos/${pedidoId}/status`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "concluido" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("concluido");
  });

  it("deve retornar 400 para status inválido", async () => {
    const res = await request(app)
      .patch(`/pedidos/${pedidoId}/status`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "voando" });

    expect(res.status).toBe(400);
  });

  it("cliente não deve atualizar status (403)", async () => {
    const res = await request(app)
      .patch(`/pedidos/${pedidoId}/status`)
      .set("Authorization", `Bearer ${tokenCliente}`)
      .send({ status: "cancelado" });

    expect(res.status).toBe(403);
  });
});
