import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { Navigation } from './components/navigation/Navigation'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { HistoryPage } from './pages/HistoryPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50
                          dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-slate-900
                          transition-all duration-300">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                  },
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#f0fdf4',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                  },
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fef2f2',
                  },
                },
                loading: {
                  style: {
                    background: '#f0f9ff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                  },
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#f0f9ff',
                  },
                },
              }}
            />

            <Routes>
              {/* 인증 관련 라우트 (로그인한 사용자는 접근 불가) */}
              <Route
                path="/auth/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/auth/signup"
                element={
                  <PublicOnlyRoute>
                    <SignUpPage />
                  </PublicOnlyRoute>
                }
              />

              {/* 보호된 라우트들 (로그인 필요) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <main className="container mx-auto px-6 py-8">
                      <HistoryPage />
                    </main>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/statistics"
                element={
                  <ProtectedRoute>
                    <Navigation />
                    <main className="container mx-auto px-6 py-8">
                      <StatisticsPage />
                    </main>
                  </ProtectedRoute>
                }
              />

              {/* 홈페이지 (인증 상태에 따라 리디렉션) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute redirectTo="/auth/login">
                    <Navigation />
                    <main className="container mx-auto px-6 py-8">
                      <HomePage />
                    </main>
                  </ProtectedRoute>
                }
              />

              {/* 404 페이지 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600">페이지를 찾을 수 없습니다.</p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
