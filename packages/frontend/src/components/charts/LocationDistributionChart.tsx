import { useState, useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import apiClient from '../../services/api'
import { LocationStats } from '../../types'
import { getGradeColor, GRADE_ORDER, pieChartOptions } from '../../utils/chartConfig'

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface LocationDistributionChartProps {
  locationId: number
}

function LocationDistributionChart({ locationId }: LocationDistributionChartProps) {
  const [data, setData] = useState<LocationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLocationStats()
  }, [locationId])

  const fetchLocationStats = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiClient.get(`/stats/location/${locationId}`)
      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load location statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading location stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading chart</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || Object.keys(data.grade_distribution).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No data for this location</h3>
          <p className="text-gray-600">Be the first to log a session here!</p>
        </div>
      </div>
    )
  }

  const totalClimbs = Object.values(data.grade_distribution).reduce((sum, count) => sum + count, 0)

  if (totalClimbs === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed climbs yet</h3>
          <p className="text-gray-600">This location is waiting for climbers!</p>
        </div>
      </div>
    )
  }

  // Sort grades by GRADE_ORDER and filter out grades with 0 count
  const sortedGrades = GRADE_ORDER.filter(grade =>
    data.grade_distribution[grade] && data.grade_distribution[grade] > 0
  )
  const labels = sortedGrades
  const values = sortedGrades.map(grade => data.grade_distribution[grade])
  const colors = sortedGrades.map(grade => getGradeColor(grade))

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color === '#F3F4F6' ? '#1F2937' : color), // Dark border for white
        borderWidth: 2,
      }
    ]
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution at This Location</h3>
      <div className="h-80 flex items-center justify-center">
        <Pie
          data={chartData}
          options={{
            ...pieChartOptions,
            maintainAspectRatio: false
          }}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Total attempts: <span className="font-semibold text-gray-900">{data.total_climbs}</span>
        </p>
        <p className="text-sm text-gray-600">
          Completed climbs: <span className="font-semibold text-gray-900">{totalClimbs}</span>
        </p>
      </div>
    </div>
  )
}

export default LocationDistributionChart
