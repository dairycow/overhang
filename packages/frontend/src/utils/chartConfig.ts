// Chart.js configuration utilities for Overhang climbing tracker

import { ChartOptions } from 'chart.js'

// Grade colors from PRD (Section 5: Climbing Grades)
export const GRADE_COLORS = {
  'VB': '#3B82F6',   // Blue - Beginner
  'V0': '#EF4444',   // Red - Entry level
  'V3': '#A855F7',   // Purple - Intermediate
  'V4-V6': '#1F2937', // Black - Advanced
  'V6-V8': '#EAB308', // Yellow - Expert
  'V7-V10': '#F3F4F6' // White - Elite (with dark border)
}

// Grade ordering for charts
export const GRADE_ORDER = ['VB', 'V0', 'V3', 'V4-V6', 'V6-V8', 'V7-V10']

// Get color for a specific grade
export const getGradeColor = (grade: string): string => {
  return GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || '#6B7280'
}

// Get all grade colors in order
export const getGradeColors = (): string[] => {
  return GRADE_ORDER.map(grade => GRADE_COLORS[grade as keyof typeof GRADE_COLORS])
}

// Default chart options for all charts
export const defaultChartOptions: Partial<ChartOptions> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      }
    }
  }
}

// Line chart options (for progress over time)
export const lineChartOptions: ChartOptions<'line'> = {
  ...defaultChartOptions,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        displayFormats: {
          day: 'MMM d'
        }
      },
      title: {
        display: true,
        text: 'date',
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      grid: {
        display: false
      }
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      title: {
        display: true,
        text: 'cumulative sends',
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        precision: 0
      }
    }
  },
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 10,
        usePointStyle: true,
        pointStyle: 'rect',
        generateLabels: (chart) => {
          const data = chart.data
          if (data.datasets) {
            return data.datasets.map((dataset, i) => {
              return {
                text: '', // No text label, just color box
                fillStyle: dataset.borderColor as string,
                strokeStyle: dataset.borderColor as string,
                lineWidth: 2,
                hidden: false,
                index: i,
                pointStyle: 'rect' as const
              }
            })
          }
          return []
        }
      }
    },
    tooltip: {
      ...defaultChartOptions.plugins?.tooltip,
      callbacks: {
        title: (context) => {
          return context[0].label || ''
        },
        label: (context) => {
          const grade = context.dataset.label
          const value = context.parsed.y
          return `${grade}: ${value} sends`
        }
      }
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    line: {
      tension: 0.3,
      borderWidth: 2
    }
  }
}

// Pie chart options (for grade distribution)
export const pieChartOptions: Partial<ChartOptions<'pie'>> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 15,
        generateLabels: (chart) => {
          const data = chart.data
          if (data.labels && data.datasets.length) {
            return (data.labels as string[]).map((_, i) => {
              const value = data.datasets[0].data[i] as number
              const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return {
                text: `${percentage}%`,
                fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                hidden: false,
                index: i
              }
            })
          }
          return []
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      }
    }
  }
}

// Bar chart options (for network activity)
export const barChartOptions: ChartOptions<'bar'> = {
  ...defaultChartOptions,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Location',
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'sessions',
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        precision: 0
      }
    }
  },
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      display: false
    }
  }
}

// Convert grade string to numeric value for sorting/calculations
export const gradeToNumber = (grade: string): number => {
  return GRADE_ORDER.indexOf(grade)
}

// Format date for display
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
