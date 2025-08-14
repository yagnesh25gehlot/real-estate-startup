import { api } from './api'

export interface User {
  id: string
  email: string
  name: string
  mobile: string
  aadhaar: string
  aadhaarImage?: string
  profilePic?: string
  role: 'USER' | 'DEALER' | 'ADMIN'
  createdAt: string
}

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name: string
  mobile: string
  aadhaar: string
  aadhaarImage?: File
}

class AuthService {
  // Simple email validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation (matches backend requirements)
  validatePassword(password: string): boolean {
    if (password.length < 8) return false
    if (!/(?=.*[a-z])/.test(password)) return false
    if (!/(?=.*[A-Z])/.test(password)) return false
    if (!/(?=.*\d)/.test(password)) return false
    if (!/(?=.*[@$!%*?&])/.test(password)) return false
    return true
  }

  // Simple mobile validation
  validateMobile(mobile: string): boolean {
    const mobileRegex = /^[6-9]\d{9}$/
    return mobileRegex.test(mobile)
  }

  // Simple Aadhaar validation
  validateAadhaar(aadhaar: string): boolean {
    const aadhaarRegex = /^[0-9]{12}$/
    return aadhaarRegex.test(aadhaar)
  }

  // Login
  async login(data: LoginData): Promise<{ user: User }> {
    try {
      const response = await api.post('/auth/login', data)
      // Return only user data, ignore token
      return { user: response.data.data.user }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  // Signup
  async signup(data: SignupData): Promise<{ user: User }> {
    try {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('name', data.name)
      formData.append('mobile', data.mobile)
      formData.append('aadhaar', data.aadhaar)
      
      if (data.aadhaarImage) {
        formData.append('aadhaarImage', data.aadhaarImage)
      }

      const response = await api.post('/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // Return only user data, ignore token
      return { user: response.data.data.user }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Signup failed')
    }
  }

  // Store user data in localStorage
  storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  // Get user from localStorage
  getUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    return null
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getUser()
  }

  // Logout
  logout(): void {
    localStorage.removeItem('user')
  }
}

export const authService = new AuthService()
