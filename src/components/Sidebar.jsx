import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard',     icon: '◈', label: 'Dashboard' },
  { to: '/pdv',           icon: '🖥', label: 'PDV' },
  { to: '/caixa',         icon: '💰', label: 'Caixa' },
  { to: '/estoque',       icon: '📦', label: 'Estoque' },
  { to: '/financeiro',    icon: '📊', label: 'Financeiro' },
  { to: '/servicos',      icon: '🔧', label: 'Serviços / OS' },
  { to: '/nota-fiscal',   icon: '🧾', label: 'Nota Fiscal' },
  { to: '/relatorios',    icon: '📈', label: 'Relatórios' },
  { to: '/suporte',       icon: '💬', label: 'Suporte' },
]

export default function Sidebar({ collapsed = false, onClose }) {
  const { empresa, user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const inicial = (user?.email || '?')[0].toUpperCase()
  const width = collapsed ? 64 : 230

  return (
    <aside style={{
      width, minHeight: '100vh', background: '#0d0d16',
      borderRight: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
      transition: 'width 0.2s'
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '1.25rem 0' : '1.5rem 1.25rem', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg, #4d55f5, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: 'white'
        }}>G</div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#e8e8f0' }}>
              Gestão<span style={{ color: '#4d55f5' }}>Pro</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#4a4a6a', fontWeight: 500, marginTop: 1 }}>
              {empresa?.nome || 'Minha Empresa'}
            </div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: '#6666a0', cursor: 'pointer', fontSize: '1.1rem'
          }}>✕</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '0.75rem 0' : '0.75rem', overflowY: 'auto' }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0.75rem 0' : '0.6rem 0.875rem',
            borderRadius: collapsed ? 0 : 9,
            marginBottom: 2, textDecoration: 'none',
            background: isActive ? 'rgba(77,85,245,0.15)' : 'transparent',
            color: isActive ? '#818cf8' : '#6666a0',
            fontWeight: isActive ? 600 : 400,
            fontSize: '0.85rem',
            borderLeft: isActive && !collapsed ? '2px solid #4d55f5' : '2px solid transparent',
            transition: 'all 0.15s',
            title: label,
          })}>
            <span style={{ fontSize: collapsed ? '1.3rem' : '1rem', width: collapsed ? 'auto' : 20, textAlign: 'center' }}>{icon}</span>
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '0.75rem', borderTop: '1px solid #1a1a2e' }}>
          <NavLink to="/perfil" onClick={onClose} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0.6rem 0.875rem', borderRadius: 9,
            marginBottom: 4, textDecoration: 'none',
            background: isActive ? 'rgba(77,85,245,0.15)' : 'transparent',
            color: isActive ? '#818cf8' : '#9898b8',
            fontWeight: isActive ? 600 : 400,
            fontSize: '0.85rem',
            borderLeft: isActive ? '2px solid #4d55f5' : '2px solid transparent',
            transition: 'all 0.15s'
          })}>
            <div style={{
              width: 24, height: 24, borderRadius: 7, flexShrink: 0,
              background: 'linear-gradient(135deg, #4d55f5, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'white', fontSize: 11
            }}>{inicial}</div>
            Configurações
          </NavLink>

          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '0.6rem 0.875rem', borderRadius: 9, cursor: 'pointer',
            background: 'transparent', border: 'none', color: '#6666a0',
            fontFamily: 'Sora, sans-serif', fontSize: '0.85rem', fontWeight: 500,
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#6666a0'}>
            <span style={{ width: 20, textAlign: 'center' }}>⏻</span> Sair
          </button>
        </div>
      )}

      {/* Footer collapsed */}
      {collapsed && (
        <div style={{ padding: '0.5rem 0', borderTop: '1px solid #1a1a2e' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '0.75rem 0', background: 'transparent', border: 'none',
            color: '#6666a0', cursor: 'pointer', fontSize: '1.1rem'
          }}>⏻</button>
        </div>
      )}
    </aside>
  )
}
