import { useState, useEffect } from "react";
import {
  Container,
  Accordion,
  Badge,
  Spinner,
  Alert,
  Table,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const COR_STATUS = {
  pendente: "warning",
  "em processamento": "primary",
  concluido: "success",
  cancelado: "danger",
};

const LABEL_STATUS = {
  pendente: "Pendente",
  "em processamento": "Em Processamento",
  concluido: "Concluido",
  cancelado: "Cancelado",
};

function PedidosPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [confirmarDelecao, setConfirmarDelecao] = useState(null);
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(null);
  const [avisoSemTelefone, setAvisoSemTelefone] = useState(false);

  const carregarPedidos = async () => {
    try {
      const { data } = await api.get("/pedidos");
      setPedidos(data);
    } catch {
      setErro("Erro ao carregar pedidos.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const calcularTotal = (pedidoDiscos) => {
    return pedidoDiscos
      .reduce((acc, pd) => acc + pd.disco.preco * pd.quantidade, 0)
      .toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  };

  const handleDeletar = async () => {
    if (!confirmarDelecao) return;
    try {
      await api.delete(`/pedidos/${confirmarDelecao.id}`);
      setConfirmarDelecao(null);
      carregarPedidos();
    } catch {
      setErro("Erro ao excluir pedido.");
      setConfirmarDelecao(null);
    }
  };

  const atualizarStatus = async (pedidoId, novoStatus) => {
    try {
      await api.patch(`/pedidos/${pedidoId}/status`, { status: novoStatus });
      carregarPedidos();
    } catch {
      setErro("Erro ao atualizar status.");
    }
  };

  const excluirProdutoPedido = async (pedidoId, discoId) => {
    try {
      await api.delete(`/pedidos/${pedidoId}/discos/${discoId}`);

      setPedidos((pedidosAtuais) =>
        pedidosAtuais.map((pedido) => {
          if (pedido.id !== pedidoId) return pedido;

          return {
            ...pedido,
            pedidoDiscos: pedido.pedidoDiscos.filter(
              (pd) => pd.disco.id !== discoId,
            ),
          };
        }),
      );
    } catch {
      setErro("Erro ao excluir produto do pedido.");
    }
  };

  const abrirWhatsAppLoja = (pedido) => {
    const itens = pedido.pedidoDiscos
      .map(
        (pd) =>
          `• ${pd.disco.artista} - ${pd.disco.titulo} (x${pd.quantidade}) — R$ ${(
            pd.disco.preco * pd.quantidade
          ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      )
      .join("\n");
    const total = calcularTotal(pedido.pedidoDiscos);
    const mensagem = `Olá! Gostaria de finalizar meu pedido na TRENCH Store:\n\nPedido #${pedido.id}\n${itens}\n\nTotal: R$ ${total}\nNome: ${usuario?.nome}`;
    window.open(
      `https://wa.me/5554991895737?text=${encodeURIComponent(mensagem)}`,
      "_blank",
    );
  };

  const abrirWhatsAppCliente = (pedido) => {
    const telefone = pedido.usuario?.telefone?.replace(/\D/g, "");
    if (!telefone) {
      setAvisoSemTelefone(true);
      return;
    }
    const itens = pedido.pedidoDiscos
      .map(
        (pd) =>
          `• ${pd.disco.artista} - ${pd.disco.titulo} (x${pd.quantidade}) — R$ ${(
            pd.disco.preco * pd.quantidade
          ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      )
      .join("\n");
    const total = calcularTotal(pedido.pedidoDiscos);
    const mensagem = `Olá, ${pedido.usuario?.nome}! Tudo bem?\n\nPassando para confirmar seu pedido na TRENCH Store:\n\nPedido #${pedido.id}\n${itens}\n\nTotal: R$ ${total}\n\nPodemos finalizar?`;
    window.open(
      `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
    );
  };

  if (carregando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p className="mt-3 text-muted">Carregando pedidos...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">
            {usuario?.role === "admin" ? "Todos os Pedidos" : "Meus Pedidos"}
          </h2>
          <small className="text-muted">
            {pedidos.length} pedido(s) encontrado(s)
          </small>
        </div>

        {usuario?.role !== "admin" && (
          <Button variant="outline-dark" onClick={() => navigate("/")}>
            Fazer novo pedido
          </Button>
        )}
      </div>

      {erro && (
        <Alert variant="danger" dismissible onClose={() => setErro("")}>
          {erro}
        </Alert>
      )}

      {pedidos.length === 0 && !erro && (
        <Alert variant="info">
          Você ainda não fez nenhum pedido.{" "}
          <Alert.Link href="/">Ver catálogo</Alert.Link>
        </Alert>
      )}

      <Accordion>
        {pedidos.map((pedido) => (
          <Accordion.Item
            eventKey={String(pedido.id)}
            key={pedido.id}
            className="mb-2"
          >
            <Accordion.Header>
              <div className="d-flex w-100 justify-content-between align-items-center me-3">
                <span>
                  <strong>Pedido #{pedido.id}</strong>
                  <span className="text-muted ms-2 small">
                    {new Date(pedido.criadoEm).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {usuario?.role === "admin" && (
                    <span className="text-muted ms-2 small">
                      — {pedido.usuario?.nome}
                      {pedido.usuario?.telefone && (
                        <span className="ms-1">
                          ({pedido.usuario.telefone})
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg={COR_STATUS[pedido.status] || "secondary"}>
                    {LABEL_STATUS[pedido.status] || pedido.status}
                  </Badge>
                  <span className="fw-bold">
                    R$ {calcularTotal(pedido.pedidoDiscos)}
                  </span>
                </div>
              </div>
            </Accordion.Header>

            <Accordion.Body className="p-0">
              <Table hover className="mb-0" responsive>
                <thead className="table-light">
                  <tr>
                    <th>Disco</th>
                    <th>Artista</th>
                    <th>Qtd.</th>
                    <th>Preco Unit.</th>
                    <th>Subtotal</th>
                    {pedido.status === "pendente" && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {pedido.pedidoDiscos.map((pd) => (
                    <tr key={pd.disco.id}>
                      <td className="fw-bold">{pd.disco.titulo}</td>
                      <td className="text-muted">{pd.disco.artista}</td>
                      <td>{pd.quantidade}</td>
                      <td>
                        R${" "}
                        {Number(pd.disco.preco).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        R${" "}
                        {(pd.disco.preco * pd.quantidade).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </td>
                      {/* Botão X — só para pedidos pendentes */}
                      {pedido.status === "pendente" && (
                        <td className="text-center">
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            title="Remover item"
                            onClick={async () => {
                              await api.delete(
                                `/pedidos/${pedido.id}/discos/${pd.disco.id}`,
                              );
                              carregarPedidos();
                            }}
                          >
                            ✕
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan={4} className="text-end fw-bold">
                      Total do pedido:
                    </td>
                    <td className="fw-bold text-success">
                      R$ {calcularTotal(pedido.pedidoDiscos)}
                    </td>
                  </tr>

                  {/* Fluxo de status — só admin */}
                  {usuario?.role === "admin" && (
                    <tr>
                      <td colSpan={5} className="px-3 py-3">
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <small className="text-muted fw-bold">
                            Atualizar status:
                          </small>

                          <Form.Check
                            type="checkbox"
                            id={`contato-${pedido.id}`}
                            label="Contato feito"
                            checked={
                              pedido.status === "em processamento" ||
                              pedido.status === "concluido"
                            }
                            disabled={
                              pedido.status === "concluido" ||
                              pedido.status === "cancelado"
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                atualizarStatus(pedido.id, "em processamento");
                              } else {
                                atualizarStatus(pedido.id, "pendente");
                              }
                            }}
                          />

                          <Form.Check
                            type="checkbox"
                            id={`concluido-${pedido.id}`}
                            label="Pedido concluído"
                            checked={pedido.status === "concluido"}
                            disabled={
                              pedido.status === "pendente" ||
                              pedido.status === "cancelado"
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                atualizarStatus(pedido.id, "concluido");
                              } else {
                                atualizarStatus(pedido.id, "em processamento");
                              }
                            }}
                          />

                          {pedido.status !== "concluido" &&
                            pedido.status !== "cancelado" && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setConfirmarCancelamento(pedido)}
                              >
                                Cancelar pedido
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td colSpan={5} className="text-end pb-3 pt-2">
                      <div className="d-flex justify-content-end gap-2">
                        {usuario?.role !== "admin" &&
                          pedido.status === "pendente" && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => abrirWhatsAppLoja(pedido)}
                            >
                              Finalizar pelo WhatsApp
                            </Button>
                          )}

                        {usuario?.role === "admin" &&
                          pedido.status === "pendente" && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => abrirWhatsAppCliente(pedido)}
                            >
                              Entrar em contato com cliente
                            </Button>
                          )}

                        {(pedido.status === "pendente" ||
                          usuario?.role === "admin") && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setConfirmarDelecao(pedido)}
                          >
                            Excluir pedido
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {/* Modal aviso sem telefone */}
      <Modal
        show={avisoSemTelefone}
        onHide={() => setAvisoSemTelefone(false)}
        centered
      >
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>Telefone não cadastrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>Este cliente não cadastrou um telefone.</Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={() => setAvisoSemTelefone(false)}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar cancelamento */}
      <Modal
        show={!!confirmarCancelamento}
        onHide={() => setConfirmarCancelamento(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Cancelamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja cancelar o{" "}
          <strong>Pedido #{confirmarCancelamento?.id}</strong>?
          <br />
          <small className="text-danger">
            Essa ação não pode ser desfeita.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmarCancelamento(null)}
          >
            Voltar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              atualizarStatus(confirmarCancelamento.id, "cancelado");
              setConfirmarCancelamento(null);
            }}
          >
            Sim, cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar exclusão */}
      <Modal
        show={!!confirmarDelecao}
        onHide={() => setConfirmarDelecao(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o{" "}
          <strong>Pedido #{confirmarDelecao?.id}</strong>?
          <br />
          <small className="text-danger">
            Essa ação não pode ser desfeita.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmarDelecao(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeletar}>
            Sim, excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default PedidosPage;
