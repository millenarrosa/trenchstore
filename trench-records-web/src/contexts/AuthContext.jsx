import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// 1. Cria o contexto
const AuthContext = createContext(null);

// 2. Provider — envolve a aplicação e fornece o estado
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  // Ao montar, recupera sessão salva no localStorage
  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setCarregando(false);
  }, []);

  const login = async (email, senha) => {
    // Lança erro se der errado — quem chama trata com try/catch
    const { data } = await api.post("/auth/login", { email, senha });

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    setToken(data.token);
    setUsuario(data.usuario);

    // Redireciona admin para o painel, cliente para o catálogo
    if (data.usuario.role === "admin") {
      navigate("/admin/discos");
    } else {
      navigate("/");
    }
  };

  const signup = async (nome, email, senha, telefone) => {
    await api.post("/auth/signup", { nome, email, senha, telefone });
    await login(email, senha);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ usuario, setUsuario, token, carregando, login, signup, logout }}
    >
      {/* Só renderiza os filhos depois de verificar o localStorage */}
      {!carregando && children}
    </AuthContext.Provider>
  );
}

// 3. Hook customizado — forma limpa de consumir o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
