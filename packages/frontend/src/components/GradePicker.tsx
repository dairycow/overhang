import { GRADE_COLORS, GRADE_ORDER } from '../utils/chartConfig'

interface GradePickerProps {
  value: string
  onChange: (grade: string) => void
}

function GradePicker({ value, onChange }: GradePickerProps) {
  return (
    <div className="flex space-x-1 sm:space-x-2">
      {GRADE_ORDER.map(grade => {
        const color = GRADE_COLORS[grade as keyof typeof GRADE_COLORS]
        const isSelected = value === grade
        const isWhite = color === '#F3F4F6'

        return (
          <button
            key={grade}
            type="button"
            onClick={() => onChange(grade)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded transition-all touch-manipulation ${
              isSelected
                ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-gray-900'
                : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-400'
            } ${isWhite ? 'border-2 border-gray-900' : ''}`}
            style={{ backgroundColor: color }}
            title={grade}
            aria-label={`Grade ${grade}`}
          />
        )
      })}
    </div>
  )
}

export default GradePicker
