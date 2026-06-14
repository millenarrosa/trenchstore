describe("Pedidos", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/login");
    cy.get('input[name="email"]').type("admin@trench.com");
    cy.get('input[name="senha"]').type("123456");
    cy.get('input[name="senha"]').type("{enter}");
    cy.contains("Olá,", { timeout: 8000 }).should("be.visible");
    cy.visit("/");
  });

  it("deve adicionar disco ao carrinho", () => {
    cy.get(".card").first().contains("Adicionar ao Pedido").click();
    cy.contains("adicionado ao pedido", { timeout: 5000 }).should("be.visible");
    cy.contains("Finalizar Pedido").should("be.visible");
  });

  it("deve ir para pedidos ao clicar em finalizar", () => {
    cy.get(".card").first().contains("Adicionar ao Pedido").click();
    cy.contains("Finalizar Pedido", { timeout: 5000 }).click();
    cy.url().should("include", "/pedidos");
  });

  it("deve exibir pedidos na tela de pedidos", () => {
    cy.visit("/pedidos");
    cy.contains("Pedidos").should("be.visible");
  });
});
