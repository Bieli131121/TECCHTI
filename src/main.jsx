import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Contato from './Contato.jsx'
import AdminPanel from './AdminPanel.jsx'
import { usePageTracker } from './usePageTracker.js'

function TrackedRoutes() {
  usePageTracker()
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TrackedRoutes />
    </BrowserRouter>
  </StrictMode>
)
