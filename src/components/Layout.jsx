import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useDevice } from '../hooks/useDevice'

export default function Layout() {
  const { isMobile, isTablet } = useDevice()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0a0f' }}>
        {/* Header mobile */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
          background: '#0d0d16', borderBottom: '1px solid #1a1a2e',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', height: 56
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #4d55f5, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: 'white', fontSize: 14
            }}>G</div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#e8e8f0', letterSpacing: '-0.02em' }}>
              Gestão<span style={{ color: '#4d55f5' }}>Pro</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(true)} style={{
            background: '#1a1a26', border: '1px solid #22223a', borderRadius: 8,
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1.1rem', color: '#e8e8f0'
          }}>☰</button>
        </header>

        {/* Drawer lateral mobile */}
        {sidebarOpen && (
          <>
            <div onClick={() => setSidebarOpen(false)} style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 70
            }} />
            <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 80, width: 240 }}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Conteúdo */}
        <main style={{ flex: 1, padding: '1rem', paddingTop: 72, paddingBottom: 80, minHeight: '100vh' }}>
          <Outlet />
        </main>

        {/* Bottom nav */}
        <BottomNav />
      </div>
    )
  }

  if (isTablet) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div style={{ width: 64, flexShrink: 0 }}>
          <Sidebar collapsed />
        </div>
        <main style={{ flex: 1, padding: '1.5rem', minHeight: '100vh' }}>
          <Outlet />
        </main>
      </div>
    )
  }

  // Desktop padrão
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 230, flex: 1, padding: '2rem', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}
