import { Container, Row, Col, Card } from "react-bootstrap";

function ComoComprar() {
  const passos = [
    {
      numero: "01",
      titulo: "Escolha seus discos",
      descricao:
        "Navegue pelo nosso catálogo para ver mais detalhes dos produtos que você deseja.",
    },
    {
      numero: "02",
      titulo: "Adicione ao pedido",
      descricao:
        'Clique no botão "Adicionar ao Pedido" para colocar o item no seu carrinho virtual.',
    },
    {
      numero: "03",
      titulo: "Revise a sua lista",
      descricao:
        'Você pode continuar navegando e adicionando outros produtos ou ir direto para a finalização clicando em "Finalizar Pedido".',
    },
    {
      numero: "04",
      titulo: "Finalize pelo WhatsApp",
      descricao:
        'Na página de fechamento do pedido, clique no botão "Finalizar pelo WhatsApp" para ser direcionado ao nosso atendimento.',
    },
    {
      numero: "05",
      titulo: "Combine o pagamento e envio",
      descricao:
        "No WhatsApp, nossa equipe vai combinar com você a melhor forma de pagamento e os detalhes para o envio seguro dos seus novos discos.",
    },
  ];

  return (
    <div
      style={{ backgroundColor: "#f8f9fa", minHeight: "calc(100vh - 250px)" }}
      className="py-5"
    >
      <Container>
        {/* Título Principal */}
        <Row className="justify-content-center mb-5 text-center">
          <Col md={8}>
            <h1 className="fw-bold mb-3" style={{ color: "#2d3a2e" }}>
              Como Comprar
            </h1>
            <p className="lead text-muted">
              Comprar na <strong>TRENCH Store</strong> é bem fácil. É só seguir
              os passos a seguir.
            </p>
          </Col>
        </Row>

        {/* Grid de Passos */}
        <Row className="justify-content-center g-4">
          {passos.map((passo, index) => (
            <Col key={index} xs={12} md={10} lg={8}>
              <Card
                className="border-0 shadow-sm p-3"
                style={{ borderRadius: "12px" }}
              >
                <Card.Body className="d-flex align-items-start gap-4">
                  {/* Número do Passo */}
                  <div
                    className="d-flex align-items-center justify-content-center fw-bold text-light fs-4"
                    style={{
                      backgroundColor: "#7a9e72",
                      minWidth: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                  >
                    {passo.numero}
                  </div>

                  {/* Conteúdo do Passo */}
                  <div>
                    <h5 className="fw-bold mb-2" style={{ color: "#2d3a2e" }}>
                      {passo.titulo}
                    </h5>
                    <p
                      className="text-muted mb-0"
                      style={{ lineHeight: "1.6" }}
                    >
                      {passo.descricao}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Mensagem Final de Ajuda */}
        <Row className="justify-content-center mt-5 text-center">
          <Col md={8}>
            <div
              className="p-4 rounded shadow-sm text-light"
              style={{ backgroundColor: "#7a9e72" }}
            >
              <h5 className="fw-bold mb-2">Ficou com alguma dúvida?</h5>
              <p className="mb-0 text-white-50">
                Se precisar de ajuda em qualquer etapa, você pode nos chamar
                direto no contato de Whatsapp: (54) 99189-5737. Estamos aqui
                para ajudar!
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ComoComprar;
