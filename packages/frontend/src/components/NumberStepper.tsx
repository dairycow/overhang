interface NumberStepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max,
  className = ''
}: NumberStepperProps) {
  const decrement = () => {
    const newValue = Math.max(min, value - 1)
    onChange(newValue)
  }

  const increment = () => {
    const newValue = max !== undefined ? Math.min(max, value + 1) : value + 1
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0
    const clampedValue = Math.max(min, max !== undefined ? Math.min(max, newValue) : newValue)
    onChange(clampedValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      increment()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      decrement()
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <label className="text-xs sm:text-sm text-gray-600 mb-1 text-center">
        {label}
      </label>
      <div className="flex items-center bg-white border border-gray-300 rounded-md">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-600 disabled:hover:bg-transparent touch-manipulation"
          aria-label={`Decrease ${label}`}
        >
          <span className="text-lg font-bold">−</span>
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-12 sm:w-16 text-center border-0 focus:ring-2 focus:ring-gray-500 text-sm sm:text-base font-medium"
          aria-label={label}
        />
        <button
          type="button"
          onClick={increment}
          disabled={max !== undefined && value >= max}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-600 disabled:hover:bg-transparent touch-manipulation"
          aria-label={`Increase ${label}`}
        >
          <span className="text-lg font-bold">+</span>
        </button>
      </div>
    </div>
  )
}

export default NumberStepper