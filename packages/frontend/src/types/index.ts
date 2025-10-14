// User types
export interface User {
  id: number
  username: string
  email?: string
  home_location_id: number
  created_at: string
}

// Location types
export interface Location {
  id: number
  name: string
  slug: string
  created_at: string
}

// Grade entry types
export interface GradeEntry {
  grade: string
  attempts: number
  completed: number
}

// Session types
export interface Session {
  id: number
  user_id: number
  location_id: number
  location_name: string
  date: string
  grades: GradeEntry[]
  rating?: number
  notes?: string
  created_at: string
}

export interface SessionCreate {
  location_id: number
  date: string
  grades: GradeEntry[]
  rating?: number
  notes?: string
}

export interface SessionUpdate {
  location_id?: number
  date?: string
  grades?: GradeEntry[]
  rating?: number
  notes?: string
}

// Auth types
export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email?: string
  password: string
  home_location_id: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

// Statistics types for charts

// Progress over time data (from /stats/user/progress)
export interface ProgressDataPoint {
  date: string
  grade: string
}

export type ProgressData = ProgressDataPoint[]

// Grade distribution data (from /stats/user/distribution)
export interface DistributionData {
  [grade: string]: number  // grade -> count
}

// Location statistics (from /stats/location/{id})
export interface LocationStats {
  total_climbs: number
  grade_distribution: DistributionData
}

// Aggregate statistics (from /stats/aggregate)
export interface LocationActivityData {
  location_id: number
  name: string
  count: number
}

export interface AggregateStats {
  total_climbs: number
  by_location: LocationActivityData[]
  grade_distribution: DistributionData
}

// Filter types
export interface ChartFilters {
  locationId?: number
  startDate?: string
  endDate?: string
  period?: 'today' | 'week' | 'month' | 'all'
}