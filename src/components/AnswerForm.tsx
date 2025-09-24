import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { MoodRating } from './MoodRating'
import type { AnswerFormProps } from '../types'

export function AnswerForm({
  questionId: _questionId, // 현재 사용하지 않으므로 _로 prefix
  existingAnswer,
  onSave,
  onCancel,
  isLoading = false
}: AnswerFormProps) {
  const [content, setContent] = useState(existingAnswer?.content || '')
  const [moodRating, setMoodRating] = useState<number | undefined>(existingAnswer?.mood_rating || undefined)
  const [wordCount, setWordCount] = useState(0)

  // 단어 수 계산
  useEffect(() => {
    const words = content.trim().split(/\s+/)
    setWordCount(content.trim() ? words.length : 0)
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('답변을 입력해주세요.')
      return
    }

    try {
      await onSave(content, moodRating)
    } catch (error) {
      // 에러는 부모 컴포넌트에서 처리
      console.error('답변 저장 중 오류:', error)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-6 rounded-3xl border border-purple-100/50 shadow-lg backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 헤더 */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">✍️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              당신의 답변을 들려주세요
            </h3>
            <p className="text-sm text-gray-500">솔직하고 자유롭게 작성해보세요</p>
          </div>
        </div>

        {/* 텍스트 에어리어 */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              id="answer"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              placeholder="오늘의 질문에 대한 솔직한 답변을 작성해보세요..."
              rows={8}
              className={`
                w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-2xl resize-none
                focus:border-purple-300 focus:ring-4 focus:ring-purple-100
                transition-all duration-300 text-gray-800 placeholder-gray-400
                shadow-lg hover:shadow-xl
                ${isLoading ? 'bg-gray-50/80 cursor-not-allowed' : ''}
              `}
            />
          </div>

          {/* 단어 수 표시 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-xl text-sm text-gray-600">
              <span>📝</span>
              <span>최소 1단어 이상 작성해주세요</span>
            </div>
            <div className="px-3 py-1 bg-white/60 rounded-xl text-sm font-medium text-purple-700">
              {wordCount}개 단어
            </div>
          </div>
        </div>

        {/* 기분 점수 선택 */}
        <div className="bg-white/60 p-4 rounded-2xl border border-white/50">
          <MoodRating
            value={moodRating}
            onChange={setMoodRating}
            disabled={isLoading}
          />
        </div>

        {/* 버튼들 */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className={`
              flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg
              ${isLoading || !content.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transform hover:scale-105'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                저장 중...
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>{existingAnswer ? '✏️' : '💾'}</span>
                <span>{existingAnswer ? '답변 수정' : '답변 저장'}</span>
              </div>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-4 bg-white/80 border-2 border-white/50 text-gray-600 rounded-2xl hover:bg-white hover:border-gray-200 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              취소
            </button>
          )}
        </div>

        {/* 도움말 */}
        <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100/50 shadow-sm">
          <div className="flex items-start space-x-2 text-sm text-amber-800">
            <span className="text-lg">💡</span>
            <div>
              <p className="font-medium mb-1">작성 팁</p>
              <p className="text-amber-700">솔직하고 자유롭게 작성해보세요. 기분 점수는 나중에 통계로 활용됩니다.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}