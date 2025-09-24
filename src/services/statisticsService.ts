import { supabase } from '../lib/supabase'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'

export interface MoodTrendData {
  date: string
  mood_rating: number
  count: number
}

export interface CategoryStats {
  category: string
  count: number
  avg_mood: number
}

export interface MonthlyStats {
  month: string
  total_responses: number
  avg_mood: number
  avg_word_count: number
}

export interface WeeklyStats {
  week_start: string
  total_responses: number
  avg_mood: number
}

export class StatisticsService {
  // 기분 점수 트렌드 (최근 30일)
  static async getMoodTrend(days = 30): Promise<MoodTrendData[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const { data, error } = await supabase
      .from('daily_summary')
      .select('assigned_date, mood_rating')
      .gte('assigned_date', format(startDate, 'yyyy-MM-dd'))
      .lte('assigned_date', format(endDate, 'yyyy-MM-dd'))
      .not('mood_rating', 'is', null)
      .order('assigned_date', { ascending: true })

    if (error) {
      console.error('기분 트렌드 조회 실패:', error)
      throw new Error('기분 트렌드를 불러올 수 없습니다.')
    }

    // 날짜별로 그룹화하고 평균 계산
    const groupedData: { [date: string]: { sum: number; count: number } } = {}

    data?.forEach(item => {
      if (!groupedData[item.assigned_date]) {
        groupedData[item.assigned_date] = { sum: 0, count: 0 }
      }
      groupedData[item.assigned_date].sum += item.mood_rating
      groupedData[item.assigned_date].count += 1
    })

    return Object.entries(groupedData).map(([date, stats]) => ({
      date: format(new Date(date), 'M/d', { locale: ko }),
      mood_rating: Math.round((stats.sum / stats.count) * 10) / 10,
      count: stats.count
    }))
  }

