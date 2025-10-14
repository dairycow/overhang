import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Location, AggregateStats } from '../types'
import apiClient from '../services/api'
import NetworkActivityChart from './charts/NetworkActivityChart'
import AggregateProgressChart from './charts/AggregateProgressChart'
import AggregateDistributionChart from './charts/AggregateDistributionChart'

function Homepage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [stats, setStats] = useState<AggregateStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [locationsRes, statsRes] = await Promise.all([
        apiClient.get('/api/locations'),
        apiClient.get('/api/stats/aggregate?period=all')
      ])
      setLocations(locationsRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error('Failed to fetch homepage data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          welcome to overhang
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          track your climbing progress over time
        </p>
         <div className="flex justify-center">
           <Link
             to="/login"
             className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition"
           >
             get started
           </Link>
         </div>
      </div>

      {/* Network Statistics */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.total_climbs}
            </div>
            <div className="text-gray-600">total climbs logged</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {locations.length}
            </div>
            <div className="text-gray-600">gym locations</div>
          </div>
        </div>
      )}

      {/* Aggregate Charts */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">community progress</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AggregateProgressChart />
          <AggregateDistributionChart period="all" />
        </div>
      </div>

      {/* Network Activity Chart */}
      <div className="mb-12">
        <NetworkActivityChart period="week" />
      </div>

      {/* Gym Locations */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(location => (
            <Link
              key={location.id}
              to={`/location/${location.slug}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-400 transition"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {location.name}
              </h3>
              <div className="text-gray-900 font-medium text-sm">
                view stats →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 bg-gray-800 rounded-lg text-white mb-12">
        <h2 className="text-3xl font-bold mb-4">
          ready to start tracking?
        </h2>
        <p className="text-xl mb-6 opacity-90">
          join climbers tracking their progress
        </p>
         <Link
           to="/login"
           className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
         >
           get started
         </Link>
      </div>
    </div>
  )
}

export default Homepage
