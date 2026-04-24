import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../components/Spinner'
import { useAuthStore } from '../store/useAuthStore'

export function ProtectedRoute() {
  const { session, loading } = useAuthStore()

  if (loading) return <Spinner />
  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}
