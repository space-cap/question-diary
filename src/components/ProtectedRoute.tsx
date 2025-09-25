import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
)

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  requireProfile?: boolean
}

export const ProtectedRoute = ({
  children,
  redirectTo = '/auth/login',
  requireProfile = false
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // 로딩 중일 때
  if (loading) {
    return <LoadingSpinner />
  }

  // 로그인되지 않은 경우
  if (!user) {
    // 현재 경로를 저장해서 로그인 후 돌아올 수 있도록 함
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    )
  }

  // 프로필이 필요한데 없는 경우 (프로필 생성 중이거나 오류)
  if (requireProfile && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-pulse rounded-full h-12 w-12 bg-blue-200 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            프로필 설정 중...
          </h2>
          <p className="text-gray-600 text-sm">
            사용자 프로필을 불러오고 있습니다. 잠시만 기다려주세요.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// 인증된 사용자만 접근 가능한 페이지를 위한 래퍼
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string
    requireProfile?: boolean
  }
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

// 로그인한 사용자는 접근할 수 없는 페이지 (로그인, 회원가입 등)
interface PublicOnlyRouteProps {
  children: ReactNode
  redirectTo?: string
}

export const PublicOnlyRoute = ({
  children,
  redirectTo = '/dashboard'
}: PublicOnlyRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}