import { supabase } from '../lib/supabase'

/**
 * 답변 관리를 위한 서비스
 */
export class ResponseService {
  /**
   * 새로운 답변을 저장합니다
   */
  static async saveResponse(questionId: string, content: string, moodRating?: number) {
    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식

      const responseData = {
        question_id: questionId,
        content: content.trim(),
        response_date: today,
        mood_rating: moodRating || null
      }

      console.log('💾 답변 저장 중...', responseData)

      const { data, error } = await supabase
        .from('responses')
        .insert(responseData)
        .select()
        .single()

      if (error) {
        // 중복 답변 에러 (하루에 하나만 허용)
        if (error.code === '23505') {
          throw new Error('오늘은 이미 답변을 작성했습니다. 기존 답변을 수정해주세요.')
        }
        throw error
      }

      console.log('✅ 답변 저장 성공:', data)
      return data
    } catch (error) {
      console.error('❌ 답변 저장 실패:', error)
      throw error
    }
  }

  /**
   * 기존 답변을 수정합니다
   */
  static async updateResponse(responseId: number, content: string, moodRating?: number) {
    try {
      const responseData = {
        content: content.trim(),
        mood_rating: moodRating || null
      }

      console.log('✏️ 답변 수정 중...', responseData)

      const { data, error } = await supabase
        .from('responses')
        .update(responseData)
        .eq('id', responseId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ 답변 수정 성공:', data)
      return data
    } catch (error) {
      console.error('❌ 답변 수정 실패:', error)
      throw error
    }
  }

  /**
   * 답변을 삭제합니다
   */
  static async deleteResponse(responseId: number) {
    try {
      console.log('🗑️ 답변 삭제 중...', responseId)

      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseId)

      if (error) throw error

      console.log('✅ 답변 삭제 성공')
      return true
    } catch (error) {
      console.error('❌ 답변 삭제 실패:', error)
      throw error
    }
  }

  /**
   * 특정 날짜의 답변을 조회합니다
   */
  static async getResponseByDate(date: string) {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('response_date', date)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 해당 날짜에 답변이 없음
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('❌ 답변 조회 실패:', error)
      throw error
    }
  }
}