describe("Admin — Gerenciar Discos", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/login");
    cy.get('input[name="email"]').type("admin@trench.com");
    cy.get('input[name="senha"]').type("123456");
    cy.get('input[name="senha"]').type("{enter}");
    cy.contains("Olá,", { timeout: 8000 }).should("be.visible");
    cy.visit("/admin/discos");
  });

  it("deve exibir a tabela de discos", () => {
    cy.contains("Gerenciar Discos").should("be.visible");
    cy.get("table").should("be.visible");
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("deve abrir modal de novo disco", () => {
    cy.contains("+ Novo Disco").click();
    cy.get('input[name="artista"]').should("be.visible");
  });

  it("deve criar um disco novo", () => {
    cy.contains("+ Novo Disco").click();
    cy.get('input[name="artista"]').type("Cypress Test Artist");
    cy.get('input[name="titulo"]').type("Cypress Test Album");
    cy.get('input[name="genero"]').type("Teste");
    cy.get('input[name="preco"]').type("99.90");
    cy.get('input[name="estoque"]').type("5");
    cy.contains("Cadastrar Disco").click();
    cy.contains("cadastrado com sucesso", { timeout: 5000 }).should(
      "be.visible",
    );
  });

  it("deve deletar o disco criado pelo teste", () => {
    cy.contains("tr", "Cypress Test Artist").contains("Deletar").click();
    cy.contains("Sim, deletar").click();
    cy.contains("removido do catálogo", { timeout: 5000 }).should("be.visible");
  });
});
