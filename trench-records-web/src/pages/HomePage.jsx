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
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import BarraBeneficios from "../components/BarraBeneficios";

function HomePage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const termoBusca = searchParams.get("busca") || "";
  const categoria = searchParams.get("categoria") || "";

  const [discos, setDiscos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [carrinho, setCarrinho] = useState([]);
  const [toast, setToast] = useState({ visivel: false, mensagem: "" });

  useEffect(() => {
    const buscarDiscos = async () => {
      setCarregando(true);
      try {
        const { data } = await api.get("/discos");
        setDiscos(data);
      } catch {
        setErro("Não foi possível carregar o catálogo.");
      } finally {
        setCarregando(false);
      }
    };
    buscarDiscos();
  }, []);

  // Destaques sempre no topo
  const discosOrdenados = [...discos].sort((a, b) => {
    if (a.destaque && !b.destaque) return -1;
    if (!a.destaque && b.destaque) return 1;
    return 0;
  });

  const discosFiltrados = discosOrdenados.filter((d) => {
    if (categoria === "nacional") return d.nacional;
    if (categoria === "internacional") return d.internacional;
    if (categoria === "oferta") return d.oferta;
    if (!termoBusca) return true;
    const termo = termoBusca.toLowerCase();
    return (
      d.titulo.toLowerCase().includes(termo) ||
      d.artista.toLowerCase().includes(termo) ||
      d.genero.toLowerCase().includes(termo)
    );
  });

  // Separa destaques (máx 4) e restante
  const destaques = discosFiltrados.filter((d) => d.destaque).slice(0, 4);
  const demaisDiscos =
    !categoria && !termoBusca
      ? discosFiltrados.filter((d) => !d.destaque)
      : discosFiltrados;

  const adicionarAoCarrinho = (disco) => {
    setCarrinho((prev) => {
      const jaExiste = prev.find((i) => i.discoId === disco.id);
      if (jaExiste) {
        return prev.map((i) =>
          i.discoId === disco.id ? { ...i, quantidade: i.quantidade + 1 } : i,
        );
      }
      return [...prev, { discoId: disco.id, quantidade: 1 }];
    });
    setToast({
      visivel: true,
      mensagem: `"${disco.artista}" adicionado ao pedido!`,
    });
  };

  const visualizarPedido = async () => {
    if (!usuario) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/pedidos", { discos: carrinho });
      setCarrinho([]);
      navigate("/pedidos");
    } catch (err) {
      setToast({
        visivel: true,
        mensagem: err.response?.data?.erro || "Erro ao salvar pedido.",
      });
    }
  };

  const renderCard = (disco) => (
    <Col key={disco.id}>
      <Card className="h-100 shadow-sm border-0">
        {disco.imagemUrl ? (
          <div style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
            <Card.Img
              variant="top"
              src={disco.imagemUrl}
              alt={disco.titulo}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            className="d-flex align-items-center justify-content-center bg-secondary text-white"
            style={{ aspectRatio: "1 / 1", fontSize: "2rem" }}
          >
            sem imagem
          </div>
        )}

        <Card.Body className="d-flex flex-column">
          <div className="d-flex gap-1 mb-2">
            <Badge bg="secondary">{disco.genero}</Badge>
            {disco.destaque && (
              <Badge bg="warning" text="dark">
                Destaque
              </Badge>
            )}
            {disco.oferta && <Badge bg="danger">Oferta</Badge>}
          </div>
          <Card.Title className="fw-bold fs-5 mb-0">{disco.artista}</Card.Title>
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
  );

  return (
    <Container className="py-4">
      {/* Botão carrinho */}
      {carrinho.length > 0 && (
        <div className="d-flex justify-content-end mb-3">
          <Button variant="dark" onClick={visualizarPedido}>
            Finalizar Pedido{" "}
            <Badge bg="warning" text="dark">
              {carrinho.reduce((acc, i) => acc + i.quantidade, 0)}
            </Badge>
          </Button>
        </div>
      )}

      {erro && <Alert variant="danger">{erro}</Alert>}

      {carregando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
          <p className="mt-3 text-muted">Carregando catálogo...</p>
        </div>
      ) : discosFiltrados.length === 0 ? (
        <Alert variant="info">
          {termoBusca
            ? `Nenhum disco encontrado para "${termoBusca}".`
            : "Nenhum disco cadastrado ainda."}
        </Alert>
      ) : (
        <>
          {/* Seção Destaques — só aparece se não houver busca e tiver destaques */}
          {!termoBusca && !categoria && destaques.length > 0 && (
            <>
              <h4 className="fw-bold mb-3">Discos em Destaque</h4>
              <Row xs={1} sm={2} md={3} lg={4} className="g-4 mb-2">
                {destaques.map(renderCard)}
              </Row>
            </>
          )}

          {/* Barra de benefícios — aparece após os destaques */}
          {!termoBusca && !categoria && destaques.length > 0 && (
            <>
              <BarraBeneficios />

              {/* Seção promocional */}
              <div
                className="text-center py-5 px-3 my-2"
                style={{
                  borderTop: "1px solid #dee2e6",
                  borderBottom: "1px solid #dee2e6",
                }}
              >
                <h3
                  className="fw-bold mb-3"
                  style={{ maxWidth: "800px", margin: "0 auto 1rem" }}
                >
                  Ajudamos você a encontrar os discos das melhores músicas do
                  mundo, do jeito que a sua coleção merece!
                </h3>
                <h6 className="text-muted mb-3">
                  Ao fazer o primeiro pedido, você pode usar o cupom de 5% de
                  desconto: <strong>PRIMEIRACOMPRA</strong>
                </h6>
              </div>
            </>
          )}

          {/* Catálogo completo */}
          <h4 className="fw-bold mb-3 mt-4">
            {categoria === "nacional" && "Discos Nacionais"}
            {categoria === "internacional" && "Discos Internacionais"}
            {categoria === "oferta" && "Discos em Oferta"}
            {termoBusca && `Resultados para "${termoBusca}"`}
            {!categoria && !termoBusca && "Catálogo de Discos"}
          </h4>
          <small className="text-muted d-block mb-3">
            {discosFiltrados.length} disco(s) encontrado(s)
          </small>
          <Row xs={1} sm={2} md={3} lg={5} className="g-4">
            {demaisDiscos.map(renderCard)}
          </Row>
        </>
      )}

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

export default HomePage;
