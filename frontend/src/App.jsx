import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  // Load user and theme from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('studypal_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const savedTheme = localStorage.getItem('studypal_theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleLogin = (email) => {
    const userData = { email, loginAt: new Date().toISOString() }
    localStorage.setItem('studypal_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('studypal_user')
    setUser(null)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('studypal_theme', !darkMode ? 'dark' : 'light')
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        {user && (
          <Navbar 
            user={user} 
            onLogout={handleLogout} 
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}
        
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/" 
            element={user ? <HomePage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/results/:jobId" 
            element={user ? <ResultsPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/history" 
            element={user ? <HistoryPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

