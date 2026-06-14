import { useState } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Spinner,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function PerfilPage() {
  const { usuario, setUsuario } = useAuth();

  const [nome, setNome] = useState(usuario?.nome || "");
  const [telefone, setTelefone] = useState(usuario?.telefone || "");
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setMensagem({ texto: "", tipo: "" });

    if (!nome.trim()) {
      return setMensagem({ texto: "O nome é obrigatório.", tipo: "danger" });
    }
    if (!telefone || telefone.length < 10) {
      return setMensagem({
        texto: "Informe um telefone válido com DDD.",
        tipo: "danger",
      });
    }

    setSalvando(true);
    try {
      const { data } = await api.put(`/usuarios/${usuario.id}`, {
        nome,
        telefone,
      });

      // Atualiza o localStorage e o contexto
      localStorage.setItem("usuario", JSON.stringify(data));
      setUsuario(data);

      setMensagem({
        texto: "Cadastro atualizado com sucesso!",
        tipo: "success",
      });
    } catch (err) {
      setMensagem({
        texto: err.response?.data?.erro || "Erro ao atualizar cadastro.",
        tipo: "danger",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <div className="mb-4">
            <h2 className="fw-bold mb-0">Meu Perfil</h2>
            <small className="text-muted">{usuario?.email}</small>
          </div>

          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {mensagem.texto && (
                <Alert
                  variant={mensagem.tipo}
                  dismissible
                  onClose={() => setMensagem({ texto: "", tipo: "" })}
                >
                  {mensagem.texto}
                </Alert>
              )}

              <Form onSubmit={salvar}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome completo *</Form.Label>
                  <Form.Control
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    value={usuario?.email}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    O e-mail não pode ser alterado.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Telefone / WhatsApp *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="(54) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Usado para contato sobre seus pedidos.
                  </Form.Text>
                </Form.Group>

                <Button
                  type="submit"
                  variant="dark"
                  className="w-100"
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PerfilPage;
