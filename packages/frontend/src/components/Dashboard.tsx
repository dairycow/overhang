import { useState, useEffect } from 'react'
import { Location } from '../types'
import apiClient from '../services/api'
import ProgressChart from './charts/ProgressChart'
import DistributionChart from './charts/DistributionChart'
import AggregateProgressChart from './charts/AggregateProgressChart'
import AggregateDistributionChart from './charts/AggregateDistributionChart'

function Dashboard() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(undefined)
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [useCustomDateRange, setUseCustomDateRange] = useState(false)
  const [viewMode, setViewMode] = useState<'personal' | 'aggregate'>('personal')

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await apiClient.get('/locations')
      setLocations(response.data)
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'all') => {
    setPeriod(newPeriod)
    setUseCustomDateRange(false)

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    if (newPeriod === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      setStartDate(weekAgo.toISOString().split('T')[0])
      setEndDate(todayStr)
    } else if (newPeriod === 'month') {
      const monthAgo = new Date(today)
      monthAgo.setDate(today.getDate() - 30)
      setStartDate(monthAgo.toISOString().split('T')[0])
      setEndDate(todayStr)
    } else {
      // 'all'
      setStartDate('')
      setEndDate('')
    }
  }

  const handleCustomDateToggle = () => {
    setUseCustomDateRange(!useCustomDateRange)
    if (useCustomDateRange) {
      setStartDate('')
      setEndDate('')
    }
  }

  const clearFilters = () => {
    setSelectedLocationId(undefined)
    setPeriod('all')
    setUseCustomDateRange(false)
    setStartDate('')
    setEndDate('')
    setViewMode('personal')
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">filters</h2>

        {/* View Mode Toggle */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            data view
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('personal')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition ${
                viewMode === 'personal'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              my stats
            </button>
            <button
              onClick={() => setViewMode('aggregate')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition ${
                viewMode === 'aggregate'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              aggregate
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {viewMode === 'personal'
              ? 'viewing your personal climbing statistics'
              : 'viewing aggregate statistics from all climbers in the network'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              location
            </label>
            <select
              value={selectedLocationId || ''}
              onChange={(e) => setSelectedLocationId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">all locations</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              time period
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePeriodChange('week')}
                className={`px-3 py-2 text-sm rounded-md ${
                  period === 'week' && !useCustomDateRange
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                week
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-3 py-2 text-sm rounded-md ${
                  period === 'month' && !useCustomDateRange
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                month
              </button>
              <button
                onClick={() => handlePeriodChange('all')}
                className={`px-3 py-2 text-sm rounded-md ${
                  period === 'all' && !useCustomDateRange
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                all
              </button>
            </div>
          </div>

          {/* Custom Date Range Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              custom range
            </label>
            <button
              onClick={handleCustomDateToggle}
              className={`w-full px-3 py-2 text-sm rounded-md ${
                useCustomDateRange
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {useCustomDateRange ? 'using custom range' : 'set custom range'}
            </button>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {useCustomDateRange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                end date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>
        )}

        {/* Clear Filters Button */}
        {(selectedLocationId || period !== 'all' || useCustomDateRange) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {viewMode === 'personal' ? (
          <>
            <ProgressChart
              locationId={selectedLocationId}
              startDate={startDate || undefined}
              endDate={endDate || undefined}
            />
            <DistributionChart
              locationId={selectedLocationId}
              period={useCustomDateRange ? 'all' : period}
            />
          </>
        ) : (
          <>
            <AggregateProgressChart
              locationId={selectedLocationId}
              startDate={startDate || undefined}
              endDate={endDate || undefined}
            />
            <AggregateDistributionChart
              locationId={selectedLocationId}
              period={useCustomDateRange ? 'all' : period}
            />
          </>
        )}
      </div>

    </div>
  )
}

export default Dashboard
