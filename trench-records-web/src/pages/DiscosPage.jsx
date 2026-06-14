import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function DiscosPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [discos, setDiscos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [carrinho, setCarrinho] = useState([]);
  const [toast, setToast] = useState({ visivel: false, mensagem: "" });

  useEffect(() => {
    const buscarDiscos = async () => {
      try {
        const { data } = await api.get("/discos");
        setDiscos(data);
      } catch {
        setErro(
          "Não foi possível carregar o catálogo. Verifique se a API está rodando."
        );
      } finally {
        setCarregando(false);
      }
    };
    buscarDiscos();
  }, []);

  const adicionarAoCarrinho = (disco) => {
    setCarrinho((prev) => {
      const jaExiste = prev.find((i) => i.discoId === disco.id);
      if (jaExiste) {
        return prev.map((i) =>
          i.discoId === disco.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...prev, { discoId: disco.id, quantidade: 1 }];
    });
    setToast({
      visivel: true,
      mensagem: `"${disco.titulo}" adicionado ao pedido!`,
    });
  };

  const finalizarPedido = async () => {
    if (!usuario) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/pedidos", { discos: carrinho });
      setCarrinho([]);
      setToast({ visivel: true, mensagem: "Pedido realizado com sucesso!" });
    } catch {
      setToast({ visivel: true, mensagem: "Erro ao finalizar pedido." });
    }
  };

  if (carregando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Carregando catálogo...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Catálogo de Discos</h2>
          <small className="text-muted">
            {discos.length} discos disponíveis
          </small>
        </div>

        {carrinho.length > 0 && (
          <Button variant="dark" onClick={finalizarPedido}>
            Finalizar Pedido{" "}
            <Badge bg="warning" text="dark">
              {carrinho.reduce((acc, i) => acc + i.quantidade, 0)}
            </Badge>
          </Button>
        )}
      </div>

      {erro && <Alert variant="danger">{erro}</Alert>}

      {discos.length === 0 && !erro && (
        <Alert variant="info">
          Nenhum disco cadastrado ainda.{" "}
          {usuario?.role === "admin" && (
            <Alert.Link href="/admin/discos">
              Adicionar discos no painel admin
            </Alert.Link>
          )}
        </Alert>
      )}

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {discos.map((disco) => (
          <Col key={disco.id}>
            <Card className="h-100 shadow-sm border-0">
              {disco.imagemUrl ? (
                <div style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
                  <Card.Img
                    variant="top"
                    src={disco.imagemUrl}
                    alt={disco.titulo}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.parentElement.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-secondary text-white"
                  style={{ aspectRatio: "1 / 1", fontSize: "4rem" }}
                >
                  sem imagem
                </div>
              )}

              <Card.Body className="d-flex flex-column">
                <Badge bg="secondary" className="align-self-start mb-2">
                  {disco.genero}
                </Badge>
                <Card.Title className="fw-bold fs-5 mb-0">
                  {disco.artista}
                </Card.Title>
                <Card.Text className="text-muted small mb-auto">
                  {disco.titulo}
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="fw-bold fs-5">
                    R${" "}
                    {Number(disco.preco).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <Badge bg={disco.estoque > 0 ? "success" : "danger"}>
                    {disco.estoque > 0
                      ? `${disco.estoque} em estoque`
                      : "Esgotado"}
                  </Badge>
                </div>
              </Card.Body>

              <Card.Footer className="bg-white border-0 pt-0 pb-3 px-3">
                <Button
                  variant="dark"
                  className="w-100"
                  onClick={() => adicionarAoCarrinho(disco)}
                  disabled={disco.estoque === 0}
                >
                  {disco.estoque > 0 ? "Adicionar ao Pedido" : "Indisponivel"}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={toast.visivel}
          onClose={() => setToast({ ...toast, visivel: false })}
          delay={3000}
          autohide
          bg="dark"
        >
          <Toast.Body className="text-white">{toast.mensagem}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

export default DiscosPage;
