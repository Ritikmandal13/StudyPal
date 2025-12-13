import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, FileText, Sparkles, Clock } from 'lucide-react'
import Upload from '../components/Upload'
import ProgressTracker from '../components/ProgressTracker'
import { useJobStatus } from '../hooks/useJobStatus'
import api from '../utils/api'

export default function HomePage() {
  const navigate = useNavigate()
  const [jobId, setJobId] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const { status, error: statusError } = useJobStatus(jobId)

  const handleUpload = useCallback(async (file) => {
    setUploadError(null)
    
    try {
      const response = await api.uploadPDF(file)
      setJobId(response.jobId)
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    }
  }, [])

  const handleProcessingComplete = useCallback(async () => {
    if (jobId && status?.status === 'chunking_complete') {
      try {
        await api.summarize(jobId)
      } catch (err) {
        console.error('Summarization failed:', err)
      }
    }
  }, [jobId, status])

  // Navigate when completed
  if (status?.status === 'completed') {
    navigate(`/results/${jobId}`)
  }

  // Trigger summarization when chunks are ready
  if (status?.status === 'chunking_complete') {
    handleProcessingComplete()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {!jobId ? (
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Study Assistant
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Upload your PDF,
                <br />
                <span className="gradient-text">get study materials</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Drop any document and we'll create comprehensive notes, flashcards, and quizzes for you.
              </p>
            </div>
          ) : (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                Processing your document
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                This usually takes less than a minute
              </p>
            </div>
          )}

          {/* Upload or Progress */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {!jobId ? (
              <Upload onUpload={handleUpload} error={uploadError} />
            ) : (
              <ProgressTracker 
                status={status} 
                error={statusError}
              />
            )}
          </div>

          {/* Features */}
          {!jobId && (
            <div className="grid grid-cols-3 gap-4 mt-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {[
                { icon: FileText, label: 'Smart Notes', desc: 'Key bullet points' },
                { icon: Sparkles, label: 'Flashcards', desc: 'Interactive Q&A' },
                { icon: Clock, label: 'Quick Quiz', desc: 'Test yourself' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="card p-4 text-center hover:scale-105 transition-transform">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-sm">{label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-400">
        <p>Powered by Raindrop SmartInference • Deployed on Vultr</p>
      </footer>
    </div>
  )
}

