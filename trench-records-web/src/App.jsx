import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DiscosPage from "./pages/DiscosPage";
import AdminDiscosPage from "./pages/AdminDiscosPage";
import PedidosPage from "./pages/PedidosPage";
import PerfilPage from "./pages/PerfilPage";
import ComoComprar from "./pages/ComoComprar";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/discos" element={<DiscosPage />} />
          <Route path="/ComoComprar" element={<ComoComprar />} />

          {/* Rotas privadas — qualquer usuário logado */}
          <Route
            path="/pedidos"
            element={
              <PrivateRoute>
                <PedidosPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <PerfilPage />
              </PrivateRoute>
            }
          />

          {/* Rotas privadas — só admin */}
          <Route
            path="/admin/discos"
            element={
              <PrivateRoute role="admin">
                <AdminDiscosPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
