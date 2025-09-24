import type { MoodRatingProps, MoodRatingOption } from '../types'

export function MoodRating({ value, onChange, disabled = false }: MoodRatingProps) {
  const ratings: MoodRatingOption[] = [
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
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-lg">😊</span>
        <label className="text-sm font-semibold text-purple-700">
          오늘의 기분은 어떠신가요?
        </label>
        <span className="text-xs text-gray-500">(선택사항)</span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(rating.value)}
            className={`
              group flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300
              ${value === rating.value
                ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-110 ring-4 ring-purple-100'
                : 'border-white/50 bg-white/60 hover:border-purple-200 hover:bg-white hover:shadow-md hover:scale-105'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={rating.label}
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">
              {rating.emoji}
            </span>
            <span className={`text-xs mt-1 font-medium transition-colors duration-200 ${
              value === rating.value ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-600'
            }`}>
              {rating.value}
            </span>
          </button>
        ))}
      </div>

      {value && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-sm">
            <span className="text-lg">{ratings[value - 1].emoji}</span>
            <span className="text-sm font-medium text-purple-700">
              {ratings[value - 1].label} ({value}/10)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}