import { useState } from "react";
import { Container, Button, Form, InputGroup, Nav } from "react-bootstrap";
// 1. Adicionamos o useLocation aqui embaixo 👇
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  // 2. Lendo a URL e a busca atual 👇
  const location = useLocation();
  const buscaAtual = new URLSearchParams(location.search).get("busca");
  const pathname = location.pathname; // Usado para o "Como Comprar"

  const handleBusca = (e) => {
    e.preventDefault();
    navigate(`/?busca=${encodeURIComponent(busca)}`);
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      {/* ── LINHA 1 — Logo + Auth ── */}
      <div style={{ backgroundColor: "#8fad88" }} className="py-3">
        <Container fluid className="px-5">
          <div className="d-flex align-items-center justify-content-between">
            {/* ESQUERDA — Logo */}
            <NavLink to="/">
              <img
                src="/trenchlogo.png"
                alt="TRENCH Store"
                style={{ height: "150px", objectFit: "contain" }}
              />
            </NavLink>

            {/* DIREITA — Auth */}
            <div className="d-flex align-items-center gap-3">
              {usuario ? (
                <>
                  <span className="text-light">
                    Olá, <strong>{usuario.nome.split(" ")[0]}</strong>
                    {usuario.role === "admin" && (
                      <span className="badge bg-warning text-dark ms-2">
                        admin
                      </span>
                    )}
                  </span>
                  {usuario.role === "admin" && (
                    <Button
                      variant="outline-warning"
                      onClick={() => navigate("/admin/discos")}
                    >
                      Gerenciar Discos
                    </Button>
                  )}
                  <Button
                    variant="outline-light"
                    onClick={() => navigate("/pedidos")}
                  >
                    Pedidos
                  </Button>
                  <Button
                    variant="outline-light"
                    onClick={() => navigate("/perfil")}
                  >
                    Meu Perfil
                  </Button>
                  <Button variant="outline-light" onClick={logout}>
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="light" onClick={() => navigate("/login")}>
                    Entrar
                  </Button>
                  <Button variant="dark" onClick={() => navigate("/signup")}>
                    Criar conta
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* ── LINHA 2 — Busca centralizada ── */}
      <div style={{ backgroundColor: "#7a9e72" }} className="py-2">
        <Container fluid className="px-5">
          <div className="d-flex justify-content-center">
            <Form
              onSubmit={handleBusca}
              style={{ width: "100%", maxWidth: "700px" }}
            >
              <InputGroup size="lg">
                <Form.Control
                  type="search"
                  placeholder="Buscar por artista, álbum ou gênero..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="border-0"
                />
                <Button type="submit" variant="dark">
                  Buscar
                </Button>
              </InputGroup>
            </Form>
          </div>
        </Container>
      </div>

      {/* ── LINHA 3 — Menu de categorias ── */}
      <div style={{ backgroundColor: "#7a9e72" }} className="py-2">
        <Container fluid className="px-5">
          <Nav className="gap-4 justify-content-center">
            <Nav.Link
              onClick={() => navigate("/?categoria=nacional")}
              className="text-light fw-semibold px-0 py-1"
            >
              Discos Nacionais
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate("/?categoria=internacional")}
              className="text-light fw-semibold px-0 py-1"
            >
              Discos Internacionais
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate("/?categoria=oferta")}
              className="text-light fw-semibold px-0 py-1"
            >
              Discos em Oferta
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate("/comocomprar")}
              className="text-light fw-semibold px-0 py-1"
            >
              Como Comprar
            </Nav.Link>
          </Nav>
        </Container>
      </div>
    </header>
  );
}

export default Header;
