import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../services/api'

interface User {
  id: string
  email: string
  name: string | null
  mobile?: string | null
  aadhaar?: string | null
  profilePic?: string | null
  role: 'USER' | 'DEALER' | 'ADMIN'
  createdAt: string
  dealer?: {
    id: string
    referralCode: string
    status: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, name: string, role?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

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
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token')
    if (token) {
      // You could verify the token here if needed
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, name: string, role?: string) => {
    try {
      // Get user data from localStorage (set by login/signup pages)
      const userData = localStorage.getItem('user')
      if (!userData) {
        throw new Error('No user data found')
      }

      const user = JSON.parse(userData)
      setUser(user)
      toast.success('Login successful!')
      
      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed')
      throw error
    }
  }

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    setUser(null)
    navigate('/')
    toast.success('Logged out successfully')
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 