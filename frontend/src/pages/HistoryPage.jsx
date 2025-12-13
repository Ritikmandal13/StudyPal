import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Trash2, Clock, ChevronRight, FolderOpen } from 'lucide-react'
import api from '../utils/api'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const data = await api.getHistory()
      setHistory(data.history || [])
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jobId) => {
    try {
      await api.deleteHistory(jobId)
      setHistory(prev => prev.filter(h => h.jobId !== jobId))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">History</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Your past study sessions
          </p>
        </div>
        
        <Link to="/" className="btn btn-primary">
          New Upload
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h2 className="text-xl font-semibold mb-2">No history yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Upload your first PDF to get started
          </p>
          <Link to="/" className="btn btn-primary inline-flex">
            Upload PDF
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={item.jobId}
              className="card p-4 hover:shadow-lg transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {item.filename || 'Untitled Document'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.metadata?.pages && (
                      <span>{item.metadata.pages} pages</span>
                    )}
                    {item.metadata?.wordCount && (
                      <span>{item.metadata.wordCount.toLocaleString()} words</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(item.jobId)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <Link
                    to={`/results/${item.jobId}`}
                    className="btn btn-secondary py-2 px-4 flex items-center gap-1"
                  >
                    View
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

