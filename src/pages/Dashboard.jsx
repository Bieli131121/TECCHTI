import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useEmpresa } from '../hooks/useEmpresa'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const MOCK_CHART = [
  { mes: 'Jan', receita: 12400, despesa: 8200 },
  { mes: 'Fev', receita: 15800, despesa: 9100 },
  { mes: 'Mar', receita: 13200, despesa: 7800 },
  { mes: 'Abr', receita: 18600, despesa: 10200 },
  { mes: 'Mai', receita: 21000, despesa: 11500 },
  { mes: 'Jun', receita: 19400, despesa: 10800 },
]

function KPI({ label, value, sub, color }) {
  return (
    <div className="card animate-fade" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}20, transparent)`,
        borderRadius: '0 14px 0 80px'
      }} />
      <p style={{ fontSize: '0.7rem', color: '#6666a0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: '1.7rem', fontWeight: 800, color: '#e8e8f0', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '0.75rem', color: '#4a4a6a', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const empresaId = useEmpresa()
  const [kpis, setKpis] = useState({ receita: 0, despesa: 0, lucro: 0, vendas: 0 })

  useEffect(() => {
    if (!empresaId) return
    // Aqui você buscaria dados reais do Supabase
    setKpis({ receita: 21000, despesa: 11500, lucro: 9500, vendas: 148 })
  }, [empresaId])

  const fmt = (v) => 'R$ ' + v.toLocaleString('pt-BR')

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#e8e8f0' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6666a0', fontSize: '0.85rem', marginTop: 4 }}>
          Visão geral do seu negócio
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <KPI label="Receita (mês)" value={fmt(kpis.receita)} sub="↑ 14% vs mês anterior" color="#4d55f5" />
        <KPI label="Despesas"      value={fmt(kpis.despesa)} sub="↓ 3% vs mês anterior"  color="#f87171" />
        <KPI label="Lucro Líquido" value={fmt(kpis.lucro)}   sub="Margem: 45.2%"         color="#4ade80" />
        <KPI label="Vendas"        value={kpis.vendas}        sub="Ticket médio R$ 141,89" color="#facc15" />
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#e8e8f0' }}>Receita × Despesas</h2>
            <p style={{ fontSize: '0.75rem', color: '#6666a0', marginTop: 2 }}>Últimos 6 meses</p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem' }}>
            <span style={{ color: '#818cf8' }}>● Receita</span>
            <span style={{ color: '#f87171' }}>● Despesas</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={MOCK_CHART}>
            <defs>
              <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4d55f5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4d55f5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gDesp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f87171" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fill: '#6666a0', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6666a0', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={v => 'R$' + (v/1000).toFixed(0) + 'k'} />
            <Tooltip
              contentStyle={{ background: '#111118', border: '1px solid #22223a', borderRadius: 8 }}
              labelStyle={{ color: '#e8e8f0' }} itemStyle={{ color: '#e8e8f0' }}
              formatter={v => 'R$ ' + v.toLocaleString('pt-BR')} />
            <Area type="monotone" dataKey="receita" stroke="#4d55f5" strokeWidth={2} fill="url(#gRec)" />
            <Area type="monotone" dataKey="despesa" stroke="#f87171" strokeWidth={2} fill="url(#gDesp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { icon: '🖥', label: 'Nova Venda', desc: 'Abrir PDV', href: '/pdv' },
          { icon: '📦', label: 'Estoque',    desc: 'Ver produtos', href: '/estoque' },
          { icon: '🔧', label: 'Nova OS',    desc: 'Ordem de serviço', href: '/servicos' },
          { icon: '🧾', label: 'Emitir NF',  desc: 'Nota fiscal', href: '/nota-fiscal' },
        ].map(({ icon, label, desc, href }) => (
          <a key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e8e8f0' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: '#6666a0', marginTop: 2 }}>{desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
