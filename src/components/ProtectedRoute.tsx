import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, type Rol } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: Rol[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, usuario } = useAuth()

  if (!token || !usuario) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
