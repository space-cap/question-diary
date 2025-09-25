import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, AuthError, Session } from '@supabase/supabase-js'
import { supabase, type UserProfile } from '../lib/supabase'

// AuthContext 타입 정의
interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

// AuthContext 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider 컴포넌트
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // 사용자 프로필 가져오기
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('프로필 가져오기 오류:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('프로필 가져오기 예외:', error)
      return null
    }
  }

  // 새 사용자 프로필 생성
  const createUserProfile = async (user: User) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || null,
        username: user.user_metadata?.username || null,
      }

      const { error } = await supabase
        .from('profiles')
        .insert(profileData)

      if (error) {
        console.error('프로필 생성 오류:', error)
        return false
      }

      // 생성된 프로필을 다시 가져와서 상태 업데이트
      const newProfile = await fetchUserProfile(user.id)
      setProfile(newProfile)
      return true
    } catch (error) {
      console.error('프로필 생성 예외:', error)
      return false
    }
  }

  // 컴포넌트 마운트시 초기 세션 확인
  useEffect(() => {
    let mounted = true

    // 초기 세션 가져오기
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('세션 가져오기 오류:', error)
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          // 사용자가 있으면 프로필 가져오기
          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user.id)
            setProfile(userProfile)
          }

          setLoading(false)
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // 인증 상태 변화 리스너 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('인증 상태 변화:', event, session?.user?.email)

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            // 새 사용자 등록 시 프로필 생성
            if (event === 'SIGNED_UP') {
              await createUserProfile(session.user)
            } else {
              // 기존 사용자 로그인 시 프로필 가져오기
              const userProfile = await fetchUserProfile(session.user.id)
              setProfile(userProfile)
            }
          } else {
            // 로그아웃 시 프로필 초기화
            setProfile(null)
          }

          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 로그인
  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return result
    } catch (error) {
      console.error('로그인 오류:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // 회원가입
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      return result
    } catch (error) {
      console.error('회원가입 오류:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      const result = await supabase.auth.signOut()
      // 상태 초기화
      setUser(null)
      setProfile(null)
      setSession(null)
      return result
    } catch (error) {
      console.error('로그아웃 오류:', error)
      return { error: error as AuthError }
    }
  }

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email)
      return result
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error)
      return { data: null, error: error as AuthError }
    }
  }

  // 프로필 업데이트
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('로그인이 필요합니다') }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { error }
      }

      // 업데이트된 프로필 다시 가져오기
      const updatedProfile = await fetchUserProfile(user.id)
      setProfile(updatedProfile)

      return { error: null }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      return { error }
    }
  }

  // 컨텍스트 값
  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth 훅
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}

// 로그인 상태 확인 유틸리티 훅들
export const useRequireAuth = () => {
  const { user, loading } = useAuth()
  return { user, loading, isAuthenticated: !!user }
}

export const useProfile = () => {
  const { profile, updateProfile } = useAuth()
  return { profile, updateProfile }
}