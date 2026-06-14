describe("Autenticação", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("deve fazer login com sucesso", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("admin@trench.com");
    cy.get('input[name="senha"]').type("123456");
    cy.get('input[name="senha"]').type("{enter}");
    cy.contains("Olá,", { timeout: 8000 }).should("be.visible");
  });

  it("deve exibir erro com credenciais inválidas", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("errado@email.com");
    cy.get('input[name="senha"]').type("senhaerrada");
    cy.get('input[name="senha"]').type("{enter}");
    cy.get(".alert-danger", { timeout: 6000 }).should("be.visible");
  });

  it("deve fazer logout", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("admin@trench.com");
    cy.get('input[name="senha"]').type("123456");
    cy.get('input[name="senha"]').type("{enter}");
    cy.contains("Olá,", { timeout: 8000 }).should("be.visible");
    cy.contains("Sair").click();
    cy.contains("Entrar").should("be.visible");
  });

  it("deve redirecionar para login ao acessar rota protegida", () => {
    cy.visit("/pedidos");
    cy.url().should("include", "/login");
  });
});
