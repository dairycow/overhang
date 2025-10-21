import { useState, useEffect } from 'react'
import { User, UserUpdate, Location } from '../types'
import apiClient from '../services/api'
import { authService } from '../services/auth'
import GradePicker from './GradePicker'

function UserSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [settings, setSettings] = useState<UserUpdate>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUserData()
    fetchLocations()
  }, [])

  const fetchUserData = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      setSettings({
        home_location_id: userData.home_location_id,
        default_grade: userData.default_grade
      })
    } catch (err) {
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await apiClient.get('/api/locations')
      setLocations(response.data)
    } catch (err) {
      console.error('Failed to load locations:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await apiClient.patch('/api/auth/me', settings)
      setSuccess('Settings updated successfully!')
      // Refresh user data
      await fetchUserData()
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(detail || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">loading settings...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to load user settings
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">user settings</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info (Read-only) */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">account info</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-700 font-medium">Username:</span>{' '}
              <span className="text-gray-900">{user.username}</span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Member since:</span>{' '}
              <span className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Default Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            default location
          </label>
          <select
            value={settings.home_location_id || user.home_location_id}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              home_location_id: parseInt(e.target.value)
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            This location will be pre-selected when logging new sessions
          </p>
        </div>

        {/* Default Grade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            default grade
          </label>
          <div className="flex justify-center">
            <GradePicker
              value={settings.default_grade || user.default_grade}
              onChange={(grade) => setSettings(prev => ({ ...prev, default_grade: grade }))}
            />
          </div>
          <p className="mt-3 text-sm text-gray-500 text-center">
            New problems will default to this grade when logging sessions
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'saving...' : 'save settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserSettings
