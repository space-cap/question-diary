import { supabase } from '../lib/supabase'

/**
 * 오늘의 질문을 가져오는 서비스
 */
export class QuestionService {
  // supabase 인스턴스를 다른 서비스에서도 사용할 수 있도록 노출
  static supabase = supabase
  /**
   * 오늘 날짜의 질문과 답변 정보를 가져옵니다
   */
  static async getTodayQuestion() {
    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식

      const { data, error } = await supabase
        .from('daily_summary')
        .select('*')
        .eq('assigned_date', today)
        .single()

      if (error) {
        // 오늘의 질문이 할당되지 않은 경우
        if (error.code === 'PGRST116') {
          console.warn('⚠️ 오늘의 질문이 아직 할당되지 않았습니다.')
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('❌ 오늘의 질문 조회 중 오류:', error)
      throw error
    }
  }

  /**
   * 모든 질문 목록을 가져옵니다 (관리용)
   */
  static async getAllQuestions(limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data
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

      const { data, error } = await supabase
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