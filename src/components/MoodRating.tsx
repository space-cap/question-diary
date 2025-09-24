interface MoodRatingProps {
  value?: number
  onChange: (rating: number) => void
  disabled?: boolean
}

export function MoodRating({ value, onChange, disabled = false }: MoodRatingProps) {
  const ratings = [
    { value: 1, emoji: '😢', label: '매우 나쁨' },
    { value: 2, emoji: '😟', label: '나쁨' },
    { value: 3, emoji: '😐', label: '보통 이하' },
    { value: 4, emoji: '🙂', label: '보통' },
    { value: 5, emoji: '😊', label: '좋음' },
    { value: 6, emoji: '😄', label: '꽤 좋음' },
    { value: 7, emoji: '😁', label: '매우 좋음' },
    { value: 8, emoji: '🤩', label: '훌륭함' },
    { value: 9, emoji: '🥳', label: '최고' },
    { value: 10, emoji: '🚀', label: '완벽' }
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        오늘의 기분은 어떠신가요? (선택사항)
      </label>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(rating.value)}
            className={`
              flex flex-col items-center p-2 rounded-lg border-2 transition-all
              ${value === rating.value
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={rating.label}
          >
            <span className="text-lg">{rating.emoji}</span>
            <span className="text-xs text-gray-600 mt-1">{rating.value}</span>
          </button>
        ))}
      </div>

      {value && (
        <div className="text-center">
          <span className="text-sm text-gray-600">
            선택된 기분: <span className="font-medium">{ratings[value - 1].label}</span> ({value}/10)
          </span>
        </div>
      )}
    </div>
  )
}