import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Brain, FileQuestion, Download, RefreshCw } from 'lucide-react'
import Notes from '../components/Notes'
import Flashcards from '../components/Flashcards'
import Quiz from '../components/Quiz'
import api from '../utils/api'

const tabs = [
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'flashcards', label: 'Flashcards', icon: Brain },
  { id: 'quiz', label: 'Quiz', icon: FileQuestion },
]

export default function ResultsPage() {
  const { jobId } = useParams()
  const [activeTab, setActiveTab] = useState('notes')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [regenerating, setRegenerating] = useState(null)

  useEffect(() => {
    loadResults()
  }, [jobId])

  const loadResults = async () => {
    try {
      setLoading(true)
      const data = await api.getResults(jobId)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (type) => {
    try {
      setRegenerating(type)
      const data = await api.regenerate(jobId, type)
      setResults(prev => ({ ...prev, [type]: data[type] }))
    } catch (err) {
      console.error('Regeneration failed:', err)
    } finally {
      setRegenerating(null)
    }
  }

  const handleExport = () => {
    if (!results?.notes) return
    
    let markdown = '# Study Notes\n\n'
    results.notes.forEach(section => {
      markdown += `## ${section.section}\n\n`
      section.bullets.forEach(bullet => {
        markdown += `- ${bullet}\n`
      })
      markdown += '\n'
    })
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'study-notes.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Loading your study materials...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="card p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Link to="/" className="btn btn-primary">
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">Study Materials</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {results?.metadata?.title || 'Your uploaded document'}
            </p>
          </div>
        </div>

        <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Regenerate button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleRegenerate(activeTab)}
          disabled={regenerating === activeTab}
          className="btn btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating === activeTab ? 'animate-spin' : ''}`} />
          Regenerate {activeTab}
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'notes' && <Notes notes={results?.notes || []} />}
        {activeTab === 'flashcards' && <Flashcards cards={results?.flashcards || []} />}
        {activeTab === 'quiz' && <Quiz questions={results?.quiz || []} />}
      </div>
    </div>
  )
}

