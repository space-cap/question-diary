import type { DailySummary } from '../types'

interface ResponseCardProps {
  response: DailySummary
  onEdit?: (response: DailySummary) => void
}

export function ResponseCard({ response, onEdit }: ResponseCardProps) {
  // 날짜를 한국어로 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  // 카테고리 스타일 함수
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'personal_growth': 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      'relationships': 'bg-gradient-to-r from-pink-400 to-rose-500 text-white',
      'goals': 'bg-gradient-to-r from-purple-400 to-violet-500 text-white',
      'creativity': 'bg-gradient-to-r from-orange-400 to-amber-500 text-white',
      'reflection': 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
      'gratitude': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
    }
    return colors[category] || 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
  }

  // 카테고리 한국어 이름 매핑
  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'personal_growth': '개인성장',
      'relationships': '인간관계',
      'goals': '목표설정',
      'creativity': '창의성',
      'reflection': '성찰',
      'gratitude': '감사'
    }
    return names[category] || category
  }

  // 기분 점수에 따른 이모지
  const getMoodEmoji = (rating: number | null) => {
    if (!rating) return null
    if (rating <= 3) return '😞'
    if (rating <= 5) return '😐'
    if (rating <= 7) return '🙂'
    if (rating <= 9) return '😊'
    return '🥳'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 p-8">
      {/* 헤더: 날짜와 카테고리 */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">📖</span>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
              {formatDate(response.assigned_date)}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-sm font-semibold shadow-sm ${getCategoryColor(response.category)}`}>
              {getCategoryName(response.category)}
            </span>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={() => onEdit(response)}
            className="group flex items-center space-x-2 px-4 py-2 bg-white/70 hover:bg-white rounded-xl text-purple-600 hover:text-purple-700 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            title="답변 수정"
          >
            <span>✏️</span>
            <span>수정</span>
          </button>
        )}
      </div>

      {/* 질문 */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">❓</span>
          <h4 className="text-sm font-semibold text-purple-700">질문</h4>
        </div>
        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4 rounded-2xl border border-purple-100/50">
          <p className="text-gray-800 leading-relaxed font-medium">{response.question_content}</p>
        </div>
      </div>

      {/* 답변 */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">💭</span>
          <h4 className="text-sm font-semibold text-emerald-700">내 답변</h4>
        </div>
        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 p-4 rounded-2xl border border-emerald-100/50">
          <p className="text-gray-800 leading-relaxed">{response.response_content}</p>
        </div>
      </div>

      {/* 푸터: 기분 점수와 메타 정보 */}
      <div className="flex justify-between items-center pt-4 border-t border-gradient-to-r from-purple-100 to-pink-100">
        <div className="flex items-center space-x-4">
          {response.mood_rating && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-xl">
              <span className="text-lg">{getMoodEmoji(response.mood_rating)}</span>
              <span className="text-sm font-medium text-emerald-700">
                기분: {response.mood_rating}/10
              </span>
            </div>
          )}

          {response.word_count && (
            <div className="px-3 py-1 bg-white/60 rounded-xl text-sm font-medium text-gray-600">
              {response.word_count}개 단어
            </div>
          )}
        </div>

        {response.response_time && (
          <div className="px-3 py-1 bg-white/60 rounded-xl text-sm font-medium text-gray-600">
            {new Date(response.response_time).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  )
}