import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Location, LocationStats } from '../types'
import apiClient from '../services/api'
import LocationDistributionChart from './charts/LocationDistributionChart'

function LocationDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [location, setLocation] = useState<Location | null>(null)
  const [stats, setStats] = useState<LocationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchLocationData()
    }
  }, [slug])

  const fetchLocationData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch location details
      const locationRes = await apiClient.get(`/locations/${slug}`)
      setLocation(locationRes.data)

      // Fetch location stats
      const statsRes = await apiClient.get(`/stats/location/${locationRes.data.id}`)
      setStats(statsRes.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load location data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">loading location details...</p>
        </div>
      </div>
    )
  }

  if (error || !location) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">location not found</p>
          <p className="text-red-500 mb-4">{error || 'this location does not exist'}</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            back to homepage
          </Link>
        </div>
      </div>
    )
  }

  const totalCompleted = stats
    ? Object.values(stats.grade_distribution).reduce((sum, count) => sum + count, 0)
    : 0

  const mostPopularGrade = stats && totalCompleted > 0
    ? Object.entries(stats.grade_distribution)
        .sort(([, a], [, b]) => b - a)[0]?.[0]
    : 'N/A'

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium"
        >
          ← back to homepage
        </Link>
      </div>

      {/* Location Header */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{location.name}</h1>
        <p className="text-gray-600 mb-6">
          view aggregate statistics and climbing activity for this location
        </p>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.total_climbs}
              </div>
              <div className="text-gray-700 text-sm">total attempts</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {totalCompleted}
              </div>
              <div className="text-gray-700 text-sm">sends</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {mostPopularGrade}
              </div>
              <div className="text-gray-700 text-sm">most popular grade</div>
            </div>
          </div>
        )}
      </div>

      {/* Distribution Chart */}
      <div className="mb-8">
        <LocationDistributionChart locationId={location.id} />
      </div>

      {/* Call to Action for Logged In Users */}
      <div className="text-center py-8 bg-gray-800 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-3">climb at {location.name.split(',')[0]}?</h2>
        <p className="text-lg mb-4 opacity-90">
          log your sessions to contribute to these statistics
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          go to dashboard
        </Link>
      </div>
    </div>
  )
}

export default LocationDetail
