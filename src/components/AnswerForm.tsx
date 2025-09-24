import { useState, useEffect } from 'react'
import { MoodRating } from './MoodRating'

interface AnswerFormProps {
  questionId: string
  existingAnswer?: {
    id: number
    content: string
    mood_rating?: number
  }
  onSave: (content: string, moodRating?: number) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function AnswerForm({
  questionId,
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
      alert('답변을 입력해주세요.')
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 텍스트 에어리어 */}
      <div className="space-y-2">
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
          당신의 답변을 들려주세요
        </label>

        <textarea
          id="answer"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          placeholder="오늘의 질문에 대한 솔직한 답변을 작성해보세요..."
          rows={8}
          className={`
            w-full px-4 py-3 border border-gray-300 rounded-lg resize-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
            ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
        />

        {/* 단어 수 표시 */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>최소 1단어 이상 작성해주세요</span>
          <span>{wordCount}개 단어</span>
        </div>
      </div>

      {/* 기분 점수 선택 */}
      <MoodRating
        value={moodRating}
        onChange={setMoodRating}
        disabled={isLoading}
      />

      {/* 버튼들 */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className={`
            flex-1 py-3 px-6 rounded-lg font-medium transition-all
            ${isLoading || !content.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              저장 중...
            </div>
          ) : (
            existingAnswer ? '답변 수정' : '답변 저장'
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        )}
      </div>

      {/* 도움말 */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        💡 <strong>팁:</strong> 솔직하고 자유롭게 작성해보세요. 기분 점수는 나중에 통계로 활용됩니다.
      </div>
    </form>
  )
}