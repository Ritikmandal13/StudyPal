import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('studypal_theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('studypal_theme', !darkMode ? 'dark' : 'light')
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar 
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          <Route 
            path="/results/:jobId" 
            element={<ResultsPage />} 
          />
          <Route 
            path="/history" 
            element={<HistoryPage />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

