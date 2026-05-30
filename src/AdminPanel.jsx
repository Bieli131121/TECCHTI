import { useState } from 'react'

const STORAGE_KEY = 'tecchti_visits'
const ADMIN_PWD_KEY = 'tecchti_admin_pwd'
const DEFAULT_PWD = 'tecchti2025'

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (_) {}
}

function getAdminPwd() {
  try { return localStorage.getItem(ADMIN_PWD_KEY) || DEFAULT_PWD } catch { return DEFAULT_PWD }
}

function fmtDateShort(iso) {
  try {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })
  } catch { return iso }
}

/* ── Bar Chart SVG ── */
function BarChart({ days, dayData }) {
  const W = 560, H = 160
  const PAD = { t: 10, r: 10, b: 36, l: 36 }
  const chartW = W - PAD.l - PAD.r
  const chartH = H - PAD.t - PAD.b
  const barW = Math.floor(chartW / days.length)
  const maxVal = Math.max(...days.map(d => (dayData[d]?.visits || 0)), 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, 0.5, 1].map((r, i) => {
        const y = PAD.t + chartH * (1 - r)
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={PAD.l + chartW} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(maxVal * r)}</text>
          </g>
        )
      })}
      {days.map((day, i) => {
        const visits = dayData[day]?.visits || 0
        const unique = dayData[day]?.unique || 0
        const bw = Math.floor(barW * 0.32)
        const gap = 3
        const x = PAD.l + i * barW + Math.floor((barW - bw * 2 - gap) / 2)
        const hV = Math.max(2, Math.round((visits / maxVal) * chartH))
        const hU = Math.max(unique > 0 ? 2 : 0, Math.round((unique / maxVal) * chartH))
        return (
          <g key={day}>
            <rect x={x} y={PAD.t + chartH - hV} width={bw} height={hV} rx="3" fill="#174A6E" />
            <rect x={x + bw + gap} y={PAD.t + chartH - hU} width={bw} height={hU} rx="3" fill="#2A8FC4" />
            <text x={PAD.l + i * barW + barW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {fmtDateShort(day)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Modal ── */
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0D2D45' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function AdminPanel() {
  const [view, setView] = useState('login')
  const [user, setUser] = useState('')
  const [pwd, setPwd] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState(null) // 'reset' | 'pwd'
  const [newPwd, setNewPwd] = useState('')
  const [confPwd, setConfPwd] = useState('')
  const [pwdErr, setPwdErr] = useState('')

  const days7 = getLast7Days()

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (user.trim() === 'admin' && pwd === getAdminPwd()) {
      setLoginErr('')
      setData(loadData())
      setView('dashboard')
    } else {
      setLoginErr('Usuário ou senha incorretos.')
    }
  }

  function handleReset() {
    const fresh = { total: 0, totalUnique: 0, pages: {}, days: {}, devices: {}, lastVisit: null }
    saveData(fresh)
    setData(fresh)
    setModal(null)
    showToast('Contador zerado com sucesso.')
  }

  function handleChangePwd() {
    if (!newPwd || newPwd.length < 6) { setPwdErr('Mínimo 6 caracteres.'); return }
    if (newPwd !== confPwd) { setPwdErr('As senhas não coincidem.'); return }
    try { localStorage.setItem(ADMIN_PWD_KEY, newPwd) } catch (_) {}
    setModal(null)
    setNewPwd('')
    setConfPwd('')
    setPwdErr('')
    showToast('Senha alterada com sucesso!')
  }

  function handleExport() {
    if (!data) return
    const rows = ['Data,Visitas,Únicos']
    days7.forEach(day => {
      const d = data.days?.[day] || { visits: 0, unique: 0 }
      rows.push(`${day},${d.visits || 0},${d.unique || 0}`)
    })
    try {
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'tecchti-acessos.csv'; a.click()
      URL.revokeObjectURL(url)
      showToast('CSV exportado!')
    } catch (_) { showToast('Erro ao exportar.') }
  }

  const total = data?.total || 0
  const totalUnique = data?.totalUnique || 0
  const todayKey = new Date().toISOString().split('T')[0]
  const todayVisits = data?.days?.[todayKey]?.visits || 0
  const yesterdayKey = days7[5]
  const yesterdayVisits = data?.days?.[yesterdayKey]?.visits || 0
  const diffToday = todayVisits - yesterdayVisits
  const avg7 = Math.round(days7.reduce((s, d) => s + (data?.days?.[d]?.visits || 0), 0) / 7)
  const lastVisit = data?.lastVisit ? new Date(data.lastVisit).toLocaleString('pt-BR') : '—'
  const pageEntries = Object.entries(data?.pages || {}).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxPage = pageEntries[0]?.[1] || 1
  const pageLabels = { '/': 'Home', '/contato': 'Contato', '/#servicos': 'Serviços', '/#sobre': 'Sobre' }
  const deviceData = data?.devices || {}

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; }
    input { font-family: inherit; font-size: 14px; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; width: 100%; outline: none; color: #0D2D45; transition: border 0.2s; }
    input:focus { border-color: #174A6E; }
    .btn-primary { background: #174A6E; color: #fff; border: none; border-radius: 100px; padding: 12px 20px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; width: 100%; transition: background 0.2s; }
    .btn-primary:hover { background: #0D2D45; }
    .btn-action { background: #EBF3FB; color: #174A6E; border: none; border-radius: 10px; padding: 9px 16px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; transition: background 0.2s; }
    .btn-action:hover { background: #d4e9f7; }
    .btn-danger { background: #FEE2E2; color: #B91C1C; }
    .btn-danger:hover { background: #fecaca; }
    .nav-item { display: flex; align-items: center; gap: 10px; width: 100%; background: transparent; border: none; color: rgba(255,255,255,0.6); padding: 10px 12px; border-radius: 10px; font-size: 13px; cursor: pointer; margin-bottom: 4px; text-align: left; font-family: inherit; transition: all 0.15s; }
    .nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
    .nav-item.active { background: rgba(255,255,255,0.12); color: #fff; font-weight: 500; }
    .card { background: #fff; border-radius: 14px; padding: 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 6px rgba(13,45,69,0.06); margin-bottom: 1rem; }
    .metric-card { background: #fff; border-radius: 14px; padding: 1rem 1.25rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 6px rgba(13,45,69,0.06); }
  `

  /* LOGIN */
  if (view === 'login') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0D2D45 0%, #174A6E 100%)', fontFamily: "'Inter', sans-serif" }}>
      <style>{css}</style>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem 2rem', width: 360, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="TECCHTI" style={{ height: 52, marginBottom: '1rem' }} onError={e => { e.target.style.display = 'none' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#0D2D45' }}>Painel Administrativo</p>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Acesso restrito</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 5, fontWeight: 500 }}>Usuário</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="admin" autoComplete="username" />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 5, fontWeight: 500 }}>Senha</label>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {loginErr && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12 }}>{loginErr}</p>}
          <button type="submit" className="btn-primary">Entrar →</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>← Voltar ao site</a>
        </div>
      </div>
    </div>
  )

  /* DASHBOARD */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F8FAFC' }}>
      <style>{css}</style>

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0D2D45', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', position: 'sticky', top: 0, height: '100vh' }}>
        <img src="/logo.png" alt="TECCHTI" style={{ height: 36, marginBottom: '2rem', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none' }} />
        <nav style={{ flex: 1 }}>
          {[
            { id: 'overview', icon: '📊', label: 'Visão Geral' },
            { id: 'pages',    icon: '📄', label: 'Páginas' },
            { id: 'devices',  icon: '📱', label: 'Dispositivos' },
            { id: 'settings', icon: '⚙️', label: 'Configurações' },
          ].map(item => (
            <button key={item.id} className={`nav-item${tab === item.id ? ' active' : ''}`} onClick={() => setTab(item.id)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="/" style={{ display: 'block', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: 8 }}>← Ver site</a>
          <button onClick={() => setView('login')} style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '7px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0D2D45' }}>
                {tab === 'overview' && 'Visão Geral'}
                {tab === 'pages' && 'Páginas Visitadas'}
                {tab === 'devices' && 'Dispositivos'}
                {tab === 'settings' && 'Configurações'}
              </h1>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Última visita: {lastVisit}</p>
            </div>
            <span style={{ fontSize: 12, color: '#16a34a', background: '#dcfce7', padding: '4px 12px', borderRadius: 100, fontWeight: 500 }}>● Online</span>
          </div>

          {/* OVERVIEW */}
          {tab === 'overview' && <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '1rem' }}>
              {[
                { icon: '👁', label: 'Total de Visitas', value: total, sub: 'desde o início', subColor: '#94a3b8' },
                { icon: '👤', label: 'Visitantes Únicos', value: totalUnique, sub: 'sessões distintas', subColor: '#94a3b8' },
                { icon: '📅', label: 'Hoje', value: todayVisits, sub: `${diffToday >= 0 ? '+' : ''}${diffToday} vs ontem`, subColor: diffToday >= 0 ? '#16a34a' : '#B91C1C' },
                { icon: '📈', label: 'Média Diária', value: avg7, sub: 'últimos 7 dias', subColor: '#94a3b8' },
              ].map(m => (
                <div key={m.label} className="metric-card">
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{m.icon} {m.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#0D2D45', lineHeight: 1 }}>{m.value.toLocaleString('pt-BR')}</p>
                  <p style={{ fontSize: 11, color: m.subColor, marginTop: 4 }}>{m.sub}</p>
                </div>
              ))}
            </div>
            <div className="card">
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0D2D45', marginBottom: 12 }}>Acessos — últimos 7 dias</p>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                {[['#174A6E', 'Visitas'], ['#2A8FC4', 'Únicos']].map(([c, l]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                  </span>
                ))}
              </div>
              <BarChart days={days7} dayData={data?.days || {}} />
            </div>
          </>}

          {/* PAGES */}
          {tab === 'pages' && (
            <div className="card">
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0D2D45', marginBottom: 12 }}>Páginas mais acessadas</p>
              {pageEntries.length === 0
                ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Nenhum dado ainda. Acesse o site para gerar registros.</p>
                : pageEntries.map(([path, count]) => (
                  <div key={path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#0D2D45' }}>{pageLabels[path] || path}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{path}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 80, height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(count / maxPage * 100)}%`, height: '100%', background: '#174A6E', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#174A6E', minWidth: 28, textAlign: 'right' }}>{count}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* DEVICES */}
          {tab === 'devices' && (
            <div className="card">
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0D2D45', marginBottom: 16 }}>Distribuição por dispositivo</p>
              {Object.keys(deviceData).length === 0
                ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Nenhum dado ainda.</p>
                : Object.entries(deviceData).map(([device, count]) => {
                  const totalDev = Object.values(deviceData).reduce((s, v) => s + v, 0) || 1
                  const icons = { Desktop: '🖥', Mobile: '📱', Tablet: '📋' }
                  return (
                    <div key={device} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#0D2D45' }}>{icons[device] || '💻'} {device}</span>
                        <span style={{ fontSize: 13, color: '#64748b' }}>{count} ({Math.round(count / totalDev * 100)}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(count / totalDev * 100)}%`, height: '100%', background: '#174A6E', borderRadius: 4 }} />
                      </div>
                    </div>
                  )
                })
              }
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && <>
            <div className="card">
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0D2D45', marginBottom: 12 }}>Gerenciar dados</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button className="btn-action" onClick={handleExport}>📥 Exportar CSV</button>
                <button className="btn-action btn-danger" onClick={() => setModal('reset')}>🗑 Zerar Contador</button>
              </div>
            </div>
            <div className="card">
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0D2D45', marginBottom: 8 }}>Segurança</p>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Usuário: <strong>admin</strong></p>
              <button className="btn-action" onClick={() => { setModal('pwd'); setNewPwd(''); setConfPwd(''); setPwdErr('') }}>🔒 Alterar Senha</button>
            </div>
            <div className="card">
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0D2D45', marginBottom: 12 }}>Resumo</p>
              {[
                ['Total de visitas', total],
                ['Visitantes únicos', totalUnique],
                ['Páginas rastreadas', pageEntries.length],
                ['Última visita', lastVisit],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: '#0D2D45' }}>{v}</span>
                </div>
              ))}
            </div>
          </>}

        </div>
      </main>

      {/* Modal: Reset */}
      {modal === 'reset' && (
        <Modal title="Zerar contador" onClose={() => setModal(null)}>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: '1.5rem' }}>Todos os dados de visitas serão apagados permanentemente. Deseja continuar?</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-action" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancelar</button>
            <button className="btn-action btn-danger" onClick={handleReset} style={{ flex: 1 }}>Confirmar</button>
          </div>
        </Modal>
      )}

      {/* Modal: Change password */}
      {modal === 'pwd' && (
        <Modal title="Alterar senha" onClose={() => setModal(null)}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 5 }}>Nova senha</label>
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 5 }}>Confirmar senha</label>
            <input type="password" value={confPwd} onChange={e => setConfPwd(e.target.value)} placeholder="Repita a senha" />
          </div>
          {pwdErr && <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 12 }}>{pwdErr}</p>}
          <button className="btn-primary" onClick={handleChangePwd}>Salvar senha</button>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0D2D45', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 1000 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
