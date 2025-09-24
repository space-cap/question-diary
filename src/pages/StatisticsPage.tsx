import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { StatisticsService, type MoodTrendData, type CategoryStats, type MonthlyStats } from '../services/statisticsService'

// 카테고리 한국어 매핑
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

// 차트 색상 팔레트
const COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#84cc16'
]

export function StatisticsPage() {
  const [loading, setLoading] = useState(true)
  const [moodTrend, setMoodTrend] = useState<MoodTrendData[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [overallStats, setOverallStats] = useState<any>(null)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)

      const [mood, category, monthly, overall] = await Promise.all([
        StatisticsService.getMoodTrend(30),
        StatisticsService.getCategoryStats(),
        StatisticsService.getMonthlyStats(),
        StatisticsService.getOverallStats()
      ])

      setMoodTrend(mood)
      setCategoryStats(category)
      setMonthlyStats(monthly)
      setOverallStats(overall)
    } catch (error: any) {
      console.error('통계 로드 실패:', error)
      toast.error('통계를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">📊</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              통계 대시보드
            </h1>
            <p className="text-gray-600 dark:text-gray-400">나의 일기 작성 패턴과 감정 변화를 한눈에</p>
          </div>
        </div>
      </div>

      {/* 전체 통계 카드들 */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl shadow-lg border border-blue-100/50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-sm font-medium text-blue-600">총 답변 수</p>
                <p className="text-2xl font-bold text-blue-700">{overallStats.totalResponses}개</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-3xl shadow-lg border border-emerald-100/50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">😊</span>
              <div>
                <p className="text-sm font-medium text-emerald-600">평균 기분</p>
                <p className="text-2xl font-bold text-emerald-700">{overallStats.avgMoodRating}/10</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-3xl shadow-lg border border-orange-100/50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✍️</span>
              <div>
                <p className="text-sm font-medium text-orange-600">평균 단어 수</p>
                <p className="text-2xl font-bold text-orange-700">{overallStats.avgWordCount}개</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-3xl shadow-lg border border-purple-100/50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-sm font-medium text-purple-600">연속 작성</p>
                <p className="text-2xl font-bold text-purple-700">{overallStats.currentStreak}일</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 기분 트렌드 차트 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">📈</span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            기분 트렌드 (최근 30일)
          </h2>
        </div>

        {moodTrend.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis
                  domain={[1, 10]}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  labelFormatter={(label) => `날짜: ${label}`}
                  formatter={(value: number) => [`${value}/10`, '기분 점수']}
                />
                <Line
                  type="monotone"
                  dataKey="mood_rating"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#ec4899' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            기분 점수 데이터가 없습니다. 답변을 작성할 때 기분 점수를 매겨보세요!
          </div>
        )}
      </div>

      {/* 카테고리별 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 카테고리별 답변 수 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-bold text-gray-800">카테고리별 답변 수</h3>
          </div>

          {categoryStats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats.map((item, index) => ({
                      ...item,
                      name: getCategoryName(item.category),
                      fill: COLORS[index % COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              카테고리 통계가 없습니다.
            </div>
          )}
        </div>

        {/* 카테고리별 평균 기분 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl">💝</span>
            <h3 className="text-xl font-bold text-gray-800">카테고리별 평균 기분</h3>
          </div>

          {categoryStats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats.map(item => ({
                  ...item,
                  name: getCategoryName(item.category)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number) => [`${value}/10`, '평균 기분']}
                  />
                  <Bar
                    dataKey="avg_mood"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              기분 점수 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 월별 통계 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">📅</span>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            월별 활동 통계
          </h3>
        </div>

        {monthlyStats.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats.slice(0, 6).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar
                  dataKey="total_responses"
                  name="답변 수"
                  fill="#06b6d4"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="avg_mood"
                  name="평균 기분"
                  fill="#ec4899"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            월별 통계가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}