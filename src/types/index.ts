/**
 * Question Diary 애플리케이션의 TypeScript 타입 정의
 */

// ===== 기본 데이터베이스 엔티티 타입 =====

/**
 * 질문 테이블 타입
 */
export interface Question {
  id: string
  text: string
  category: 'personal_growth' | 'relationships' | 'goals' | 'creativity' | 'reflection' | 'gratitude'
  difficulty: 'easy' | 'medium' | 'hard'
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 답변 테이블 타입
 */
export interface Response {
  id: number
  question_id: string
  content: string
  response_date: string
  word_count: number
  mood_rating: number | null
  created_at: string
  updated_at: string
}

/**
 * 일일 질문 할당 테이블 타입
 */
export interface DailyQuestion {
  id: number
  question_id: string
  assigned_date: string
  created_at: string
}

// ===== 뷰 및 조합 타입 =====

/**
 * daily_summary 뷰 타입
 */
export interface DailySummary {
  assigned_date: string
  question_content: string
  category: Question['category']
  response_content: string | null
  word_count: number | null
  mood_rating: number | null
  response_time: string | null
  response_id: number | null
  is_completed: boolean
}

/**
 * 기분 점수 선택 옵션
 */
export interface MoodRatingOption {
  value: number
  emoji: string
  label: string
}

// ===== 컴포넌트 Props 타입 =====

/**
 * AnswerForm 컴포넌트 Props
 */
export interface AnswerFormProps {
  questionId: string
  existingAnswer?: {
    id: number
    content: string
    mood_rating?: number
  }
  onSave: (content: string, moodRating?: number) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * MoodRating 컴포넌트 Props
 */
export interface MoodRatingProps {
  value?: number
  onChange: (rating: number) => void
  disabled?: boolean
}

// ===== 애플리케이션 상태 타입 =====

/**
 * 연결 상태 타입
 */
export type ConnectionStatus = 'loading' | 'connected' | 'error'

/**
 * 앱의 메인 상태 타입
 */
export interface AppState {
  connectionStatus: ConnectionStatus
  todayQuestion: DailySummary | null
  showAnswerForm: boolean
  isLoading: boolean
  isEditing: boolean
}

// ===== API 서비스 타입 =====

/**
 * API 에러 타입
 */
export interface ApiError {
  message: string
  code?: string
  details?: any
}

/**
 * Supabase 응답 타입
 */
export interface SupabaseResponse<T> {
  data: T | null
  error: ApiError | null
}

// ===== 유틸리티 타입 =====

/**
 * 날짜 문자열 타입 (YYYY-MM-DD 형식)
 */
export type DateString = string

/**
 * 생성/수정 타임스탬프 타입
 */
export type Timestamp = string

/**
 * 선택적 필드를 가진 타입 생성 헬퍼
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 생성을 위한 타입 (id와 타임스탬프 제외)
 */
export type CreateQuestion = Omit<Question, 'id' | 'created_at' | 'updated_at'>
export type CreateResponse = Omit<Response, 'id' | 'word_count' | 'created_at' | 'updated_at'>
export type CreateDailyQuestion = Omit<DailyQuestion, 'id' | 'created_at'>

/**
 * 수정을 위한 타입 (필수 필드만 포함)
 */
export type UpdateResponse = Pick<Response, 'content' | 'mood_rating'>