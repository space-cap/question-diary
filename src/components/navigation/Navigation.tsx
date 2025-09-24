import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

export function Navigation() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { path: '/', label: '오늘의 질문', icon: '✨' },
    { path: '/history', label: '히스토리', icon: '📖' },
    { path: '/statistics', label: '통계', icon: '📊' }
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-purple-100 dark:border-gray-700 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* 로고/제목 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">Q</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Question Diary
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">나만의 질문 일기장</p>
            </div>
          </div>

          {/* 네비게이션 링크 및 테마 토글 */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative group flex items-center space-x-3 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300
                    ${isActive
                      ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-200'
                      : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-300 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>

                  {/* 활성 인디케이터 */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                  )}

                  {/* 호버 효과 */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  )}
                </Link>
              )
            })}

            {/* 다크모드 토글 버튼 */}
            <button
              onClick={toggleTheme}
              className="ml-4 p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600
                         hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md"
              title={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
            >
              <span className="text-lg">
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}