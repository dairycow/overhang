import { useState, useEffect } from 'react'
import { SessionCreate, GradeEntry, Location, User } from '../types'
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
    grades: [
      { grade: 'VB', attempts: 0, completed: 0 },
      { grade: 'V0', attempts: 0, completed: 0 },
      { grade: 'V3', attempts: 0, completed: 0 }
    ],
    rating: undefined,
    notes: ''
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

      // Filter out grades with no completed sends (empty entries)
      const filteredSessionData = {
        ...sessionData,
        grades: sessionData.grades.filter(grade => grade.completed > 0)
      }

      // Ensure at least one grade has completed sends
      if (filteredSessionData.grades.length === 0) {
        setError('Please add at least one grade with sends')
        setLoading(false)
        return
      }

      await apiClient.post('/api/sessions', filteredSessionData)
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

  const addGradeEntry = () => {
    setSessionData(prev => ({
      ...prev,
      grades: [...prev.grades, { grade: 'V3', attempts: 0, completed: 0 }]
    }))
  }

  const removeGradeEntry = (index: number) => {
    setSessionData(prev => ({
      ...prev,
      grades: prev.grades.filter((_, i) => i !== index)
    }))
  }

  const updateGradeEntry = (index: number, field: keyof GradeEntry, value: string | number) => {
    setSessionData(prev => ({
      ...prev,
      grades: prev.grades.map((grade, i) =>
        i === index ? { ...grade, [field]: value } : grade
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

        {/* Grade Entries */}
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              grades climbed
            </label>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {sessionData.grades.map((grade, index) => (
              <div key={index} className="p-2 sm:p-3 bg-gray-50 rounded-md">
                {/* Row 1: Grade Picker */}
                <div className="flex justify-center mb-2 sm:mb-3">
                  <GradePicker
                    value={grade.grade}
                    onChange={(newGrade) => updateGradeEntry(index, 'grade', newGrade)}
                  />
                </div>

                {/* Row 2: Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-end space-x-3 sm:space-x-4">
                    <NumberStepper
                      label="attempts"
                      value={grade.attempts}
                      onChange={(value) => updateGradeEntry(index, 'attempts', value)}
                      min={0}
                    />
                    <NumberStepper
                      label="sends"
                      value={grade.completed}
                      onChange={(value) => updateGradeEntry(index, 'completed', value)}
                      min={0}
                    />
                  </div>

                  {sessionData.grades.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGradeEntry(index)}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 touch-manipulation text-lg font-bold"
                      aria-label="Remove grade"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
           </div>
         </div>

         {/* Add Grade Button */}
         <div className="flex justify-center mt-4">
           <button
             type="button"
             onClick={addGradeEntry}
             className="px-6 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 touch-manipulation"
           >
             + add grade
           </button>
         </div>

         {/* Session Rating and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              rating (1-10)
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

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              notes
            </label>
            <input
              type="text"
              value={sessionData.notes}
              onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="how was it?"
            />
          </div>
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