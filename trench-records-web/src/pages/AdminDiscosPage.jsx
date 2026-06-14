import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import api from "../services/api";

const FORM_INICIAL = {
  titulo: "",
  artista: "",
  genero: "",
  preco: "",
  estoque: "",
  imagemUrl: "",
  destaque: false,
  nacional: false,
  internacional: false,
  oferta: false,
};

function AdminDiscosPage() {
  const [discos, setDiscos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [previewImagem, setPreviewImagem] = useState("");
  const [confirmarDelecao, setConfirmarDelecao] = useState(null);

  const carregarDiscos = useCallback(async () => {
    try {
      const { data } = await api.get("/discos");
      setDiscos(data);
    } catch {
      setErro("Erro ao carregar discos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDiscos();
  }, [carregarDiscos]);

  const abrirModalCriacao = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setPreviewImagem("");
    setModalAberto(true);
  };

  const abrirModalEdicao = (disco) => {
    setEditando(disco);
    setForm({
      titulo: disco.titulo,
      artista: disco.artista,
      genero: disco.genero,
      preco: disco.preco,
      estoque: disco.estoque,
      imagemUrl: disco.imagemUrl || "",
      destaque: disco.destaque || false,
      nacional: disco.nacional || false,
      internacional: disco.internacional || false,
      oferta: disco.oferta || false,
    });
    setPreviewImagem(disco.imagemUrl || "");
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(null);
    setForm(FORM_INICIAL);
    setPreviewImagem("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheck = (e) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleImagemUpload = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    if (arquivo.size > 2 * 1024 * 1024) {
      setErro("Imagem muito grande. Use uma imagem de até 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImagem(reader.result);
      setForm((prev) => ({ ...prev, imagemUrl: reader.result }));
    };
    reader.readAsDataURL(arquivo);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso("");

    const payload = {
      ...form,
      preco: Number(form.preco),
      estoque: Number(form.estoque),
      imagemUrl: form.imagemUrl || null,
    };

    try {
      if (editando) {
        await api.put(`/discos/${editando.id}`, payload);
        setSucesso(`"${form.artista}" atualizado com sucesso!`);
      } else {
        await api.post("/discos", payload);
        setSucesso(`"${form.artista}" cadastrado com sucesso!`);
      }
      fecharModal();
      carregarDiscos();
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao salvar disco.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async () => {
    if (!confirmarDelecao) return;
    try {
      await api.delete(`/discos/${confirmarDelecao.id}`);
      setSucesso(`"${confirmarDelecao.titulo}" removido do catálogo.`);
      setConfirmarDelecao(null);
      carregarDiscos();
    } catch {
      setErro("Erro ao deletar disco.");
      setConfirmarDelecao(null);
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Gerenciar Discos</h2>
          <small className="text-muted">
            {discos.length} discos no catálogo
          </small>
        </div>
        <Button variant="dark" onClick={abrirModalCriacao}>
          + Novo Disco
        </Button>
      </div>

      {erro && (
        <Alert variant="danger" dismissible onClose={() => setErro("")}>
          {erro}
        </Alert>
      )}
      {sucesso && (
        <Alert variant="success" dismissible onClose={() => setSucesso("")}>
          {sucesso}
        </Alert>
      )}

      {carregando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : (
        <Table hover responsive className="align-middle shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Imagem</th>
              <th>Artista</th>
              <th>Título</th>
              <th>Gênero</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Tags</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {discos.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted py-4">
                  Nenhum disco cadastrado. Clique em "+ Novo Disco" para
                  começar.
                </td>
              </tr>
            ) : (
              discos.map((disco) => (
                <tr key={disco.id}>
                  <td className="text-muted small">{disco.id}</td>
                  <td>
                    {disco.imagemUrl ? (
                      <img
                        src={disco.imagemUrl}
                        alt={disco.titulo}
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #dee2e6",
                        }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-light text-secondary"
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "6px",
                          fontSize: "1rem",
                        }}
                      >
                        —
                      </div>
                    )}
                  </td>
                  <td className="fw-bold">{disco.artista}</td>
                  <td>{disco.titulo}</td>
                  <td>
                    <Badge bg="secondary">{disco.genero}</Badge>
                  </td>
                  <td>
                    R${" "}
                    {Number(disco.preco).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <Badge bg={disco.estoque > 0 ? "success" : "danger"}>
                      {disco.estoque}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {disco.destaque && (
                        <Badge bg="warning" text="dark">
                          Destaque
                        </Badge>
                      )}
                      {disco.nacional && <Badge bg="success">Nacional</Badge>}
                      {disco.internacional && (
                        <Badge bg="primary">Internacional</Badge>
                      )}
                      {disco.oferta && <Badge bg="danger">Oferta</Badge>}
                      {!disco.destaque &&
                        !disco.nacional &&
                        !disco.internacional &&
                        !disco.oferta && (
                          <span className="text-muted small">—</span>
                        )}
                    </div>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="me-2"
                      onClick={() => abrirModalEdicao(disco)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setConfirmarDelecao(disco)}
                    >
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal Criar / Editar */}
      <Modal show={modalAberto} onHide={fecharModal} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            {editando ? `Editar: ${editando.artista}` : "+ Novo Disco"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSalvar}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Artista *</Form.Label>
              <Form.Control
                name="artista"
                value={form.artista}
                onChange={handleChange}
                required
                placeholder="Ex: The Beatles"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Título do Álbum *</Form.Label>
              <Form.Control
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                required
                placeholder="Ex: Abbey Road"
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Gênero *</Form.Label>
                  <Form.Control
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Rock"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Preço (R$) *</Form.Label>
                  <Form.Control
                    name="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.preco}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Estoque</Form.Label>
              <Form.Control
                name="estoque"
                type="number"
                min="0"
                value={form.estoque}
                onChange={handleChange}
                placeholder="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imagem do Disco</Form.Label>
              {previewImagem && (
                <div className="mb-2 text-center">
                  <img
                    src={previewImagem}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "180px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                    }}
                  />
                </div>
              )}
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImagemUpload}
              />
              <Form.Text className="text-muted">
                JPG, PNG ou WEBP — máx. 2MB.
                {previewImagem && (
                  <span
                    className="text-danger ms-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setPreviewImagem("");
                      setForm((prev) => ({ ...prev, imagemUrl: "" }));
                    }}
                  >
                    Remover imagem
                  </span>
                )}
              </Form.Text>
            </Form.Group>

            {/* Checkboxes de categorias */}
            <Form.Label className="fw-bold">Categorias</Form.Label>
            <div className="d-flex gap-4 flex-wrap mb-2">
              <Form.Check
                type="checkbox"
                id="destaque"
                name="destaque"
                label="Destaque"
                checked={form.destaque}
                onChange={handleCheck}
              />
              <Form.Check
                type="checkbox"
                id="nacional"
                name="nacional"
                label="Nacional"
                checked={form.nacional}
                onChange={handleCheck}
              />
              <Form.Check
                type="checkbox"
                id="internacional"
                name="internacional"
                label="Internacional"
                checked={form.internacional}
                onChange={handleCheck}
              />
              <Form.Check
                type="checkbox"
                id="oferta"
                name="oferta"
                label="Oferta"
                checked={form.oferta}
                onChange={handleCheck}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={fecharModal}>
              Cancelar
            </Button>
            <Button variant="dark" type="submit" disabled={salvando}>
              {salvando ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Salvando...
                </>
              ) : editando ? (
                "Salvar Alterações"
              ) : (
                "Cadastrar Disco"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal
        show={!!confirmarDelecao}
        onHide={() => setConfirmarDelecao(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja remover{" "}
          <strong>
            "{confirmarDelecao?.artista} — {confirmarDelecao?.titulo}"
          </strong>{" "}
          do catálogo?
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
            Sim, deletar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminDiscosPage;
