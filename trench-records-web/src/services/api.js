import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3333',
})

// Interceptor: injeta o token JWT em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api


//Por que um interceptor? Em vez de lembrar de colocar o header em cada chamada manualmente, o Axios faz isso sozinho toda vez que encontrar um token no localStorage. Escreve uma vez, funciona em toda a aplicação.