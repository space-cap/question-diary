import { supabase } from '../lib/supabase'
import type { Question, DailyQuestion, Response } from '../lib/supabase'

/**
 * 오늘의 질문을 가져오는 서비스 (인증된 사용자 전용)
 */
export class QuestionService {
  // supabase 인스턴스를 다른 서비스에서도 사용할 수 있도록 노출
  static supabase = supabase

  /**
   * 오늘 날짜의 질문과 사용자 답변 정보를 가져옵니다
   */
  static async getTodayQuestion(userId?: string): Promise<any | null> {
    try {
      console.log('🔍 QuestionService.getTodayQuestion 시작')

      // 사용자 ID가 전달되지 않은 경우에만 getUser 호출
      let user: any = null
      if (userId) {
        user = { id: userId }
        console.log('👤 전달받은 사용자 ID:', userId)
      } else {
        // 현재 로그인한 사용자 확인 (timeout 추가)
        const getUserPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getUser timeout')), 5000)
        )

        const result = await Promise.race([getUserPromise, timeoutPromise]) as any
        user = result.data.user
        console.log('👤 사용자 확인:', user?.email)
      }

      if (!user) throw new Error('로그인이 필요합니다.')

      const today = new Date().toISOString().split('T')[0]
      console.log('📅 오늘 날짜:', today)

      // 오늘의 질문 가져오기 (timeout 추가)
      console.log('📥 daily_questions 쿼리 시작...')

      // 단계별로 쿼리를 분리하여 안정성 확보
      const dailyQuestionPromise = supabase
        .from('daily_questions')
        .select(`
          id,
          assigned_date,
          question_id
        `)
        .eq('assigned_date', today)
        .single()

      const queryTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('daily_questions 쿼리 timeout')), 10000)
      )

      const { data: dailyQuestion, error: dailyError } = await Promise.race([
        dailyQuestionPromise,
        queryTimeoutPromise
      ]) as any

      console.log('📋 daily_questions 쿼리 결과:', { dailyQuestion, error: dailyError })

      if (dailyError) {
        if (dailyError.code === 'PGRST116') {
          console.warn('⚠️ 오늘의 질문이 아직 할당되지 않았습니다.')
          return null
        }
        console.error('❌ daily_questions 쿼리 오류:', dailyError)
        throw dailyError
      }

      // 질문 정보 별도 조회
      console.log('📥 질문 정보 조회 시작...', { question_id: dailyQuestion.question_id })

      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', dailyQuestion.question_id)
        .single()

      console.log('📋 질문 정보 쿼리 결과:', { questionData, error: questionError })

      if (questionError) {
        console.error('❌ 질문 정보 조회 오류:', questionError)
        throw questionError
      }

      // 사용자의 답변 확인
      console.log('📥 사용자 응답 쿼리 시작...', {
        user_id: user.id,
        question_id: questionData.id,
        response_date: today
      })

      const { data: userResponse, error: responseError } = await supabase
        .from('responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionData.id)
        .eq('response_date', today)
        .single()

      console.log('📋 사용자 응답 쿼리 결과:', { userResponse, error: responseError })

      // 응답 에러는 무시 (답변이 없을 수 있음)
      if (responseError && responseError.code !== 'PGRST116') {
        console.warn('답변 조회 중 오류:', responseError)
      }

      const result = {
        ...questionData,
        user_response: userResponse,
        daily_question_id: dailyQuestion.id,
        assigned_date: dailyQuestion.assigned_date,
        // 호환성을 위한 필드들
        question_content: questionData.text,
        category: questionData.category || 'general',
        response_content: userResponse?.content || null,
        response_id: userResponse?.id || null,
        mood_rating: userResponse?.mood_rating || null
      }

      console.log('✅ QuestionService.getTodayQuestion 완료:', result)
      return result
    } catch (error) {
      console.error('❌ 오늘의 질문 조회 중 오류:', error)
      throw error
    }
  }

  /**
   * 모든 질문 목록을 가져옵니다 (관리용)
   */
  static async getAllQuestions(limit = 10, offset = 0): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ 질문 목록 조회 중 오류:', error)
      throw error
    }
  }

  /**
   * 연결 테스트용 함수
   */
  static async testConnection() {
    try {
      console.log('🔍 Supabase 연결 테스트 중...')

      const { error } = await supabase
        .from('questions')
        .select('count')
        .limit(1)

      if (error) throw error

      console.log('✅ Supabase 연결 성공!')
      return true
    } catch (error) {
      console.error('❌ Supabase 연결 실패:', error)
      return false
    }
  }
}