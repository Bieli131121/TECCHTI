import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'

export default function PDV() {
  const empresaId = useEmpresa()
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState([])
  const [desconto, setDesconto] = useState(0)
  const [pagamento, setPagamento] = useState('dinheiro')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!empresaId) return
    supabase.from('produtos').select('*').eq('empresa_id', empresaId).then(({ data }) => {
      setProdutos(data || [])
    })
  }, [empresaId])

  const filtrados = produtos.filter(p =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) || p.codigo?.includes(busca)
  )

  function addCarrinho(produto) {
    setCarrinho(c => {
      const exist = c.find(i => i.id === produto.id)
      if (exist) return c.map(i => i.id === produto.id ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { ...produto, qty: 1 }]
    })
  }

  function removeItem(id) { setCarrinho(c => c.filter(i => i.id !== id)) }
  function setQty(id, qty) {
    if (qty <= 0) return removeItem(id)
    setCarrinho(c => c.map(i => i.id === id ? { ...i, qty } : i))
  }

  const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qty), 0)
  const total = Math.max(0, subtotal - desconto)

  async function finalizarVenda() {
    if (carrinho.length === 0) return
    const venda = {
      empresa_id: empresaId,
      itens: carrinho,
      subtotal,
      desconto,
      total,
      pagamento,
    }
    await supabase.from('vendas').insert(venda)
    setSucesso(true)
    setCarrinho([])
    setDesconto(0)
    setTimeout(() => setSucesso(false), 3000)
  }

  const fmt = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="animate-fade" style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 4rem)' }}>
      {/* Produtos */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>PDV</h1>
          <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 2 }}>Ponto de Venda</p>
        </div>
        <input className="input" placeholder="🔍  Buscar produto ou código..." value={busca}
          onChange={e => setBusca(e.target.value)} style={{ marginBottom: '1rem' }} />
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', alignContent: 'start' }}>
          {filtrados.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#4a4a6a', paddingTop: '3rem' }}>
              {produtos.length === 0 ? 'Nenhum produto cadastrado. Vá em Estoque para adicionar.' : 'Nenhum resultado.'}
            </div>
          )}
          {filtrados.map(p => (
            <button key={p.id} onClick={() => addCarrinho(p)} style={{
              background: '#111118', border: '1px solid #22223a', borderRadius: 12,
              padding: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              fontFamily: 'Sora, sans-serif'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4d55f5'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#22223a'}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📦</div>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#e8e8f0', marginBottom: 4 }}>{p.nome}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#818cf8' }}>{fmt(p.preco)}</div>
              <div style={{ fontSize: '0.7rem', color: p.estoque > 0 ? '#4ade80' : '#f87171', marginTop: 4 }}>
                Estoque: {p.estoque ?? 0}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Carrinho */}
      <div style={{
        width: 340, background: '#111118', border: '1px solid #22223a', borderRadius: 16,
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1a1a2e' }}>
          <h2 style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '1rem' }}>Carrinho</h2>
        </div>

        {sucesso && (
          <div style={{ margin: '1rem', padding: '0.75rem', borderRadius: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '0.85rem', textAlign: 'center' }}>
            ✅ Venda finalizada com sucesso!
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
          {carrinho.length === 0 && (
            <div style={{ textAlign: 'center', color: '#4a4a6a', paddingTop: '2rem', fontSize: '0.85rem' }}>
              Adicione produtos ao carrinho
            </div>
          )}
          {carrinho.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem', padding: '0.75rem', background: '#0a0a0f', borderRadius: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e8e8f0' }}>{item.nome}</div>
                <div style={{ fontSize: '0.75rem', color: '#6666a0' }}>{fmt(item.preco)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => setQty(item.id, item.qty - 1)} style={{ width: 24, height: 24, borderRadius: 6, background: '#1a1a26', border: '1px solid #22223a', color: '#e8e8f0', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>−</button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8e8f0', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => setQty(item.id, item.qty + 1)} style={{ width: 24, height: 24, borderRadius: 6, background: '#1a1a26', border: '1px solid #22223a', color: '#e8e8f0', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>+</button>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', minWidth: 70, textAlign: 'right' }}>{fmt(item.preco * item.qty)}</div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1a1a2e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', color: '#6666a0' }}>
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#6666a0' }}>Desconto</span>
            <input type="number" className="input" value={desconto} min={0} max={subtotal}
              onChange={e => setDesconto(Number(e.target.value))}
              style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.8rem' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 800, color: '#e8e8f0' }}>
            <span>Total</span><span style={{ color: '#4ade80' }}>{fmt(total)}</span>
          </div>

          <select className="input" value={pagamento} onChange={e => setPagamento(e.target.value)} style={{ marginBottom: 12 }}>
            <option value="dinheiro">💵 Dinheiro</option>
            <option value="cartao_credito">💳 Cartão de Crédito</option>
            <option value="cartao_debito">💳 Cartão de Débito</option>
            <option value="pix">⚡ PIX</option>
          </select>

          <button className="btn-primary" onClick={finalizarVenda} style={{ width: '100%', padding: '0.75rem' }}>
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  )
}
