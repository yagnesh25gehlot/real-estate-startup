import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'
import { api } from '../services/api'

interface User {
  id: string
  email: string
  name: string | null
  mobile?: string | null
  aadhaar?: string | null
  aadhaarImage?: string | null
  profilePic?: string | null
  role: 'USER' | 'DEALER' | 'ADMIN'
  createdAt: string
  dealer?: {
    id: string
    referralCode: string
    status: string
    commission?: number
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (userData: User) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (userData: User) => void
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  useEffect(() => {
    console.log('🔍 AuthContext useEffect - checking for existing user')
    // Check for existing user on app load
    const userData = localStorage.getItem('user')
    
    console.log('🔍 AuthContext useEffect - userData exists:', !!userData)
    console.log('🔍 AuthContext useEffect - userData value:', userData)
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('🔍 AuthContext useEffect - setting user from localStorage:', parsedUser)
        setUser(parsedUser)
        console.log('🔍 AuthContext useEffect - user set successfully')
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    } else {
      console.log('🔍 AuthContext useEffect - no userData found')
    }
    setLoading(false)
  }, [])

  const login = async (userData: User) => {
    try {
      console.log('🔍 AuthContext.login called with userData:', userData)
      console.log('🔍 User role:', userData.role)
      
      console.log('🔍 localStorage before setUser - user:', !!localStorage.getItem('user'))
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('🔍 User data stored in localStorage')
      
      // Set user state
      setUser(userData)
      console.log('🔍 User state set successfully')
      
      // Show success message
      toast.success('Login successful!')
      
      console.log('🔍 localStorage after setUser - user:', !!localStorage.getItem('user'))
      
      console.log('🔍 About to navigate based on role:', userData.role)
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect based on role
      if (userData.role === 'ADMIN') {
        console.log('🔍 Navigating to /admin')
        window.location.href = '/admin'
      } else if (userData.role === 'DEALER') {
        console.log('🔍 Navigating to /dashboard')
        window.location.href = '/dashboard'
      } else {
        console.log('🔍 Navigating to /dashboard')
        window.location.href = '/dashboard'
      }
      
      console.log('🔍 Navigation completed')
      console.log('🔍 localStorage after navigation - user:', !!localStorage.getItem('user'))
    } catch (error: any) {
      console.error('Login error in AuthContext:', error)
      toast.error(error.message || 'Login failed')
      throw error
    }
  }

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('user')
    
    setUser(null)
    window.location.href = '/'
    toast.success('Logged out successfully')
  }

  const refreshAuth = () => {
    console.log('🔍 refreshAuth called')
    const userData = localStorage.getItem('user')
    
    console.log('🔍 refreshAuth - userData exists:', !!userData)
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('🔍 refreshAuth - setting user from localStorage:', parsedUser)
        setUser(parsedUser)
        console.log('🔍 refreshAuth - user set successfully')
      } catch (error) {
        console.error('Error parsing user data in refreshAuth:', error)
        localStorage.removeItem('user')
        setUser(null)
      }
    } else {
      console.log('🔍 refreshAuth - no userData found, setting user to null')
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 