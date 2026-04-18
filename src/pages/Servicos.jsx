import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'

const STATUS_COLORS = {
  aberta:      'badge-blue',
  andamento:   'badge-yellow',
  concluida:   'badge-green',
  cancelada:   'badge-red',
}

const EMPTY = { cliente: '', telefone: '', equipamento: '', problema: '', tecnico: '', valor: '', prazo: '', status: 'aberta', observacoes: '' }

export default function Servicos() {
  const empresaId = useEmpresa()
  const [ordens, setOrdens] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => { if (empresaId) load() }, [empresaId])

  async function load() {
    const { data } = await supabase.from('ordens_servico').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false })
    setOrdens(data || [])
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function openModal(o = null) {
    if (o) { setForm(o); setEditId(o.id) } else { setForm(EMPTY); setEditId(null) }
    setModal(true)
  }

  async function save() {
    setLoading(true)
    const data = { ...form, valor: +form.valor, empresa_id: empresaId }
    if (editId) await supabase.from('ordens_servico').update(data).eq('id', editId)
    else await supabase.from('ordens_servico').insert(data)
    await load(); setModal(false); setLoading(false)
  }

  async function del(id) {
    if (!confirm('Excluir OS?')) return
    await supabase.from('ordens_servico').delete().eq('id', id)
    load()
  }

  const filtradas = filtro === 'todos' ? ordens : ordens.filter(o => o.status === filtro)
  const fmt = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>Serviços / OS</h1>
          <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 2 }}>{ordens.length} ordens de serviço</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>+ Nova OS</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        {[['todos', 'Todas'], ['aberta', 'Abertas'], ['andamento', 'Em Andamento'], ['concluida', 'Concluídas'], ['cancelada', 'Canceladas']].map(([k, l]) => (
          <button key={k} onClick={() => setFiltro(k)} style={{
            padding: '0.4rem 1rem', borderRadius: 999, border: '1px solid',
            borderColor: filtro === k ? '#4d55f5' : '#22223a',
            background: filtro === k ? 'rgba(77,85,245,0.15)' : 'transparent',
            color: filtro === k ? '#818cf8' : '#6666a0',
            cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '0.8rem', fontWeight: 600
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filtradas.map(o => (
          <div key={o.id} className="card" style={{ cursor: 'pointer' }} onClick={() => openModal(o)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '0.9rem' }}>{o.cliente}</div>
                <div style={{ color: '#6666a0', fontSize: '0.75rem', marginTop: 2 }}>{o.telefone}</div>
              </div>
              <span className={`badge ${STATUS_COLORS[o.status] || 'badge-blue'}`}>{o.status}</span>
            </div>
            <div style={{ background: '#0a0a0f', borderRadius: 8, padding: '0.75rem', marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6666a0', fontWeight: 600, marginBottom: 4 }}>EQUIPAMENTO</div>
              <div style={{ fontSize: '0.85rem', color: '#c8c8e0' }}>{o.equipamento}</div>
              <div style={{ fontSize: '0.8rem', color: '#9898b8', marginTop: 4 }}>{o.problema}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6666a0' }}>
                {o.tecnico && `Técnico: ${o.tecnico}`}
                {o.prazo && ` · Prazo: ${o.prazo}`}
              </div>
              <div style={{ fontWeight: 800, color: '#4ade80', fontSize: '0.95rem' }}>{fmt(o.valor)}</div>
            </div>
          </div>
        ))}
        {filtradas.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#4a4a6a', padding: '3rem' }}>Nenhuma OS encontrada</div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#111118', border: '1px solid #22223a', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, color: '#e8e8f0', fontSize: '1.1rem' }}>{editId ? 'Editar OS' : 'Nova Ordem de Serviço'}</h2>
              {editId && <button onClick={() => del(editId)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>Excluir OS</button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {[
                { k: 'cliente',     label: 'Cliente',       span: 2 },
                { k: 'telefone',    label: 'Telefone' },
                { k: 'equipamento', label: 'Equipamento' },
                { k: 'problema',    label: 'Problema / Defeito', span: 2 },
                { k: 'tecnico',     label: 'Técnico Responsável' },
                { k: 'valor',       label: 'Valor (R$)', type: 'number' },
                { k: 'prazo',       label: 'Prazo Entrega', type: 'date' },
              ].map(({ k, label, span, type }) => (
                <div key={k} style={{ gridColumn: span === 2 ? '1/-1' : 'auto' }}>
                  <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>{label.toUpperCase()}</label>
                  <input className="input" type={type || 'text'} value={form[k]} onChange={set(k)} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>STATUS</label>
                <select className="input" value={form.status} onChange={set('status')}>
                  <option value="aberta">Aberta</option>
                  <option value="andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, display: 'block', marginBottom: 5 }}>OBSERVAÇÕES</label>
                <textarea className="input" rows={3} value={form.observacoes} onChange={set('observacoes')} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
              <button className="btn-ghost" onClick={() => setModal(false)} style={{ flex: 1 }}>Cancelar</button>
              <button className="btn-primary" onClick={save} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Salvando...' : 'Salvar OS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
