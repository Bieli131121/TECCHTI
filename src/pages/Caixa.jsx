import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'

export default function Caixa() {
  const empresaId = useEmpresa()
  const [caixa, setCaixa] = useState(null)
  const [movimentos, setMovimentos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ tipo: 'entrada', descricao: '', valor: '' })
  const [saldoInicial, setSaldoInicial] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (empresaId) load() }, [empresaId])

  async function load() {
    const hoje = new Date().toISOString().split('T')[0]
    const { data: cx } = await supabase.from('caixa').select('*').eq('empresa_id', empresaId).eq('data', hoje).single()
    setCaixa(cx || null)
    if (cx) {
      const { data: mv } = await supabase.from('caixa_movimentos').select('*').eq('caixa_id', cx.id).order('created_at')
      setMovimentos(mv || [])
    }
  }

  async function abrirCaixa() {
    setLoading(true)
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('caixa').insert({ empresa_id: empresaId, data: hoje, saldo_inicial: +saldoInicial, status: 'aberto' }).select().single()
    setCaixa(data)
    setLoading(false)
  }

  async function fecharCaixa() {
    if (!confirm('Fechar o caixa do dia?')) return
    const total = saldoAtual()
    await supabase.from('caixa').update({ status: 'fechado', saldo_final: total }).eq('id', caixa.id)
    load()
  }

  async function addMovimento() {
    setLoading(true)
    await supabase.from('caixa_movimentos').insert({ caixa_id: caixa.id, empresa_id: empresaId, tipo: form.tipo, descricao: form.descricao, valor: +form.valor })
    setForm({ tipo: 'entrada', descricao: '', valor: '' })
    setModal(false)
    await load()
    setLoading(false)
  }

  function saldoAtual() {
    const base = caixa?.saldo_inicial || 0
    return movimentos.reduce((acc, m) => m.tipo === 'entrada' ? acc + m.valor : acc - m.valor, base)
  }

  const fmt = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  if (!caixa || caixa.status === 'fechado') {
    return (
      <div className="animate-fade" style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', marginBottom: 8 }}>
          {caixa?.status === 'fechado' ? 'Caixa Fechado' : 'Caixa não aberto hoje'}
        </h1>
        <p style={{ color: '#6666a0', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {caixa?.status === 'fechado' ? `Saldo final: ${fmt(caixa.saldo_final)}` : 'Informe o saldo inicial para abrir o caixa.'}
        </p>
        {caixa?.status !== 'fechado' && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
            <input className="input" type="number" placeholder="Saldo inicial (R$)" value={saldoInicial}
              onChange={e => setSaldoInicial(e.target.value)} style={{ maxWidth: 200 }} />
            <button className="btn-primary" onClick={abrirCaixa} disabled={loading}>Abrir Caixa</button>
          </div>
        )}
      </div>
    )
  }

  const entradas = movimentos.filter(m => m.tipo === 'entrada').reduce((a, m) => a + m.valor, 0)
  const saidas   = movimentos.filter(m => m.tipo === 'saida').reduce((a, m) => a + m.valor, 0)

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>Caixa</h1>
            <span className="badge badge-green">Aberto</span>
          </div>
          <p style={{ color: '#6666a0', fontSize: '0.85rem' }}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={() => setModal(true)}>+ Movimento</button>
          <button className="btn-ghost" onClick={fecharCaixa}>Fechar Caixa</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Saldo Inicial', value: fmt(caixa.saldo_inicial), color: '#9898b8' },
          { label: 'Entradas',      value: fmt(entradas),            color: '#4ade80' },
          { label: 'Saídas',        value: fmt(saidas),              color: '#f87171' },
          { label: 'Saldo Atual',   value: fmt(saldoAtual()),        color: '#818cf8' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <p style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a2e' }}>
              {['Horário', 'Tipo', 'Descrição', 'Valor'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimentos.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #0d0d16' }}>
                <td style={{ padding: '0.875rem 1.25rem', color: '#6666a0', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span className={`badge ${m.tipo === 'entrada' ? 'badge-green' : 'badge-red'}`}>{m.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span>
                </td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#e8e8f0', fontSize: '0.85rem' }}>{m.descricao}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, fontSize: '0.9rem', color: m.tipo === 'entrada' ? '#4ade80' : '#f87171' }}>
                  {m.tipo === 'entrada' ? '+' : '-'}{fmt(m.valor)}
                </td>
              </tr>
            ))}
            {movimentos.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#4a4a6a' }}>Nenhum movimento registrado hoje</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111118', border: '1px solid #22223a', borderRadius: 18, padding: '2rem', width: 400 }}>
            <h2 style={{ fontWeight: 800, color: '#e8e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Novo Movimento</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
              {['entrada', 'saida'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))} style={{
                  flex: 1, padding: '0.5rem', borderRadius: 8, border: '1px solid',
                  borderColor: form.tipo === t ? (t === 'entrada' ? '#4ade80' : '#f87171') : '#22223a',
                  background: form.tipo === t ? (t === 'entrada' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : 'transparent',
                  color: form.tipo === t ? (t === 'entrada' ? '#4ade80' : '#f87171') : '#6666a0',
                  cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.85rem'
                }}>{t === 'entrada' ? '↑ Entrada' : '↓ Saída'}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>DESCRIÇÃO</label>
                <input className="input" value={form.descricao} onChange={set('descricao')} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>VALOR (R$)</label>
                <input className="input" type="number" value={form.valor} onChange={set('valor')} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
              <button className="btn-ghost" onClick={() => setModal(false)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={addMovimento} disabled={loading} style={{ flex: 1 }}>Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
