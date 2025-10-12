// User types
export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

// Location types
export interface Location {
  id: number
  name: string
  slug: string
  description: string
  created_at: string
}

// Session types
export interface Session {
  id: number
  user_id: number
  location_id: number
  date: string
  notes: string
  created_at: string
  updated_at: string
}

// Auth types
export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}