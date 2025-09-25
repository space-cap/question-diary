import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { QuestionService } from '../services/questionService'
import { ResponseService } from '../services/responseService'
import { AnswerForm } from '../components/AnswerForm'
import type { ConnectionStatus, DailySummary } from '../types'

export function HomePage() {
  const { user } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading')
  const [todayQuestion, setTodayQuestion] = useState<DailySummary | null>(null)
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 카테고리 스타일 함수
  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      'personal_growth': 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      'relationships': 'bg-gradient-to-r from-pink-400 to-rose-500 text-white',
      'goals': 'bg-gradient-to-r from-purple-400 to-violet-500 text-white',
      'creativity': 'bg-gradient-to-r from-orange-400 to-amber-500 text-white',
      'reflection': 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
      'gratitude': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
    }
    return styles[category] || 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
  }

  // 카테고리 한국어 이름
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
    if (!rating) return '😐'
    if (rating <= 3) return '😞'
    if (rating <= 5) return '😐'
    if (rating <= 7) return '🙂'
    if (rating <= 9) return '😊'
    return '🥳'
  }

  useEffect(() => {
    // 사용자가 로그인되어 있을 때만 질문 로드
    if (!user) {
      console.log('⚠️ 사용자가 로그인되지 않았습니다.')
      return
    }

    // 오늘의 질문 로드
    const initializeApp = async () => {
      try {
        console.log('🔍 오늘의 질문 가져오는 중...')

        // 사용자 ID를 전달하여 오늘의 질문 가져오기
        const question = await QuestionService.getTodayQuestion(user.id)
        console.log('📋 QuestionService 응답:', question)

        if (question) {
          setTodayQuestion(question)
          setConnectionStatus('connected')
          console.log('✅ 질문 로드 성공:', question)
        } else {
          console.log('⚠️ 질문이 null입니다.')
          setConnectionStatus('error')
        }
      } catch (error) {
        console.error('❌ 초기화 중 오류:', error)
        setConnectionStatus('error')
      }
    }

    initializeApp()
  }, [user])

  // 답변 저장 핸들러
  const handleSaveAnswer = async (content: string, moodRating?: number) => {
    if (!todayQuestion) return

    setIsLoading(true)

    // 로딩 토스트 표시
    const loadingToast = toast.loading('답변을 저장하는 중...')

    try {
      const questionUuid = todayQuestion.question_content ?
        // daily_summary 뷰에서 question_id 가져오기 위해 별도 쿼리 필요
        await getQuestionIdFromSummary(todayQuestion.assigned_date) :
        null

      if (!questionUuid) {
        throw new Error('질문 ID를 찾을 수 없습니다.')
      }

      await ResponseService.saveResponse(questionUuid, content, moodRating)

      // 성공 후 오늘의 질문 다시 로드 (답변 포함)
      const updatedQuestion = await QuestionService.getTodayQuestion()
      setTodayQuestion(updatedQuestion)
      setShowAnswerForm(false)

      // 로딩 토스트 제거하고 성공 토스트 표시
      toast.dismiss(loadingToast)
      toast.success('답변이 성공적으로 저장되었습니다! 🎉')
    } catch (error: any) {
      console.error('답변 저장 실패:', error)
      // 로딩 토스트 제거하고 에러 토스트 표시
      toast.dismiss(loadingToast)
      toast.error(`답변 저장에 실패했습니다: ${error.message || '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 답변 수정 핸들러
  const handleUpdateAnswer = async (content: string, moodRating?: number) => {
    if (!todayQuestion || !todayQuestion.response_id) return

    setIsLoading(true)

    // 로딩 토스트 표시
    const loadingToast = toast.loading('답변을 수정하는 중...')

    try {
      await ResponseService.updateResponse(todayQuestion.response_id, content, moodRating)

      // 성공 후 오늘의 질문 다시 로드 (수정된 답변 포함)
      const updatedQuestion = await QuestionService.getTodayQuestion()
      setTodayQuestion(updatedQuestion)
      setIsEditing(false)

      // 로딩 토스트 제거하고 성공 토스트 표시
      toast.dismiss(loadingToast)
      toast.success('답변이 성공적으로 수정되었습니다! ✏️')
    } catch (error: any) {
      console.error('답변 수정 실패:', error)
      // 로딩 토스트 제거하고 에러 토스트 표시
      toast.dismiss(loadingToast)
      toast.error(`답변 수정에 실패했습니다: ${error.message || '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // daily_summary에서 실제 question_id를 가져오는 헬퍼 함수
  const getQuestionIdFromSummary = async (date: string) => {
    try {
      const { data } = await QuestionService.supabase
        .from('daily_questions')
        .select('question_id')
        .eq('assigned_date', date)
        .single()

      return data?.question_id || null
    } catch (error) {
      console.error('Question ID 조회 실패:', error)
      return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 연결 상태 표시 */}
      <div className="mb-8">
        {connectionStatus === 'loading' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-600">
              <div className="w-6 h-6 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
              <span className="text-purple-700 dark:text-purple-300 font-medium">연결 중...</span>
            </div>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-900/30 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="text-lg">✨</span>
              <span className="font-medium">준비 완료!</span>
            </div>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-3 bg-red-50/70 dark:bg-red-900/30 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-red-100 dark:border-red-800">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-red-700 dark:text-red-400 font-medium">연결 실패</p>
                <p className="text-red-600 dark:text-red-300 text-sm">환경변수를 확인해주세요</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 오늘의 질문 표시 */}
      {connectionStatus === 'connected' && todayQuestion && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">✨</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  오늘의 질문
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(todayQuestion.assigned_date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`
                inline-block px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm
                ${getCategoryStyle(todayQuestion.category)}
              `}>
                {getCategoryName(todayQuestion.category)}
              </span>
            </div>
          </div>

          {/* 질문 내용 */}
          <div className="mb-8 p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100/50 dark:border-purple-800/50">
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              {todayQuestion.question_content}
            </p>
          </div>

          {/* 답변 섹션 */}
          {todayQuestion.response_content && (
            <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💭</span>
                  <h3 className="font-bold text-emerald-700 dark:text-emerald-400">내 답변</h3>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="group flex items-center space-x-2 px-4 py-2 bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-600 rounded-xl text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>✏️</span>
                  <span>수정</span>
                </button>
              </div>

              <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl mb-4">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{todayQuestion.response_content}</p>
              </div>

              {todayQuestion.mood_rating && (
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getMoodEmoji(todayQuestion.mood_rating)}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    오늘의 기분: {todayQuestion.mood_rating}/10
                  </span>
                </div>
              )}
            </div>
          )}

          {!todayQuestion.response_content && !showAnswerForm && (
            <div className="mt-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">아직 답변하지 않았습니다.</p>
              <button
                onClick={() => setShowAnswerForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium"
              >
                답변 작성하기
              </button>
            </div>
          )}

          {(showAnswerForm && !todayQuestion.response_content) && (
            <div className="mt-6">
              <AnswerForm
                questionId="" // 실제로는 getQuestionIdFromSummary에서 가져옴
                onSave={handleSaveAnswer}
                onCancel={() => setShowAnswerForm(false)}
                isLoading={isLoading}
              />
            </div>
          )}

          {isEditing && todayQuestion.response_content && (
            <div className="mt-6">
              <AnswerForm
                questionId=""
                existingAnswer={{
                  id: todayQuestion.response_id!,
                  content: todayQuestion.response_content!,
                  mood_rating: todayQuestion.mood_rating || undefined
                }}
                onSave={handleUpdateAnswer}
                onCancel={() => setIsEditing(false)}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      )}

      {connectionStatus === 'connected' && !todayQuestion && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          오늘의 질문을 불러올 수 없습니다.
        </div>
      )}
    </div>
  )
}