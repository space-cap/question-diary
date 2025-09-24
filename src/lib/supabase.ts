import { createClient } from '@supabase/supabase-js'

// 환경변수에서 Supabase URL과 익명 키 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL이 설정되지 않았습니다.')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.')
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 개발 모드에서 연결 상태 로깅
if (import.meta.env.DEV) {
  console.log('🔗 Supabase 클라이언트가 초기화되었습니다:', {
    url: supabaseUrl,
    // 보안을 위해 키는 처음 10자만 표시
    key: supabaseAnonKey.substring(0, 10) + '...'
  })
}