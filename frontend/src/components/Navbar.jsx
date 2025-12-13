import { Link, useLocation } from 'react-router-dom'
import { Sparkles, History, Moon, Sun, LogOut } from 'lucide-react'

export default function Navbar({ user, onLogout, darkMode, onToggleDarkMode }) {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">StudyPal</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/')
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Upload
            </Link>
            <Link
              to="/history"
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isActive('/history')
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {/* User */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

