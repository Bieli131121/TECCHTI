import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PDV from './pages/PDV'
import Caixa from './pages/Caixa'
import Estoque from './pages/Estoque'
import Financeiro from './pages/Financeiro'
import Servicos from './pages/Servicos'
import NotaFiscal from './pages/NotaFiscal'
import Relatorios from './pages/Relatorios'
import Suporte from './pages/Suporte'
import Perfil from './pages/Perfil'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #4d55f5, #818cf8)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white' }}>G</div>
        <p style={{ color: '#6666a0', fontSize: '0.85rem' }}>Carregando...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="pdv"         element={<PDV />} />
            <Route path="caixa"       element={<Caixa />} />
            <Route path="estoque"     element={<Estoque />} />
            <Route path="financeiro"  element={<Financeiro />} />
            <Route path="servicos"    element={<Servicos />} />
            <Route path="nota-fiscal" element={<NotaFiscal />} />
            <Route path="relatorios"  element={<Relatorios />} />
            <Route path="suporte"     element={<Suporte />} />
            <Route path="perfil"      element={<Perfil />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
