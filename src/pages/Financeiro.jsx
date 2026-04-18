import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'

const EMPTY = { tipo: 'receita', descricao: '', valor: '', vencimento: '', status: 'pendente', categoria: '' }

export default function Financeiro() {
  const empresaId = useEmpresa()
  const [lancamentos, setLancamentos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => { if (empresaId) load() }, [empresaId])

  async function load() {
    const { data } = await supabase.from('financeiro').select('*').eq('empresa_id', empresaId).order('vencimento')
    setLancamentos(data || [])
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function save() {
    setLoading(true)
    const data = { ...form, valor: +form.valor, empresa_id: empresaId }
    if (editId) await supabase.from('financeiro').update(data).eq('id', editId)
    else await supabase.from('financeiro').insert(data)
    await load(); setModal(false); setLoading(false)
  }

  async function toggleStatus(item) {
    const novoStatus = item.status === 'pago' ? 'pendente' : 'pago'
    await supabase.from('financeiro').update({ status: novoStatus }).eq('id', item.id)
    load()
  }

  async function del(id) {
    if (!confirm('Excluir lançamento?')) return
    await supabase.from('financeiro').delete().eq('id', id)
    load()
  }

  const filtrados = filtro === 'todos' ? lancamentos : lancamentos.filter(l => l.tipo === filtro)
  const receitas = lancamentos.filter(l => l.tipo === 'receita' && l.status === 'pago').reduce((a, l) => a + l.valor, 0)
  const despesas = lancamentos.filter(l => l.tipo === 'despesa' && l.status === 'pago').reduce((a, l) => a + l.valor, 0)
  const apagar   = lancamentos.filter(l => l.status === 'pendente').reduce((a, l) => a + l.valor, 0)
  const fmt = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>Financeiro</h1>
          <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 2 }}>Contas a pagar e receber</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setModal(true) }}>+ Lançamento</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Receitas Recebidas', value: fmt(receitas), color: '#4ade80' },
          { label: 'Despesas Pagas',     value: fmt(despesas), color: '#f87171' },
          { label: 'A Pagar / Receber',  value: fmt(apagar),   color: '#facc15' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <p style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        {[['todos', 'Todos'], ['receita', 'Receitas'], ['despesa', 'Despesas']].map(([k, l]) => (
          <button key={k} onClick={() => setFiltro(k)} style={{
            padding: '0.4rem 1rem', borderRadius: 999, border: '1px solid',
            borderColor: filtro === k ? '#4d55f5' : '#22223a',
            background: filtro === k ? 'rgba(77,85,245,0.15)' : 'transparent',
            color: filtro === k ? '#818cf8' : '#6666a0',
            cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '0.8rem', fontWeight: 600
          }}>{l}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a2e' }}>
              {['Tipo', 'Descrição', 'Categoria', 'Vencimento', 'Valor', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #0d0d16' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0d0d16'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span className={`badge ${l.tipo === 'receita' ? 'badge-green' : 'badge-red'}`}>{l.tipo === 'receita' ? '↑ Receita' : '↓ Despesa'}</span>
                </td>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#e8e8f0', fontSize: '0.85rem' }}>{l.descricao}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#6666a0', fontSize: '0.8rem' }}>{l.categoria || '—'}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#9898b8', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>{l.vencimento || '—'}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, fontSize: '0.9rem', color: l.tipo === 'receita' ? '#4ade80' : '#f87171' }}>{fmt(l.valor)}</td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <button onClick={() => toggleStatus(l)} style={{
                    background: 'none', border: '1px solid', borderRadius: 999,
                    borderColor: l.status === 'pago' ? '#4ade80' : '#facc15',
                    color: l.status === 'pago' ? '#4ade80' : '#facc15',
                    cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '0.7rem', fontWeight: 600,
                    padding: '0.2rem 0.7rem'
                  }}>{l.status === 'pago' ? '✓ Pago' : '○ Pendente'}</button>
                </td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <button onClick={() => del(l.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>✕</button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#4a4a6a' }}>Nenhum lançamento</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111118', border: '1px solid #22223a', borderRadius: 18, padding: '2rem', width: 440 }}>
            <h2 style={{ fontWeight: 800, color: '#e8e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Novo Lançamento</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
              {['receita', 'despesa'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))} style={{
                  flex: 1, padding: '0.5rem', borderRadius: 8, border: '1px solid',
                  borderColor: form.tipo === t ? (t === 'receita' ? '#4ade80' : '#f87171') : '#22223a',
                  background: form.tipo === t ? (t === 'receita' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)') : 'transparent',
                  color: form.tipo === t ? (t === 'receita' ? '#4ade80' : '#f87171') : '#6666a0',
                  cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.85rem'
                }}>{t === 'receita' ? '↑ Receita' : '↓ Despesa'}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { k: 'descricao',  label: 'Descrição' },
                { k: 'categoria',  label: 'Categoria' },
                { k: 'valor',      label: 'Valor (R$)', type: 'number' },
                { k: 'vencimento', label: 'Vencimento', type: 'date' },
              ].map(({ k, label, type }) => (
                <div key={k}>
                  <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>{label.toUpperCase()}</label>
                  <input className="input" type={type || 'text'} value={form[k]} onChange={set(k)} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>STATUS</label>
                <select className="input" value={form.status} onChange={set('status')}>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
              <button className="btn-ghost" onClick={() => setModal(false)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={save} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
