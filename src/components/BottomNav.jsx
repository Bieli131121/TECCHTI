import { NavLink } from 'react-router-dom'

const ITEMS = [
  { to: '/dashboard',  icon: '◈', label: 'Início' },
  { to: '/pdv',        icon: '🖥', label: 'PDV' },
  { to: '/estoque',    icon: '📦', label: 'Estoque' },
  { to: '/financeiro', icon: '📊', label: 'Financeiro' },
  { to: '/perfil',     icon: '⚙️', label: 'Config' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
      background: '#0d0d16', borderTop: '1px solid #1a1a2e',
      display: 'flex', alignItems: 'center',
      height: 64, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {ITEMS.map(({ to, icon, label }) => (
        <NavLink key={to} to={to} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 2, textDecoration: 'none', padding: '0.25rem 0',
          color: isActive ? '#818cf8' : '#4a4a6a',
          transition: 'color 0.15s'
        })}>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
