import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ResponseService } from '../services/responseService'
import { ResponseCard } from '../components/ResponseCard'
import type { DailySummary } from '../types'

export function HistoryPage() {
  const [responses, setResponses] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async (page = 0, append = false) => {
    try {
      setLoading(true)
      setError(null)

      // 총 개수와 데이터를 동시에 가져오기
      const [historyData, count] = await Promise.all([
        ResponseService.getResponseHistory(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
        page === 0 ? ResponseService.getResponseHistoryCount() : Promise.resolve(totalCount)
      ])

      if (append) {
        setResponses(prev => [...prev, ...historyData])
      } else {
        setResponses(historyData)
      }

      if (page === 0) {
        setTotalCount(count)
      }

      setCurrentPage(page)
      setHasMore((page + 1) * ITEMS_PER_PAGE < count)

      console.log(`📚 히스토리 로드 완료: ${historyData.length}개 항목, 전체: ${count}개`)
    } catch (error: any) {
      console.error('히스토리 로드 실패:', error)
      setError(error.message || '히스토리를 불러오는데 실패했습니다.')
      toast.error('히스토리를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadHistory(currentPage + 1, true)
    }
  }

  const handleEdit = (response: DailySummary) => {
    // TODO: 편집 모달 또는 페이지로 이동
    toast.success('답변 수정 기능은 곧 추가될 예정입니다.')
    console.log('편집할 답변:', response)
  }

  if (loading && responses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">답변 히스토리를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.766 0L3.048 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg font-medium">오류가 발생했습니다</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <button
            onClick={() => loadHistory()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-600">아직 작성한 답변이 없습니다</p>
            <p className="text-sm text-gray-500 mt-2">오늘의 질문에 답변을 작성해보세요!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/50">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">📚</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              답변 히스토리
            </h1>
            <p className="text-gray-600">
              총 <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">{totalCount}개</span>의 소중한 답변을 작성하셨습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 답변 카드들 */}
      <div className="space-y-6">
        {responses.map((response) => (
          <ResponseCard
            key={`${response.assigned_date}-${response.response_id}`}
            response={response}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors
              ${loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                로딩 중...
              </div>
            ) : (
              '더 보기'
            )}
          </button>
        </div>
      )}

      {/* 끝에 도달했을 때 메시지 */}
      {!hasMore && responses.length > 0 && (
        <div className="text-center mt-8 py-4 text-gray-500">
          모든 답변을 불러왔습니다. 🎉
        </div>
      )}
    </div>
  )
}