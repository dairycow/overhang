import apiClient from './api'
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types'

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    const response = await apiClient.post<AuthResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return response.data
  },

  // Register new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', credentials)
    return response.data
  },

  // Get current user info
  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken')
  },

  // Set auth token
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token)
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  }
}