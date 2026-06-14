import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(form.email, form.senha);
    } catch (err) {
      const mensagem =
        err.response?.data?.erro || "Erro ao fazer login. Tente novamente.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={6} lg={5}>
          <div className="text-center mb-4">
            <h2 className="fw-bold">TRENCH Store</h2>
            <p className="text-muted">Entre na sua conta</p>
          </div>

          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {erro && (
                <Alert variant="danger" dismissible onClose={() => setErro("")}>
                  {erro}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Informe seu e-mail"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    name="senha"
                    placeholder="Informe sua senha"
                    value={form.senha}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="dark"
                  className="w-100"
                  disabled={carregando}
                >
                  {carregando ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center mt-3 text-muted">
            Não tem conta?{" "}
            <Link to="/signup" className="text-dark fw-bold">
              Cadastre-se
            </Link>
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
