import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'
import { useAuth } from '../context/AuthContext'

const EMPTY = { assunto: '', mensagem: '', prioridade: 'normal' }

export default function Suporte() {
  const { user } = useAuth()
  const empresaId = useEmpresa()
  const [tickets, setTickets] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => { if (empresaId) load() }, [empresaId])

  async function load() {
    const { data } = await supabase.from('suporte_tickets').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setTickets(data || [])
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function enviar() {
    setLoading(true)
    await supabase.from('suporte_tickets').insert({
      empresa_id: empresaId, usuario_email: user?.email, ...form, status: 'aberto'
    })
    setForm(EMPTY); setModal(false); setSucesso(true)
    setTimeout(() => setSucesso(false), 4000)
    load(); setLoading(false)
  }

  const STATUS = { aberto: 'badge-blue', respondido: 'badge-yellow', resolvido: 'badge-green', fechado: 'badge-red' }
  const PRIOR  = { urgente: 'badge-red', alta: 'badge-yellow', normal: 'badge-blue', baixa: 'badge-green' }

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>Suporte</h1>
          <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 2 }}>Central de atendimento</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setModal(true) }}>+ Abrir Chamado</button>
      </div>

      {sucesso && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem', borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '0.85rem' }}>
          ✅ Chamado enviado com sucesso! Nossa equipe responderá em breve.
        </div>
      )}

      {/* Cards de contato */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>

        {/* WhatsApp */}
        <a href="https://wa.me/5548991921089" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>💬</div>
            <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '0.9rem', marginBottom: 4 }}>WhatsApp</div>
            <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>(48) 99192-1089</div>
            <div style={{ fontSize: '0.7rem', color: '#6666a0', marginTop: 2 }}>Suporte rápido</div>
          </div>
        </a>

        {/* Instagram */}
        <a href="https://instagram.com/tecchti" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 14, opacity: 0.08,
              background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
            }} />
            <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>📸</div>
            <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '0.9rem', marginBottom: 4 }}>Instagram</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              @tecchti
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6666a0', marginTop: 2 }}>Novidades e atualizações</div>
          </div>
        </a>

        {/* E-mail */}
        <a href="mailto:suporte@tecchti.com.br" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>📧</div>
            <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '0.9rem', marginBottom: 4 }}>E-mail</div>
            <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600 }}>suporte@tecchti.com.br</div>
            <div style={{ fontSize: '0.7rem', color: '#6666a0', marginTop: 2 }}>Resposta em até 24h</div>
          </div>
        </a>

        {/* Documentação */}
        <a href="#" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>📖</div>
            <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '0.9rem', marginBottom: 4 }}>Documentação</div>
            <div style={{ fontSize: '0.7rem', color: '#6666a0' }}>Tutoriais e guias</div>
            <div style={{ fontSize: '0.7rem', color: '#6666a0', marginTop: 2 }}>de uso do sistema</div>
          </div>
        </a>

      </div>

      {/* Desenvolvido por TecchTI */}
      <div style={{
        marginBottom: '1.5rem', padding: '1rem 1.25rem', borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(77,85,245,0.08), rgba(129,140,248,0.05))',
        border: '1px solid rgba(77,85,245,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #4d55f5, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: 'white', fontSize: 16
          }}>T</div>
          <div>
            <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '0.9rem' }}>TecchTI Soluções de Informática</div>
            <div style={{ fontSize: '0.75rem', color: '#6666a0', marginTop: 2 }}>Desenvolvedor oficial do GestãoPro</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="https://wa.me/5548991921089" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>💬 WhatsApp</button>
          </a>
          <a href="https://instagram.com/tecchti" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>📸 @tecchti</button>
          </a>
        </div>
      </div>

      {/* Tickets */}
      <h2 style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '1rem', marginBottom: '1rem' }}>Meus Chamados</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a2e' }}>
              {['Data', 'Assunto', 'Prioridade', 'Status'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #0d0d16' }}>
                <td style={{ padding: '0.875rem 1.25rem', color: '#6666a0', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  {new Date(t.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#e8e8f0', fontSize: '0.85rem' }}>
                  <div>{t.assunto}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6666a0', marginTop: 2, fontWeight: 400 }}>{t.mensagem?.slice(0, 60)}...</div>
                </td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span className={`badge ${PRIOR[t.prioridade] || 'badge-blue'}`}>{t.prioridade}</span>
                </td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span className={`badge ${STATUS[t.status] || 'badge-blue'}`}>{t.status}</span>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#4a4a6a' }}>Nenhum chamado aberto</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#111118', border: '1px solid #22223a', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 480 }}>
            <h2 style={{ fontWeight: 800, color: '#e8e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Abrir Chamado</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>ASSUNTO</label>
                <input className="input" placeholder="Descreva o problema brevemente" value={form.assunto} onChange={set('assunto')} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>PRIORIDADE</label>
                <select className="input" value={form.prioridade} onChange={set('prioridade')}>
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>MENSAGEM</label>
                <textarea className="input" rows={5} placeholder="Detalhe o problema, incluindo passos para reproduzir..." value={form.mensagem} onChange={set('mensagem')} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
              <button className="btn-ghost" onClick={() => setModal(false)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={enviar} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Enviando...' : '📨 Enviar Chamado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
