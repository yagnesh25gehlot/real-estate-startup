import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth()

  console.log('🔍 ProtectedRoute - user:', user)
  console.log('🔍 ProtectedRoute - loading:', loading)
  console.log('🔍 ProtectedRoute - isAuthenticated:', isAuthenticated)
  console.log('🔍 ProtectedRoute - allowedRoles:', allowedRoles)

  if (loading) {
    console.log('🔍 ProtectedRoute - showing loading spinner')
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    console.log('🔍 ProtectedRoute - not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('🔍 ProtectedRoute - user role not allowed, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  console.log('🔍 ProtectedRoute - rendering children')
  return <>{children}</>
}

export default ProtectedRoute 