import axios from 'axios'

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: '',
  timeout: 10000,
})

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient