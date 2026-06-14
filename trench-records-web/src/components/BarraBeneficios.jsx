import { Container, Row, Col } from "react-bootstrap";
import {
  Truck,
  CreditCard,
  ShieldCheck,
  CurrencyDollar,
} from "react-bootstrap-icons";

function BarraBeneficios() {
  const itens = [
    { icon: <Truck size={24} />, texto: "Entregamos em todo Brasil" },
    { icon: <CreditCard size={24} />, texto: "Até 3x sem juros" },
    { icon: <ShieldCheck size={24} />, texto: "Nossa loja é 100% segura" },
    { icon: <CurrencyDollar size={24} />, texto: "10% de desconto no PIX" },
  ];

  return (
    <Container className="my-4">
      <Row className="g-3">
        {itens.map((item, index) => (
          <Col key={index} md={3} xs={6}>
            <div className="bg-light p-3 rounded d-flex align-items-center gap-2 text-center justify-content-center">
              {item.icon}
              <span className="fw-bold small">{item.texto}</span>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default BarraBeneficios;
