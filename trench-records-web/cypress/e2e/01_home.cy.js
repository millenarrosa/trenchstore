describe("Página Inicial", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("deve exibir o header com logo e busca", () => {
    cy.get('img[alt="TRENCH Store"]').should("be.visible");
    cy.get('input[placeholder*="Buscar"]').should("be.visible");
    cy.contains("Discos Nacionais").should("be.visible");
    cy.contains("Discos Internacionais").should("be.visible");
  });

  it("deve exibir o catálogo de discos", () => {
    cy.contains("Catálogo de Discos").should("be.visible");
    cy.get(".card").should("have.length.greaterThan", 0);
  });

  it("deve filtrar discos pela busca", () => {
    cy.get('input[placeholder*="Buscar"]').type("Beatles");
    cy.contains("Buscar").click();
    cy.contains('Resultados para "Beatles"').should("be.visible");
  });

  it("deve navegar para discos nacionais pelo menu", () => {
    cy.contains("Discos Nacionais").click();
    cy.contains("Discos Nacionais").should("be.visible");
  });

  it("deve exibir o footer", () => {
    cy.contains("TRENCH Store").should("be.visible");
  });
});
