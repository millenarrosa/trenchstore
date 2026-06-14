import { useState } from 'react'
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner
} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function SignupPage() {
  const { signup } = useAuth()

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmar: ''
  })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (form.senha !== form.confirmar) {
      return setErro('As senhas não coincidem.')
    }
    if (form.senha.length < 6) {
      return setErro('A senha deve ter no mínimo 6 caracteres.')
    }
    if (!form.telefone || form.telefone.length < 10) {
      return setErro('Informe um telefone válido com DDD.')
    }

    setCarregando(true)
    try {
      await signup(form.nome, form.email, form.senha, form.telefone)
    } catch (err) {
      const mensagem = err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.'
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={6} lg={5}>

          <div className="text-center mb-4">
            <h2 className="fw-bold">TRENCH Store</h2>
            <p className="text-muted">Crie sua conta e comece a colecionar</p>
          </div>

          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">

              {erro && (
                <Alert variant="danger" dismissible onClose={() => setErro('')}>
                  {erro}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome completo *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>E-mail *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Telefone / WhatsApp *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefone"
                    placeholder="(54) 99999-9999"
                    value={form.telefone}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Usado para contato sobre seus pedidos
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Senha *</Form.Label>
                  <Form.Control
                    type="password"
                    name="senha"
                    placeholder="Mínimo 6 caracteres"
                    value={form.senha}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmar senha *</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmar"
                    placeholder="Repita a senha"
                    value={form.confirmar}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="dark"
                  className="w-100"
                  disabled={carregando}
                >
                  {carregando
                    ? <><Spinner size="sm" className="me-2" />Criando conta...</>
                    : 'Criar conta'
                  }
                </Button>
              </Form>

            </Card.Body>
          </Card>

          <p className="text-center mt-3 text-muted">
            Já tem conta?{' '}
            <Link to="/login" className="text-dark fw-bold">
              Entrar
            </Link>
          </p>

        </Col>
      </Row>
    </Container>
  )
}

export default SignupPage
