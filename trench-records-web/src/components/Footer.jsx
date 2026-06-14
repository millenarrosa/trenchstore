import { Container } from "react-bootstrap";

function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container className="text-center">
        <p className="mb-1 fw-bold">TRENCH Store</p>
        <small className="text-secondary">
          © {new Date().getFullYear()} — Todos os direitos reservados
        </small>
      </Container>
    </footer>
  );
}

export default Footer;
