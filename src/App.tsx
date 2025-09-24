import { useState, useEffect } from 'react'
import { QuestionService } from './services/questionService'
import { ResponseService } from './services/responseService'
import { AnswerForm } from './components/AnswerForm'
import './App.css'

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [todayQuestion, setTodayQuestion] = useState<any>(null)
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 연결 테스트 및 오늘의 질문 로드
    const initializeApp = async () => {
      try {
        // 1. 연결 테스트
        const isConnected = await QuestionService.testConnection()

        if (!isConnected) {
          setConnectionStatus('error')
          return
        }

        // 2. 오늘의 질문 가져오기
        const question = await QuestionService.getTodayQuestion()
        setTodayQuestion(question)
        setConnectionStatus('connected')

        console.log('📋 오늘의 질문:', question)
      } catch (error) {
        console.error('초기화 중 오류:', error)
        setConnectionStatus('error')
      }
    }

    initializeApp()
  }, [])

  // 답변 저장 핸들러
  const handleSaveAnswer = async (content: string, moodRating?: number) => {
    if (!todayQuestion) return

    setIsLoading(true)
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

      alert('✅ 답변이 성공적으로 저장되었습니다!')
    } catch (error: any) {
      console.error('답변 저장 실패:', error)
      alert(`❌ 답변 저장 실패: ${error.message || '알 수 없는 오류'}`)
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Question Diary
        </h1>

        {/* 연결 상태 표시 */}
        <div className="mb-8 p-4 rounded-lg">
          {connectionStatus === 'loading' && (
            <div className="text-center text-blue-600">
              🔄 Supabase 연결 중...
            </div>
          )}

          {connectionStatus === 'connected' && (
            <div className="text-center text-green-600">
              ✅ 데이터베이스 연결 성공!
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="text-center text-red-600">
              ❌ 연결 실패. 환경변수를 확인해주세요.
            </div>
          )}
        </div>

        {/* 오늘의 질문 표시 */}
        {connectionStatus === 'connected' && todayQuestion && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              오늘의 질문 ({todayQuestion.assigned_date})
            </h2>

            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {todayQuestion.category}
              </span>
            </div>

            <p className="text-lg text-gray-800 leading-relaxed">
              {todayQuestion.question_content}
            </p>

            {todayQuestion.response_content && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">내 답변:</h3>
                <p className="text-gray-700">{todayQuestion.response_content}</p>
                {todayQuestion.mood_rating && (
                  <p className="text-sm text-gray-500 mt-2">
                    기분 점수: {todayQuestion.mood_rating}/10
                  </p>
                )}
              </div>
            )}

            {!todayQuestion.response_content && !showAnswerForm && (
              <div className="mt-6 text-center">
                <p className="text-gray-500 mb-4">아직 답변하지 않았습니다.</p>
                <button
                  onClick={() => setShowAnswerForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  답변 작성하기
                </button>
              </div>
            )}

            {showAnswerForm && !todayQuestion.response_content && (
              <div className="mt-6">
                <AnswerForm
                  questionId="" // 실제로는 getQuestionIdFromSummary에서 가져옴
                  onSave={handleSaveAnswer}
                  onCancel={() => setShowAnswerForm(false)}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        )}

        {connectionStatus === 'connected' && !todayQuestion && (
          <div className="text-center text-gray-500">
            오늘의 질문을 불러올 수 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}

export default App
