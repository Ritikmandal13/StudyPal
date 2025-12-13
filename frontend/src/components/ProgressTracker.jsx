import { Check, Loader2, AlertCircle, Upload, FileText, Sparkles, CheckCircle } from 'lucide-react'

const steps = [
  { id: 'uploading', label: 'Uploading', icon: Upload },
  { id: 'parsing', label: 'Parsing PDF', icon: FileText },
  { id: 'chunking_complete', label: 'Extracting Text', icon: FileText },
  { id: 'summarizing', label: 'Generating', icon: Sparkles },
  { id: 'completed', label: 'Complete', icon: CheckCircle },
]

const getStepIndex = (status) => {
  if (!status) return 0
  const idx = steps.findIndex(s => s.id === status)
  return idx >= 0 ? idx : 0
}

export default function ProgressTracker({ status, error }) {
  const currentStep = getStepIndex(status?.status)
  const progress = status?.progress || 0

  if (error || status?.status === 'error') {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Processing Failed</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          {error || status?.error || 'Something went wrong'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="card p-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{status?.step || 'Processing...'}</span>
          <span className="text-slate-500">{progress}%</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full progress-bar rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isComplete = index < currentStep
          const isPending = index > currentStep

          return (
            <div 
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isComplete 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : isActive
                  ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {isComplete ? (
                  <Check className="w-5 h-5" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <span className={`font-medium ${
                isPending ? 'text-slate-400' : ''
              }`}>
                {step.label}
              </span>

              {isActive && (
                <div className="ml-auto">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

