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

  const deleteSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return
    }

    try {
      await apiClient.delete(`/api/sessions/${sessionId}`)
      // Refresh the sessions list
      fetchSessions()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete session')
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
                total + session.problems.reduce((problemTotal, problem) => problemTotal + problem.attempts, 0), 0
              )}
            </div>
            <div className="text-gray-700">total attempts</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {sessions.reduce((total, session) =>
                total + session.problems.reduce((problemTotal, problem) => problemTotal + problem.sends, 0), 0
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
              <div className="flex items-start space-x-4">
                {session.rating && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {session.rating}/10
                    </div>
                    <div className="text-sm text-gray-500">rating</div>
                  </div>
                )}
                <button
                  onClick={() => deleteSession(session.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete session"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">problems logged:</h4>
              <div className="space-y-2">
                {session.problems.map((problem, index) => {
                  const color = getGradeColor(problem.grade)
                  const isWhite = color === '#F3F4F6'
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex-shrink-0 ${isWhite ? 'border-2 border-gray-900' : ''}`}
                        style={{ backgroundColor: color }}
                        title={problem.grade}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{problem.grade}</span>
                          <span className="text-sm text-gray-600">
                            {problem.sends}/{problem.attempts} {problem.sends === 1 ? 'send' : 'sends'}
                          </span>
                        </div>
                        {problem.notes && (
                          <p className="text-sm text-gray-700 italic">"{problem.notes}"</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="text-sm text-gray-500 border-t pt-3">
              logged {formatDate(session.created_at)}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default SessionList