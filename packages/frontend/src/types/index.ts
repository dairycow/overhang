// User types
export interface User {
  id: number
  username: string
  email?: string
  home_location_id: number
  default_grade: string
  created_at: string
}

export interface UserUpdate {
  home_location_id?: number
  default_grade?: string
}

// Location types
export interface Location {
  id: number
  name: string
  slug: string
  created_at: string
}

// Problem types
export interface Problem {
  id: number
  session_id: number
  grade: string
  attempts: number
  sends: number
  notes?: string
  created_at: string
}

export interface ProblemCreate {
  grade: string
  attempts: number
  sends: number
  notes?: string
}

export interface ProblemUpdate {
  grade?: string
  attempts?: number
  sends?: number
  notes?: string
}

// Session types
export interface Session {
  id: number
  user_id: number
  location_id: number
  location_name: string
  date: string
  problems: Problem[]
  rating?: number
  created_at: string
}

export interface SessionCreate {
  location_id: number
  date: string
  problems: ProblemCreate[]
  rating?: number
}

export interface SessionUpdate {
  location_id?: number
  date?: string
  rating?: number
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
  home_location_id?: number
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