import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// role: 'admin' | 'cliente' | undefined (qualquer logado)
function PrivateRoute({ children, role }) {
  const { usuario } = useAuth()

  // Não está logado → redireciona para login
  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  // Está logado mas não tem a role necessária → redireciona para home
  if (role && usuario.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute