import { useState, useEffect } from 'react'
import { SessionCreate, ProblemCreate, Location, User } from '../types'
import apiClient from '../services/api'
import { authService } from '../services/auth'
import GradePicker from './GradePicker'
import NumberStepper from './NumberStepper'

interface SessionFormProps {
  onSessionCreated: () => void
}

function SessionForm({ onSessionCreated }: SessionFormProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [sessionData, setSessionData] = useState<SessionCreate>({
    location_id: 0,
    date: new Date().toISOString().split('T')[0],
    problems: [],
    rating: undefined
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (!userLoading) {
      fetchLocations()
    }
  }, [userLoading])

  const fetchUserData = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (err) {
      console.error('Failed to fetch user data:', err)
      // Continue without user data - will use fallback location
    } finally {
      setUserLoading(false)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await apiClient.get('/api/locations')
      setLocations(response.data)
      if (response.data.length > 0) {
        // Use user's home location if available and valid, otherwise use first location
        let defaultLocationId = response.data[0].id

        if (user?.home_location_id) {
          const userHomeLocation = response.data.find((location: Location) => location.id === user.home_location_id)
          if (userHomeLocation) {
            defaultLocationId = user.home_location_id
          }
        }

        setSessionData(prev => ({ ...prev, location_id: defaultLocationId }))
      }
    } catch (err) {
      setError('Failed to load locations')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate location is selected
      if (sessionData.location_id === 0) {
        setError('Please select a location')
        setLoading(false)
        return
      }

      // Ensure at least one problem has been added
      if (sessionData.problems.length === 0) {
        setError('Please add at least one problem')
        setLoading(false)
        return
      }

      await apiClient.post('/api/sessions', sessionData)

      // Reset form
      setSessionData({
        location_id: sessionData.location_id, // Keep same location
        date: new Date().toISOString().split('T')[0],
        problems: [],
        rating: undefined
      })

      onSessionCreated()
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg || d.message || 'Validation error').join(', '))
      } else {
        setError(detail || 'Failed to create session')
      }
    } finally {
      setLoading(false)
    }
  }

  const addProblem = () => {
    const defaultGrade = user?.default_grade || 'V0'
    setSessionData(prev => ({
      ...prev,
      problems: [...prev.problems, { grade: defaultGrade, attempts: 1, sends: 0, notes: '' }]
    }))
  }

  const removeProblem = (index: number) => {
    setSessionData(prev => ({
      ...prev,
      problems: prev.problems.filter((_, i) => i !== index)
    }))
  }

  const updateProblem = (index: number, field: keyof ProblemCreate, value: string | number) => {
    setSessionData(prev => ({
      ...prev,
      problems: prev.problems.map((problem, i) =>
        i === index ? { ...problem, [field]: value } : problem
      )
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">log climbing session</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              date
            </label>
            <input
              type="date"
              value={sessionData.date}
              onChange={(e) => setSessionData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              location
            </label>
            <select
              value={sessionData.location_id}
              onChange={(e) => setSessionData(prev => ({ ...prev, location_id: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            >
              <option value={0}>select location...</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Problems */}
        <div>
          <div className="mb-3 flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              problems
            </label>
            <button
              type="button"
              onClick={addProblem}
              className="px-4 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 touch-manipulation"
            >
              + add problem
            </button>
          </div>

          {sessionData.problems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Click "add problem" to start logging
            </div>
          ) : (
            <div className="space-y-3">
              {sessionData.problems.map((problem, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  {/* Row 1: Grade Picker */}
                  <div className="flex justify-center mb-3">
                    <GradePicker
                      value={problem.grade}
                      onChange={(newGrade) => updateProblem(index, 'grade', newGrade)}
                    />
                  </div>

                  {/* Row 2: Attempts and Sends */}
                  <div className="flex items-end space-x-4 mb-3">
                    <NumberStepper
                      label="attempts"
                      value={problem.attempts}
                      onChange={(value) => updateProblem(index, 'attempts', value)}
                      min={0}
                    />
                    <NumberStepper
                      label="sends"
                      value={problem.sends}
                      onChange={(value) => updateProblem(index, 'sends', value)}
                      min={0}
                    />
                  </div>

                  {/* Row 3: Notes */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={problem.notes || ''}
                      onChange={(e) => updateProblem(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="notes for this problem..."
                    />
                  </div>

                  {/* Row 4: Remove Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeProblem(index)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            session rating (1-10)
          </label>
          <select
            value={sessionData.rating || ''}
            onChange={(e) => setSessionData(prev => ({
              ...prev,
              rating: e.target.value ? parseInt(e.target.value) : undefined
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">optional</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'logging...' : 'log!'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SessionForm