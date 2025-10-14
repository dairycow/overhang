import { useState, useEffect } from 'react'
import { Session } from '../types'
import apiClient from '../services/api'
import { getGradeColor } from '../utils/chartConfig'

function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/sessions')
      setSessions(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">loading sessions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">no sessions yet</h3>
        <p className="text-gray-600">start logging your climbing sessions to track your progress!</p>
      </div>
    )
  }

  return (
    <div>

      <div className="mt-8 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">overall summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">{sessions.length}</div>
            <div className="text-gray-700">total sessions</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {sessions.reduce((total, session) =>
                total + session.grades.reduce((gradeTotal, grade) => gradeTotal + grade.attempts, 0), 0
              )}
            </div>
            <div className="text-gray-700">total attempts</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {sessions.reduce((total, session) =>
                total + session.grades.reduce((gradeTotal, grade) => gradeTotal + grade.completed, 0), 0
              )}
            </div>
            <div className="text-gray-700">routes sent</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {sessions.filter(s => s.rating).length > 0
                ? (sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.filter(s => s.rating).length).toFixed(1)
                : 'N/A'
              }
            </div>
            <div className="text-gray-700">avg rating</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(session.date)}
                </h3>
                 <p className="text-gray-600">
                   location: {session.location_name}
                 </p>
              </div>
              {session.rating && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {session.rating}/10
                  </div>
                  <div className="text-sm text-gray-500">rating</div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">grades climbed:</h4>
              <div className="flex flex-wrap gap-2">
                {session.grades.map((grade, index) => {
                  const color = getGradeColor(grade.grade)
                  const isWhite = color === '#F3F4F6'
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100"
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${isWhite ? 'border-2 border-gray-900' : ''}`}
                        style={{ backgroundColor: color }}
                        title={grade.grade}
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {grade.completed}/{grade.attempts}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {session.notes && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-1">notes:</h4>
                <p className="text-gray-700 italic">"{session.notes}"</p>
              </div>
            )}

            <div className="text-sm text-gray-500 border-t pt-3">
              session #{session.id} • logged {formatDate(session.created_at)}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default SessionList