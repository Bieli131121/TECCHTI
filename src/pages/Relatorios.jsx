import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const CORES = ['#4d55f5', '#4ade80', '#f87171', '#facc15', '#818cf8', '#34d399']

export default function Relatorios() {
  const empresaId = useEmpresa()
  const [periodo, setPeriodo] = useState('mes')
  const [dados, setDados] = useState({ vendas: [], financeiro: [], produtos: [], os: [] })

  useEffect(() => { if (empresaId) load() }, [empresaId, periodo])

  async function load() {
    const dias = periodo === 'semana' ? 7 : periodo === 'mes' ? 30 : 365
    const desde = new Date(Date.now() - dias * 86400000).toISOString()

    const [{ data: vendas }, { data: financeiro }, { data: produtos }, { data: os }] = await Promise.all([
      supabase.from('vendas').select('*').eq('empresa_id', empresaId).gte('created_at', desde),
      supabase.from('financeiro').select('*').eq('empresa_id', empresaId).gte('created_at', desde),
      supabase.from('produtos').select('nome, estoque, preco').eq('empresa_id', empresaId).order('estoque').limit(8),
      supabase.from('ordens_servico').select('status').eq('empresa_id', empresaId).gte('created_at', desde),
    ])

    // Vendas por dia
    const vendasPorDia = {}
    ;(vendas || []).forEach(v => {
      const dia = new Date(v.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      vendasPorDia[dia] = (vendasPorDia[dia] || 0) + (v.total || 0)
    })
    const vendasChart = Object.entries(vendasPorDia).slice(-14).map(([dia, total]) => ({ dia, total }))

    // Financeiro receita x despesa
    const receitaTotal  = (financeiro || []).filter(f => f.tipo === 'receita' && f.status === 'pago').reduce((a, f) => a + f.valor, 0)
    const despesaTotal  = (financeiro || []).filter(f => f.tipo === 'despesa' && f.status === 'pago').reduce((a, f) => a + f.valor, 0)
    const finChart = [{ name: 'Receitas', value: receitaTotal }, { name: 'Despesas', value: despesaTotal }]

    // OS por status
    const osPorStatus = {}
    ;(os || []).forEach(o => { osPorStatus[o.status] = (osPorStatus[o.status] || 0) + 1 })
    const osChart = Object.entries(osPorStatus).map(([name, value]) => ({ name, value }))

    setDados({ vendas: vendasChart, financeiro: finChart, produtos: produtos || [], os: osChart })
  }

  const fmt = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  const tooltipStyle = {
    contentStyle: { background: '#111118', border: '1px solid #22223a', borderRadius: 8 },
    labelStyle: { color: '#e8e8f0' }, itemStyle: { color: '#e8e8f0' }
  }

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em' }}>Relatórios</h1>
          <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 2 }}>Análise do seu negócio</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['semana', '7 dias'], ['mes', '30 dias'], ['ano', '12 meses']].map(([k, l]) => (
            <button key={k} onClick={() => setPeriodo(k)} style={{
              padding: '0.4rem 1rem', borderRadius: 999, border: '1px solid',
              borderColor: periodo === k ? '#4d55f5' : '#22223a',
              background: periodo === k ? 'rgba(77,85,245,0.15)' : 'transparent',
              color: periodo === k ? '#818cf8' : '#6666a0',
              cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '0.8rem', fontWeight: 600
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Vendas por dia */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e8e8f0', marginBottom: '1.25rem' }}>Faturamento por Dia</h2>
          {dados.vendas.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#4a4a6a', padding: '2rem', fontSize: '0.85rem' }}>Sem vendas no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dados.vendas}>
                <XAxis dataKey="dia" tick={{ fill: '#6666a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6666a0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => 'R$' + (v/1000).toFixed(1) + 'k'} />
                <Tooltip {...tooltipStyle} formatter={v => fmt(v)} />
                <Bar dataKey="total" fill="#4d55f5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Receita x Despesa */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e8e8f0', marginBottom: '1.25rem' }}>Receitas × Despesas</h2>
          {dados.financeiro.every(f => f.value === 0) ? (
            <div style={{ textAlign: 'center', color: '#4a4a6a', padding: '2rem', fontSize: '0.85rem' }}>Sem lançamentos pagos no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dados.financeiro} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" nameKey="name">
                  {dados.financeiro.map((_, i) => <Cell key={i} fill={i === 0 ? '#4ade80' : '#f87171'} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={v => fmt(v)} />
                <Legend formatter={v => <span style={{ color: '#9898b8', fontSize: '0.8rem' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Estoque crítico */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e8e8f0', marginBottom: '1.25rem' }}>Estoque de Produtos</h2>
          {dados.produtos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#4a4a6a', padding: '2rem', fontSize: '0.85rem' }}>Nenhum produto cadastrado</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dados.produtos} layout="vertical">
                <XAxis type="number" tick={{ fill: '#6666a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fill: '#9898b8', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="estoque" radius={[0,4,4,0]}>
                  {dados.produtos.map((p, i) => <Cell key={i} fill={p.estoque <= 5 ? '#f87171' : '#4d55f5'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* OS por status */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e8e8f0', marginBottom: '1.25rem' }}>Ordens de Serviço por Status</h2>
          {dados.os.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#4a4a6a', padding: '2rem', fontSize: '0.85rem' }}>Sem OS no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dados.os} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                  {dados.os.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
