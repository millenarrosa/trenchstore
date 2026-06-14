const request = require("supertest");
const app = require("../src/app");
const { resetDB } = require("./helpers/resetDB");

// Limpa o banco antes de todos os testes deste arquivo
beforeAll(async () => {
  await resetDB();
});

describe("POST /auth/signup", () => {
  it("deve criar um novo usuário com sucesso", async () => {
    const res = await request(app).post("/auth/signup").send({
      nome: "Usuário Teste",
      email: "teste@trench.com",
      telefone: "54991895737",
      senha: "123456",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("teste@trench.com");
    expect(res.body.role).toBe("cliente");
    // Garante que a senha nunca é exposta
    expect(res.body).not.toHaveProperty("senha");
  });

  it("deve retornar 409 para e-mail duplicado", async () => {
    const res = await request(app).post("/auth/signup").send({
      nome: "Usuário Teste",
      email: "teste@trench.com",
      telefone: "54991895737",
      senha: "123456",
    });

    expect(res.status).toBe(409);
    expect(res.body.erro).toBe("E-mail já cadastrado.");
  });

  it("deve retornar 400 quando campos obrigatórios faltam", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "incompleto@trench.com",
      // sem nome e senha
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("deve fazer login e retornar um token JWT", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "teste@trench.com",
      senha: "123456",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.usuario.email).toBe("teste@trench.com");
  });

  it("deve retornar 401 para senha incorreta", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "teste@trench.com",
      senha: "senhaerrada",
    });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe("Credenciais inválidas.");
  });

  it("deve retornar 401 para e-mail inexistente", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "naoexiste@trench.com",
      senha: "123456",
    });

    expect(res.status).toBe(401);
  });
});
