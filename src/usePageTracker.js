import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const STORAGE_KEY = 'tecchti_visits'

export function usePageTracker() {
  const location = useLocation()

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const data = raw ? JSON.parse(raw) : {
        total: 0,
        totalUnique: 0,
        pages: {},
        days: {},
        lastVisit: null,
        sessions: []
      }

      const today = new Date().toISOString().split('T')[0]
      const sessionKey = 'tecchti_session'
      const isNewSession = !sessionStorage.getItem(sessionKey)

      data.total = (data.total || 0) + 1
      data.pages[location.pathname] = (data.pages[location.pathname] || 0) + 1

      if (!data.days[today]) data.days[today] = { visits: 0, unique: 0 }
      data.days[today].visits += 1

      if (isNewSession) {
        sessionStorage.setItem(sessionKey, '1')
        data.totalUnique = (data.totalUnique || 0) + 1
        data.days[today].unique = (data.days[today].unique || 0) + 1
      }

      data.lastVisit = new Date().toISOString()

      const deviceType = /Mobi|Android/i.test(navigator.userAgent)
        ? 'Mobile'
        : /Tablet|iPad/i.test(navigator.userAgent)
        ? 'Tablet'
        : 'Desktop'

      if (!data.devices) data.devices = { Desktop: 0, Mobile: 0, Tablet: 0 }
      data.devices[deviceType] = (data.devices[deviceType] || 0) + 1

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Tracker error:', e)
    }
  }, [location.pathname])
}
