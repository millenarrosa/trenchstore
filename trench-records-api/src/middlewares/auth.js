const jwt = require('jsonwebtoken');

// Middleware 1: Verifica se o token JWT é válido
const autenticar = (req, res, next) => {
  // O token vem no header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // pega só o token, sem "Bearer"

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Injeta os dados do usuário logado na requisição
    req.usuario = payload; // { id, role }
    next();
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
};

// Middleware 2: Verifica se o usuário tem a role necessária
// Uso: autorizar('admin') ou autorizar('admin', 'cliente')
const autorizar = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
};

module.exports = { autenticar, autorizar };

//Como eles se encadeiam? Numa rota protegida você vai usar: [autenticar, autorizar('admin')]. O autenticar roda primeiro, valida o token e popula req.usuario. Só então o autorizar verifica se a role bate.
