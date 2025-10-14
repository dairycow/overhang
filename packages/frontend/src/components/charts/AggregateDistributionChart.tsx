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
import { getGradeColor, GRADE_ORDER, pieChartOptions } from '../../utils/chartConfig'

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface AggregateDistributionChartProps {
  locationId?: number
  period?: 'week' | 'month' | 'all'
}

function AggregateDistributionChart({ locationId, period = 'all' }: AggregateDistributionChartProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAggregateData()
  }, [locationId, period])

  const fetchAggregateData = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      params.append('period', period)
      if (locationId) params.append('location_id', locationId.toString())

      const response = await apiClient.get(`/stats/aggregate?${params.toString()}`)
      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load distribution data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">loading distribution...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="font-semibold">error loading chart</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || !data.grade_distribution || Object.keys(data.grade_distribution).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">no aggregate data yet</h3>
          <p className="text-gray-600">no climbs recorded across the network in this period.</p>
        </div>
      </div>
    )
  }

  const gradeDistribution = data.grade_distribution
  const totalClimbs = Object.values(gradeDistribution).reduce((sum: number, count: any) => sum + count, 0)

  // Sort grades by GRADE_ORDER and filter out grades with 0 count
  const sortedGrades = GRADE_ORDER.filter(grade => gradeDistribution[grade] && gradeDistribution[grade] > 0)
  const labels = sortedGrades
  const values = sortedGrades.map(grade => gradeDistribution[grade])
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">grade distribution</h3>
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
          total sends: <span className="font-semibold text-gray-900">{totalClimbs}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          showing aggregate data from all users in the network
        </p>
      </div>
    </div>
  )
}

export default AggregateDistributionChart
