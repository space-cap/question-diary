import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export const DashboardPage = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    console.log('🚀 로그아웃 버튼이 클릭되었습니다!')
    try {
      console.log('📤 signOut 함수 호출 중...')
      const { error } = await signOut()
      console.log('📤 signOut 결과:', { error })
      if (error) {
        console.error('로그아웃 실패:', error)
        toast.error('로그아웃에 실패했습니다.')
      } else {
        console.log('✅ 로그아웃 성공! 로그인 페이지로 이동합니다.')
        toast.success('로그아웃되었습니다.')
        navigate('/auth/login')
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  const handleGoToQuestions = () => {
    navigate('/')
  }

  const handleGoToHistory = () => {
    navigate('/history')
  }

  const handleEditProfile = () => {
    toast.info('프로필 수정 기능은 곧 추가될 예정입니다! 📝')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                📝 Question Diary
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {profile?.full_name || user?.email}님
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {profile?.full_name || '사용자'}님! 👋
          </h2>
          <p className="text-gray-600">
            오늘도 소중한 하루를 기록해보세요.
          </p>
        </div>

        {/* 환영 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Question Diary에 오신 것을 환영합니다!
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              이제 개인화된 일기 시스템을 사용하실 수 있습니다.
              매일의 질문에 답하며 소중한 순간들을 기록해보세요.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
              {/* 기능 카드들 */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-3xl mb-3">✍️</div>
                <h4 className="font-semibold text-gray-900 mb-2">일일 질문</h4>
                <p className="text-sm text-gray-600">
                  매일 새로운 질문에 답하며 하루를 되돌아보세요
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">기분 추적</h4>
                <p className="text-sm text-gray-600">
                  기분 점수를 기록하고 감정 변화를 추적해보세요
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="text-3xl mb-3">🔍</div>
                <h4 className="font-semibold text-gray-900 mb-2">과거 기록</h4>
                <p className="text-sm text-gray-600">
                  과거의 답변들을 검색하고 되돌아보세요
                </p>
              </div>
            </div>

            <div className="mt-8 space-x-4">
              <button
                onClick={handleGoToQuestions}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                오늘의 질문 답하기
              </button>
              <button
                onClick={handleGoToHistory}
                className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                과거 기록 보기
              </button>
            </div>
          </div>
        </div>

        {/* 사용자 정보 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">이메일</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">이름</span>
              <span className="font-medium">{profile?.full_name || '설정 안됨'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">언어</span>
              <span className="font-medium">{profile?.language === 'ko' ? '한국어' : profile?.language}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">테마</span>
              <span className="font-medium">
                {profile?.theme_preference === 'system' ? '시스템 설정' :
                 profile?.theme_preference === 'light' ? '밝은 모드' :
                 profile?.theme_preference === 'dark' ? '어두운 모드' : '시스템 설정'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">가입일</span>
              <span className="font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR') : '-'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleEditProfile}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              프로필 수정하기
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}