import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import apiClient from '../../services/api'
import { AggregateStats } from '../../types'
import { barChartOptions } from '../../utils/chartConfig'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface NetworkActivityChartProps {
  period?: 'week' | 'month' | 'all'
}

function NetworkActivityChart({ period = 'week' }: NetworkActivityChartProps) {
  const [data, setData] = useState<AggregateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAggregateData()
  }, [period])

  const fetchAggregateData = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await apiClient.get(`/stats/aggregate?period=${period}`)
      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load network activity data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">loading network activity...</p>
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

  if (!data || data.by_location.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">no activity yet</h3>
          <p className="text-gray-600">check back soon to see climbing activity across locations!</p>
        </div>
      </div>
    )
  }

  // Sort locations by count (descending)
  const sortedLocations = [...data.by_location].sort((a, b) => b.count - a.count)

  const labels = sortedLocations.map(loc => loc.name)
  const values = sortedLocations.map(loc => loc.count)

  // Generate greyscale colors for bars
  const colors = sortedLocations.map((_, index) => {
    const shade = 30 + (index * 15)
    return `rgb(${shade}, ${shade}, ${shade})`
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: 'sessions',
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
      }
    ]
  }

  const periodLabel = {
    week: 'last 7 days',
    month: 'last 30 days',
    all: 'all time'
  }[period]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">activity</h3>
      <div className="h-80">
        <Bar
          data={chartData}
          options={{
            ...barChartOptions,
            maintainAspectRatio: false
          }}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          total sessions: <span className="font-semibold text-gray-900">
            {sortedLocations.reduce((sum, loc) => sum + loc.count, 0)}
          </span>
        </p>
        <p className="text-xs text-gray-500 mt-1">period: {periodLabel}</p>
      </div>
    </div>
  )
}

export default NetworkActivityChart
