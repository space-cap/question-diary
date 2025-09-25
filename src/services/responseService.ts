import { supabase } from '../lib/supabase'
import type { Response } from '../lib/supabase'

/**
 * 답변 관리를 위한 서비스 (인증된 사용자 전용)
 */
export class ResponseService {
  /**
   * 새로운 답변을 저장합니다
   */
  static async saveResponse(questionId: string, content: string, moodRating?: number): Promise<Response> {
    try {
      // 현재 로그인한 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const today = new Date().toISOString().split('T')[0]

      const responseData = {
        user_id: user.id,
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
  static async updateResponse(responseId: number, content: string, moodRating?: number): Promise<Response> {
    try {
      // 현재 로그인한 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const responseData = {
        content: content.trim(),
        mood_rating: moodRating || null
      }

      console.log('✏️ 답변 수정 중...', responseData)

      const { data, error } = await supabase
        .from('responses')
        .update(responseData)
        .eq('id', responseId)
        .eq('user_id', user.id) // 사용자별 데이터 격리
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
  static async getResponseByDate(date: string): Promise<Response | null> {
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

  /**
   * 모든 답변 히스토리를 조회합니다 (페이지네이션 지원)
   */
  static async getResponseHistory(limit = 10, offset = 0): Promise<DailySummary[]> {
    try {
      const { data, error } = await supabase
        .from('daily_summary')
        .select('*')
        .eq('is_completed', true) // 답변이 있는 것만 조회
        .order('assigned_date', { ascending: false }) // 최신순
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ 답변 히스토리 조회 실패:', error)
      throw error
    }
  }

  /**
   * 답변 히스토리 총 개수를 조회합니다
   */
  static async getResponseHistoryCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('daily_summary')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('❌ 답변 히스토리 개수 조회 실패:', error)
      throw error
    }
  }

  /**
   * 답변 검색 (내용 기반)
   */
  static async searchResponses(
    searchQuery: string,
    categoryFilter?: string,
    moodFilter?: { min?: number; max?: number },
    dateFilter?: { start?: string; end?: string },
    limit = 20,
    offset = 0
  ): Promise<DailySummary[]> {
    try {
      let query = supabase
        .from('daily_summary')
        .select('*')
        .eq('is_completed', true)

      // 텍스트 검색
      if (searchQuery.trim()) {
        query = query.or(`response_content.ilike.%${searchQuery}%,question_content.ilike.%${searchQuery}%`)
      }

      // 카테고리 필터
      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      // 기분 점수 필터
      if (moodFilter) {
        if (moodFilter.min !== undefined) {
          query = query.gte('mood_rating', moodFilter.min)
        }
        if (moodFilter.max !== undefined) {
          query = query.lte('mood_rating', moodFilter.max)
        }
      }

      // 날짜 범위 필터
      if (dateFilter) {
        if (dateFilter.start) {
          query = query.gte('assigned_date', dateFilter.start)
        }
        if (dateFilter.end) {
          query = query.lte('assigned_date', dateFilter.end)
        }
      }

      const { data, error } = await query
        .order('assigned_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ 답변 검색 실패:', error)
      throw error
    }
  }

  /**
   * 검색 결과 개수
   */
  static async getSearchResultCount(
    searchQuery: string,
    categoryFilter?: string,
    moodFilter?: { min?: number; max?: number },
    dateFilter?: { start?: string; end?: string }
  ): Promise<number> {
    try {
      let query = supabase
        .from('daily_summary')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)

      // 텍스트 검색
      if (searchQuery.trim()) {
        query = query.or(`response_content.ilike.%${searchQuery}%,question_content.ilike.%${searchQuery}%`)
      }

      // 카테고리 필터
      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      // 기분 점수 필터
      if (moodFilter) {
        if (moodFilter.min !== undefined) {
          query = query.gte('mood_rating', moodFilter.min)
        }
        if (moodFilter.max !== undefined) {
          query = query.lte('mood_rating', moodFilter.max)
        }
      }

      // 날짜 범위 필터
      if (dateFilter) {
        if (dateFilter.start) {
          query = query.gte('assigned_date', dateFilter.start)
        }
        if (dateFilter.end) {
          query = query.lte('assigned_date', dateFilter.end)
        }
      }

      const { count, error } = await query

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('❌ 검색 결과 개수 조회 실패:', error)
      throw error
    }
  }
}