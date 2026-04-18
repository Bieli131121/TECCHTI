import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '', password: '', empresa: '', nome: ''
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit() {
    setError(''); setLoading(true)
    if (tab === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) setError(error.message)
      else navigate('/dashboard')
    } else {
      if (!form.empresa || !form.nome) { setError('Preencha todos os campos'); setLoading(false); return }
      const { error } = await signUp(form.email, form.password, form.empresa, form.nome)
      if (error) setError(error.message)
      else navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'radial-gradient(ellipse at 60% 20%, #1a1040 0%, #0a0a0f 60%)'
    }}>
      {/* Glow blob */}
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(77,85,245,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="animate-fade w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4d55f5, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: 'white'
            }}>G</div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#e8e8f0' }}>
              Gestão<span style={{ color: '#4d55f5' }}>Pro</span>
            </span>
          </div>
          <p style={{ color: '#6666a0', fontSize: '0.85rem' }}>Sistema de Gestão Empresarial</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111118', border: '1px solid #22223a', borderRadius: 18,
          padding: '2rem', boxShadow: '0 30px 80px rgba(0,0,0,0.5)'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: '#0a0a0f', borderRadius: 10,
            padding: 4, marginBottom: '1.5rem'
          }}>
            {['login', 'cadastro'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }} style={{
                flex: 1, padding: '0.5rem',
                background: tab === t ? '#4d55f5' : 'transparent',
                color: tab === t ? 'white' : '#6666a0',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}>
                {t === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {tab === 'cadastro' && (
              <>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    NOME DA EMPRESA
                  </label>
                  <input className="input" placeholder="Ex: Loja do João" value={form.empresa} onChange={set('empresa')} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    SEU NOME
                  </label>
                  <input className="input" placeholder="Nome completo" value={form.nome} onChange={set('nome')} />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                E-MAIL
              </label>
              <input className="input" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                SENHA
              </label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          </div>

          {error && (
            <div style={{
              marginTop: '1rem', padding: '0.75rem', borderRadius: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: '0.8rem'
            }}>{error}</div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}>
            {loading ? 'Aguarde...' : tab === 'login' ? 'Entrar na plataforma' : 'Criar minha conta grátis'}
          </button>
        </div>
      </div>
    </div>
  )
}
