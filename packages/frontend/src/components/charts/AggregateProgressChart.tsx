import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import apiClient from '../../services/api'
import { ProgressData } from '../../types'
import { getGradeColor, GRADE_ORDER, lineChartOptions } from '../../utils/chartConfig'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface AggregateProgressChartProps {
  locationId?: number
  startDate?: string
  endDate?: string
}

function AggregateProgressChart({ locationId, startDate, endDate }: AggregateProgressChartProps) {
  const [data, setData] = useState<ProgressData>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAggregateData()
  }, [locationId, startDate, endDate])

  const fetchAggregateData = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      if (locationId) params.append('location_id', locationId.toString())
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await apiClient.get(`/stats/aggregate/progress?${params.toString()}`)
      setData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">loading progress data...</p>
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

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">no progress data yet</h3>
          <p className="text-gray-600">no climbs recorded across the network in this period!</p>
        </div>
      </div>
    )
  }

  // Group data by grade and aggregate by date
  const gradeByDate: { [grade: string]: { [date: string]: number } } = {}

  data.forEach(point => {
    if (!gradeByDate[point.grade]) {
      gradeByDate[point.grade] = {}
    }
    if (!gradeByDate[point.grade][point.date]) {
      gradeByDate[point.grade][point.date] = 0
    }
    gradeByDate[point.grade][point.date]++
  })

  // Create cumulative datasets for each grade (running total over time)
  const datasets = Object.keys(gradeByDate)
    .sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b))
    .map(grade => {
      // Get all dates for this grade and sort them
      const dates = Object.keys(gradeByDate[grade]).sort()

      // Calculate cumulative count
      let cumulative = 0
      const dataPoints = dates.map(date => {
        cumulative += gradeByDate[grade][date]
        return {
          x: date,
          y: cumulative
        }
      })

      return {
        label: grade,
        data: dataPoints,
        borderColor: getGradeColor(grade),
        backgroundColor: getGradeColor(grade),
        tension: 0.3,
        fill: false
      }
    })

  const chartData = {
    datasets
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">progress over time</h3>
      <div className="h-80">
        <Line
          data={chartData}
          options={{
            ...lineChartOptions,
            maintainAspectRatio: false
          }}
        />
      </div>
    </div>
  )
}

export default AggregateProgressChart
