import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'

const EMPTY = { nome: '', codigo: '', categoria: '', preco: '', custo: '', estoque: '', estoque_minimo: '' }

export default function Estoque() {
  const empresaId = useEmpresa()
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (empresaId) load() }, [empresaId])

  async function load() {
    const { data } = await supabase.from('produtos').select('*').eq('empresa_id', empresaId).order('nome')
    setProdutos(data || [])
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function openModal(p = null) {
    if (p) { setForm(p); setEditId(p.id) } else { setForm(EMPTY); setEditId(null) }
    setModal(true)
  }

  async function save() {
    setLoading(true)
    const data = { ...form, preco: +form.preco, custo: +form.custo, estoque: +form.estoque, estoque_minimo: +form.estoque_minimo, empresa_id: empresaId }
    if (editId) await supabase.from('produtos').update(data).eq('id', editId)
    else await supabase.from('produtos').insert(data)
    await load(); setModal(false); setLoading(false)
  }

  async function del(id) {
    if (!confirm('Excluir produto?')) return
    await supabase.from('produtos').delete().eq('id', id)
    load()
  }

  const filtrados = produtos.filter(p => p.nome?.toLowerCase().includes(busca.toLowerCase()) || p.codigo?.includes(busca))
  const fmt = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>Estoque</h1>
          <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 2 }}>{produtos.length} produtos cadastrados</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>+ Novo Produto</button>
      </div>

      <input className="input" placeholder="🔍  Buscar produto..." value={busca}
        onChange={e => setBusca(e.target.value)} style={{ marginBottom: '1rem', maxWidth: 360 }} />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a2e' }}>
              {['Produto', 'Código', 'Categoria', 'Custo', 'Preço', 'Estoque', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #0d0d16' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0d0d16'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#e8e8f0', fontSize: '0.85rem' }}>{p.nome}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#6666a0', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>{p.codigo || '—'}</td>
                <td style={{ padding: '0.875rem 1.25rem', color: '#6666a0', fontSize: '0.8rem' }}>{p.categoria || '—'}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: '#9898b8' }}>{fmt(p.custo)}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, color: '#818cf8' }}>{fmt(p.preco)}</td>
                <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#e8e8f0' }}>{p.estoque ?? 0}</td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <span className={`badge ${(p.estoque ?? 0) <= 0 ? 'badge-red' : (p.estoque ?? 0) <= (p.estoque_minimo || 5) ? 'badge-yellow' : 'badge-green'}`}>
                    {(p.estoque ?? 0) <= 0 ? 'Sem estoque' : (p.estoque ?? 0) <= (p.estoque_minimo || 5) ? 'Baixo' : 'OK'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" onClick={() => openModal(p)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>Editar</button>
                    <button onClick={() => del(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#4a4a6a' }}>Nenhum produto encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111118', border: '1px solid #22223a', borderRadius: 18, padding: '2rem', width: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 800, color: '#e8e8f0', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              {editId ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {[
                { k: 'nome',           label: 'Nome',           span: 2 },
                { k: 'codigo',         label: 'Código / SKU' },
                { k: 'categoria',      label: 'Categoria' },
                { k: 'preco',          label: 'Preço de Venda',  type: 'number' },
                { k: 'custo',          label: 'Custo',           type: 'number' },
                { k: 'estoque',        label: 'Estoque Atual',   type: 'number' },
                { k: 'estoque_minimo', label: 'Estoque Mínimo',  type: 'number' },
              ].map(({ k, label, span, type }) => (
                <div key={k} style={{ gridColumn: span === 2 ? '1/-1' : 'auto' }}>
                  <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>{label.toUpperCase()}</label>
                  <input className="input" type={type || 'text'} value={form[k]} onChange={set(k)} />
                </div>
              ))}
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