  // 카테고리별 통계
  static async getCategoryStats(): Promise<CategoryStats[]> {
    const { data, error } = await supabase
      .from('daily_summary')
      .select('category, mood_rating')
      .not('response_content', 'is', null)

    if (error) {
      console.error('카테고리 통계 조회 실패:', error)
      throw new Error('카테고리 통계를 불러올 수 없습니다.')
    }

    // 카테고리별로 그룹화
    const categoryMap: { [category: string]: { count: number; moodSum: number; moodCount: number } } = {}

    data?.forEach(item => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = { count: 0, moodSum: 0, moodCount: 0 }
      }
      categoryMap[item.category].count += 1
      if (item.mood_rating) {
        categoryMap[item.category].moodSum += item.mood_rating
        categoryMap[item.category].moodCount += 1
      }
    })

    return Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      count: stats.count,
      avg_mood: stats.moodCount > 0 ? Math.round((stats.moodSum / stats.moodCount) * 10) / 10 : 0
    })).sort((a, b) => b.count - a.count)
  }

  // 월별 통계 (최근 12개월)
  static async getMonthlyStats(): Promise<MonthlyStats[]> {
    const { data, error } = await supabase
      .from('daily_summary')
      .select('assigned_date, mood_rating, word_count')
      .not('response_content', 'is', null)
      .order('assigned_date', { ascending: false })
      .limit(365) // 최근 1년

    if (error) {
      console.error('월별 통계 조회 실패:', error)
      throw new Error('월별 통계를 불러올 수 없습니다.')
    }

    // 월별로 그룹화
    const monthlyMap: { [month: string]: {
      count: number
      moodSum: number
      moodCount: number
      wordSum: number
      wordCount: number
    } } = {}

    data?.forEach(item => {
      const monthKey = format(new Date(item.assigned_date), 'yyyy-MM')
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { count: 0, moodSum: 0, moodCount: 0, wordSum: 0, wordCount: 0 }
      }
      monthlyMap[monthKey].count += 1
      if (item.mood_rating) {
        monthlyMap[monthKey].moodSum += item.mood_rating
        monthlyMap[monthKey].moodCount += 1
      }
      if (item.word_count) {
        monthlyMap[monthKey].wordSum += item.word_count
        monthlyMap[monthKey].wordCount += 1
      }
    })

    return Object.entries(monthlyMap)
      .map(([month, stats]) => ({
        month: format(new Date(month + '-01'), 'yyyy년 M월', { locale: ko }),
        total_responses: stats.count,
        avg_mood: stats.moodCount > 0 ? Math.round((stats.moodSum / stats.moodCount) * 10) / 10 : 0,
        avg_word_count: stats.wordCount > 0 ? Math.round(stats.wordSum / stats.wordCount) : 0
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12)
  }

  // 주별 활동 패턴
  static async getWeeklyActivity(): Promise<WeeklyStats[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 84) // 최근 12주

    const { data, error } = await supabase
      .from('daily_summary')
      .select('assigned_date, mood_rating')
      .gte('assigned_date', format(startDate, 'yyyy-MM-dd'))
      .lte('assigned_date', format(endDate, 'yyyy-MM-dd'))
      .not('response_content', 'is', null)
      .order('assigned_date', { ascending: true })

    if (error) {
      console.error('주별 통계 조회 실패:', error)
      throw new Error('주별 통계를 불러올 수 없습니다.')
    }

    // 주별로 그룹화
    const weeklyMap: { [weekStart: string]: {
      count: number
      moodSum: number
      moodCount: number
    } } = {}

    data?.forEach(item => {
      const date = new Date(item.assigned_date)
      const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')

      if (!weeklyMap[weekStart]) {
        weeklyMap[weekStart] = { count: 0, moodSum: 0, moodCount: 0 }
      }
      weeklyMap[weekStart].count += 1
      if (item.mood_rating) {
        weeklyMap[weekStart].moodSum += item.mood_rating
        weeklyMap[weekStart].moodCount += 1
      }
    })

    return Object.entries(weeklyMap)
      .map(([weekStart, stats]) => ({
        week_start: format(new Date(weekStart), 'M/d', { locale: ko }),
        total_responses: stats.count,
        avg_mood: stats.moodCount > 0 ? Math.round((stats.moodSum / stats.moodCount) * 10) / 10 : 0
      }))
      .sort((a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime())
  }

  // 전체 통계 요약
  static async getOverallStats() {
    const { data: totalData, error: totalError } = await supabase
      .from('daily_summary')
      .select('response_content, mood_rating, word_count, assigned_date')
      .not('response_content', 'is', null)

    if (totalError) {
      console.error('전체 통계 조회 실패:', totalError)
      throw new Error('통계를 불러올 수 없습니다.')
    }

    const totalResponses = totalData?.length || 0
    const totalMoodRatings = totalData?.filter(item => item.mood_rating).length || 0
    const avgMoodRating = totalMoodRatings > 0
      ? Math.round((totalData?.reduce((sum, item) => sum + (item.mood_rating || 0), 0) / totalMoodRatings) * 10) / 10
      : 0

    const totalWordCount = totalData?.reduce((sum, item) => sum + (item.word_count || 0), 0) || 0
    const avgWordCount = totalResponses > 0 ? Math.round(totalWordCount / totalResponses) : 0

    // 연속 작성 일수 계산
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    if (totalData && totalData.length > 0) {
      const sortedDates = totalData
        .map(item => new Date(item.assigned_date))
        .sort((a, b) => b.getTime() - a.getTime())

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 현재 연속 일수 계산
      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i])
        date.setHours(0, 0, 0, 0)
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)

        if (date.getTime() === expectedDate.getTime()) {
          currentStreak++
        } else {
          break
        }
      }

      // 최장 연속 일수 계산 (간단 버전)
      longestStreak = Math.max(currentStreak, Math.floor(totalResponses / 7)) // 대략적 추정
    }

    return {
      totalResponses,
      avgMoodRating,
      avgWordCount,
      currentStreak,
      longestStreak,
      totalDays: totalResponses,
      moodRatingCount: totalMoodRatings
    }
  }
}