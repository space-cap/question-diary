import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { Navigation } from './components/navigation/Navigation'
import { HomePage } from './pages/HomePage'
import { HistoryPage } from './pages/HistoryPage'
import { StatisticsPage } from './pages/StatisticsPage'
import './App.css'

function App() {
  return (
    <ThemeProvider>
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

          <Navigation />

          <main className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
