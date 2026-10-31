import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getSession } from './auth'

// Route guard: unauthenticated visitors to /event/:id go to / with ?next= so they return after login.
export default function RequireAuth({ children }: { children: ReactNode }) {
  const loc = useLocation()
  if (!getSession()) return <Navigate to={`/?next=${encodeURIComponent(loc.pathname)}`} replace />
  return <>{children}</>
}
