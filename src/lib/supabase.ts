import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// 사용자 프로필 타입 정의
export interface UserProfile {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  username?: string | null
  bio?: string | null
  timezone?: string
  language?: string
  theme_preference?: string
  created_at?: string
  updated_at?: string
}

// 질문 관련 타입 정의
export interface Question {
  id: string
  text: string
  category?: string | null
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// 답변 관련 타입 정의
export interface Response {
  id: number
  user_id: string
  question_id: string
  content: string
  mood_rating?: number | null
  word_count?: number | null
  response_date: string
  created_at: string
  updated_at: string
}

// 일일 질문 타입 정의
export interface DailyQuestion {
  id: number
  question_id: string
  assigned_date: string
  is_completed?: boolean
  created_at: string
  question?: Question // 조인된 질문 데이터
}

// 답변 생성용 타입
export interface CreateResponseInput {
  question_id: string
  content: string
  mood_rating?: number
  response_date?: string
}

// 답변 업데이트용 타입
export interface UpdateResponseInput {
  content?: string
  mood_rating?: number
}

// 환경변수에서 Supabase URL과 익명 키 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL이 설정되지 않았습니다.')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.')
}

// Supabase 클라이언트 생성 (단순화)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 개발 모드에서 연결 상태 로깅
if (import.meta.env.DEV) {
  console.log('🔗 Supabase 클라이언트가 초기화되었습니다:', {
    url: supabaseUrl,
    // 보안을 위해 키는 처음 10자만 표시
    key: supabaseAnonKey.substring(0, 10) + '...'
  })
}