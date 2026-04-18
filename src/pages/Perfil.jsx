import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useEmpresa } from '../hooks/useEmpresa'

const EMPTY_USUARIO = { nome: '', email: '', role: 'operador', senha: '', senha2: '' }

export default function Perfil() {
  const { user, empresa } = useAuth()
  const empresaId = useEmpresa()

  const [tab, setTab] = useState('perfil')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  // Dados do usuário logado
  const [perfil, setPerfil] = useState({ nome: '', email: '', telefone: '' })

  // Dados da empresa
  const [dadosEmpresa, setDadosEmpresa] = useState({
    nome: '', cnpj: '', inscricao_municipal: '', telefone: '', email: '', endereco: '', plano: ''
  })

  // Usuários da empresa
  const [usuarios, setUsuarios] = useState([])
  const [modalUsuario, setModalUsuario] = useState(false)
  const [formUsuario, setFormUsuario] = useState(EMPTY_USUARIO)
  const [editUserId, setEditUserId] = useState(null)

  useEffect(() => {
    if (!empresaId) return
    loadPerfil()
    loadEmpresa()
    loadUsuarios()
  }, [empresaId])

  async function loadPerfil() {
    const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
    if (data) setPerfil({ nome: data.nome || '', email: data.email || '', telefone: data.telefone || '' })
  }

  async function loadEmpresa() {
    const { data } = await supabase.from('empresas').select('*').eq('id', empresaId).single()
    if (data) setDadosEmpresa({
      nome:                data.nome || '',
      cnpj:                data.cnpj || '',
      inscricao_municipal: data.inscricao_municipal || '',
      telefone:            data.telefone || '',
      email:               data.email || '',
      endereco:            data.endereco || '',
      plano:               data.plano || 'basico',
    })
  }

  async function loadUsuarios() {
    const { data } = await supabase.from('usuarios').select('*').eq('empresa_id', empresaId).order('nome')
    setUsuarios(data || [])
  }

  function showMsg(type, text) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  async function salvarPerfil() {
    setLoading(true)
    await supabase.from('usuarios').update({
      nome: perfil.nome, telefone: perfil.telefone
    }).eq('id', user.id)
    showMsg('success', 'Perfil atualizado com sucesso!')
    setLoading(false)
  }

  async function salvarEmpresa() {
    setLoading(true)
    await supabase.from('empresas').update(dadosEmpresa).eq('id', empresaId)
    showMsg('success', 'Dados da empresa atualizados!')
    setLoading(false)
  }

  async function salvarUsuario() {
    if (!formUsuario.nome || !formUsuario.email) { showMsg('error', 'Preencha nome e e-mail'); return }
    setLoading(true)
    try {
      if (editUserId) {
        // Editar usuário existente
        await supabase.from('usuarios').update({
          nome: formUsuario.nome, role: formUsuario.role, telefone: formUsuario.telefone || ''
        }).eq('id', editUserId)
        showMsg('success', 'Usuário atualizado!')
      } else {
        // Criar novo usuário via Supabase Auth
        if (!formUsuario.senha || formUsuario.senha !== formUsuario.senha2) {
          showMsg('error', 'Senhas não conferem'); setLoading(false); return
        }
        const { data, error } = await supabase.auth.admin.createUser({
          email: formUsuario.email,
          password: formUsuario.senha,
          email_confirm: true,
        })
        if (error) {
          // Fallback: registra via signUp normal
          const { data: su, error: sue } = await supabase.auth.signUp({
            email: formUsuario.email, password: formUsuario.senha
          })
          if (sue) { showMsg('error', sue.message); setLoading(false); return }
          await supabase.from('usuarios').insert({
            id: su.user.id, empresa_id: empresaId,
            nome: formUsuario.nome, email: formUsuario.email, role: formUsuario.role,
          })
        } else {
          await supabase.from('usuarios').insert({
            id: data.user.id, empresa_id: empresaId,
            nome: formUsuario.nome, email: formUsuario.email, role: formUsuario.role,
          })
        }
        showMsg('success', 'Usuário criado! Ele receberá um e-mail de confirmação.')
      }
      setModalUsuario(false)
      setFormUsuario(EMPTY_USUARIO)
      setEditUserId(null)
      loadUsuarios()
    } catch (e) {
      showMsg('error', e.message)
    }
    setLoading(false)
  }

  async function delUsuario(id) {
    if (id === user.id) { showMsg('error', 'Você não pode remover seu próprio usuário'); return }
    if (!confirm('Remover usuário da empresa?')) return
    await supabase.from('usuarios').delete().eq('id', id)
    loadUsuarios()
  }

  function abrirModalUsuario(u = null) {
    if (u) {
      setFormUsuario({ nome: u.nome || '', email: u.email || '', role: u.role || 'operador', senha: '', senha2: '', telefone: u.telefone || '' })
      setEditUserId(u.id)
    } else {
      setFormUsuario(EMPTY_USUARIO)
      setEditUserId(null)
    }
    setModalUsuario(true)
  }

  const setP = k => e => setPerfil(f => ({ ...f, [k]: e.target.value }))
  const setE = k => e => setDadosEmpresa(f => ({ ...f, [k]: e.target.value }))
  const setU = k => e => setFormUsuario(f => ({ ...f, [k]: e.target.value }))

  const ROLES = { admin: '👑 Admin', gerente: '🔧 Gerente', operador: '👤 Operador', caixa: '💰 Caixa' }
  const PLANOS = { basico: 'Básico — R$89/mês', pro: 'Pro — R$149/mês', premium: 'Premium — R$249/mês' }

  const TABS = [
    { k: 'perfil',   label: '👤 Meu Perfil' },
    { k: 'empresa',  label: '🏢 Empresa' },
    { k: 'usuarios', label: '👥 Usuários' },
  ]

  return (
    <div className="animate-fade" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>Configurações</h1>
        <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 2 }}>Gerencie seu perfil, empresa e usuários</p>
      </div>

      {msg && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem', borderRadius: 10, background: msg.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, color: msg.type === 'success' ? '#4ade80' : '#f87171', fontSize: '0.85rem' }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: '#0a0a0f', borderRadius: 12, padding: 4 }}>
        {TABS.map(({ k, label }) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '0.6rem', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === k ? '#4d55f5' : 'transparent',
            color: tab === k ? 'white' : '#6666a0',
            fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.85rem',
            transition: 'all 0.15s'
          }}>{label}</button>
        ))}
      </div>

      {/* ── TAB: MEU PERFIL ── */}
      {tab === 'perfil' && (
        <div className="card">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1a1a2e' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #4d55f5, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0
            }}>
              {(perfil.nome || user?.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '1rem' }}>{perfil.nome || 'Sem nome'}</div>
              <div style={{ color: '#6666a0', fontSize: '0.8rem', marginTop: 2 }}>{user?.email}</div>
              <span className="badge badge-blue" style={{ marginTop: 6 }}>
                {ROLES[usuarios.find(u => u.id === user?.id)?.role] || '👤 Usuário'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>NOME COMPLETO</label>
              <input className="input" value={perfil.nome} onChange={setP('nome')} placeholder="Seu nome" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>E-MAIL</label>
              <input className="input" value={perfil.email} disabled style={{ opacity: 0.5 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>TELEFONE</label>
              <input className="input" value={perfil.telefone} onChange={setP('telefone')} placeholder="(48) 99999-9999" />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={salvarPerfil} disabled={loading} style={{ minWidth: 160 }}>
              {loading ? 'Salvando...' : '💾 Salvar Perfil'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: EMPRESA ── */}
      {tab === 'empresa' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1a1a2e' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#e8e8f0' }}>{dadosEmpresa.nome}</div>
              <div style={{ fontSize: '0.75rem', color: '#6666a0', marginTop: 2 }}>Plano atual: <span style={{ color: '#818cf8', fontWeight: 600 }}>{PLANOS[dadosEmpresa.plano] || dadosEmpresa.plano}</span></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>NOME DA EMPRESA</label>
              <input className="input" value={dadosEmpresa.nome} onChange={setE('nome')} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>CNPJ</label>
              <input className="input" value={dadosEmpresa.cnpj} onChange={setE('cnpj')} placeholder="00.000.000/0001-00" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>INSCRIÇÃO MUNICIPAL</label>
              <input className="input" value={dadosEmpresa.inscricao_municipal} onChange={setE('inscricao_municipal')} placeholder="Necessário para NFS-e" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>TELEFONE</label>
              <input className="input" value={dadosEmpresa.telefone} onChange={setE('telefone')} placeholder="(48) 99999-9999" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>E-MAIL DA EMPRESA</label>
              <input className="input" type="email" value={dadosEmpresa.email} onChange={setE('email')} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>ENDEREÇO COMPLETO</label>
              <input className="input" value={dadosEmpresa.endereco} onChange={setE('endereco')} placeholder="Rua, número, bairro, cidade - UF" />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={salvarEmpresa} disabled={loading} style={{ minWidth: 160 }}>
              {loading ? 'Salvando...' : '💾 Salvar Empresa'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: USUÁRIOS ── */}
      {tab === 'usuarios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn-primary" onClick={() => abrirModalUsuario()}>+ Novo Usuário</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {usuarios.map(u => (
              <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: u.id === user?.id ? 'linear-gradient(135deg, #4d55f5, #818cf8)' : 'linear-gradient(135deg, #22223a, #2e2e4a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: 'white', fontSize: 18
                }}>
                  {(u.nome || u.email || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '0.9rem' }}>
                    {u.nome || 'Sem nome'}
                    {u.id === user?.id && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: '#818cf8' }}>(você)</span>}
                  </div>
                  <div style={{ color: '#6666a0', fontSize: '0.75rem', marginTop: 2 }}>{u.email}</div>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-blue' : u.role === 'gerente' ? 'badge-yellow' : 'badge-green'}`}>
                  {ROLES[u.role] || u.role}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-ghost" onClick={() => abrirModalUsuario(u)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>Editar</button>
                  {u.id !== user?.id && (
                    <button onClick={() => delUsuario(u.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal usuário */}
      {modalUsuario && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#111118', border: '1px solid #22223a', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 460 }}>
            <h2 style={{ fontWeight: 800, color: '#e8e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              {editUserId ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>NOME COMPLETO</label>
                <input className="input" value={formUsuario.nome} onChange={setU('nome')} placeholder="Nome do usuário" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>E-MAIL</label>
                <input className="input" type="email" value={formUsuario.email} onChange={setU('email')} disabled={!!editUserId} style={{ opacity: editUserId ? 0.5 : 1 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>PERFIL DE ACESSO</label>
                <select className="input" value={formUsuario.role} onChange={setU('role')}>
                  <option value="admin">👑 Admin — acesso total</option>
                  <option value="gerente">🔧 Gerente — sem configurações</option>
                  <option value="operador">👤 Operador — PDV e estoque</option>
                  <option value="caixa">💰 Caixa — somente PDV e caixa</option>
                </select>
              </div>
              {!editUserId && (
                <>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>SENHA</label>
                    <input className="input" type="password" value={formUsuario.senha} onChange={setU('senha')} placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>CONFIRMAR SENHA</label>
                    <input className="input" type="password" value={formUsuario.senha2} onChange={setU('senha2')} placeholder="Repita a senha" />
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
              <button className="btn-ghost" onClick={() => { setModalUsuario(false); setEditUserId(null) }} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={salvarUsuario} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Salvando...' : editUserId ? 'Salvar' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
