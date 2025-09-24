import { useState } from 'react'

export interface SearchFilters {
  searchQuery: string
  categoryFilter: string
  moodFilter: { min?: number; max?: number }
  dateFilter: { start?: string; end?: string }
}

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void
  loading?: boolean
}

const categories = [
  { value: '', label: '모든 카테고리' },
  { value: 'personal_growth', label: '개인성장' },
  { value: 'relationships', label: '인간관계' },
  { value: 'goals', label: '목표설정' },
  { value: 'creativity', label: '창의성' },
  { value: 'reflection', label: '성찰' },
  { value: 'gratitude', label: '감사' }
]

export function SearchFilter({ onSearch, loading = false }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [minMood, setMinMood] = useState<number | undefined>()
  const [maxMood, setMaxMood] = useState<number | undefined>()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearch = () => {
    const filters: SearchFilters = {
      searchQuery,
      categoryFilter,
      moodFilter: {
        min: minMood,
        max: maxMood
      },
      dateFilter: {
        start: startDate || undefined,
        end: endDate || undefined
      }
    }
    onSearch(filters)
  }

  const handleReset = () => {
    setSearchQuery('')
    setCategoryFilter('')
    setMinMood(undefined)
    setMaxMood(undefined)
    setStartDate('')
    setEndDate('')

    // 리셋된 필터로 검색
    const filters: SearchFilters = {
      searchQuery: '',
      categoryFilter: '',
      moodFilter: {},
      dateFilter: {}
    }
    onSearch(filters)
  }

  const hasActiveFilters = categoryFilter || minMood !== undefined || maxMood !== undefined || startDate || endDate

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-6">
      {/* 검색 입력 */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="답변 내용이나 질문을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-white/50 rounded-2xl
                     focus:border-purple-300 focus:ring-4 focus:ring-purple-100
                     transition-all duration-300 text-gray-800 placeholder-gray-400"
            disabled={loading}
          />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
            hasActiveFilters
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-white/80 text-gray-600 border-2 border-white/50 hover:bg-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>🎛️</span>
            <span>필터</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-white rounded-full"></span>
            )}
          </div>
        </button>

        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>검색 중...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>🔍</span>
              <span>검색</span>
            </div>
          )}
        </button>
      </div>

      {/* 상세 필터 (접이식) */}
      {isExpanded && (
        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-6 rounded-2xl border border-purple-100/50 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-lg">⚙️</span>
            <h3 className="text-lg font-semibold text-purple-700">상세 필터</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">카테고리</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 기분 점수 최소값 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">기분 (최소)</label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                value={minMood || ''}
                onChange={(e) => setMinMood(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            {/* 기분 점수 최대값 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">기분 (최대)</label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                value={maxMood || ''}
                onChange={(e) => setMaxMood(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            {/* 날짜 범위 - 시작일 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">시작 날짜</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            {/* 날짜 범위 - 종료일 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">종료 날짜</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>

          {/* 필터 액션 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/80 text-gray-600 rounded-xl border border-gray-200 hover:bg-white transition-all duration-200"
            >
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  )
}