import { useState } from 'react'
import { BookOpen, Sparkles, Brain, FileQuestion } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500))
    onLogin(email)
    setIsLoading(false)
  }

  const features = [
    { icon: BookOpen, title: 'Smart Notes', desc: 'AI-generated summaries' },
    { icon: Brain, title: 'Flashcards', desc: 'Interactive Q&A cards' },
    { icon: FileQuestion, title: 'Quizzes', desc: 'Test your knowledge' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="text-3xl font-display font-bold">StudyPal</span>
          </div>
          
          <h1 className="text-4xl font-display font-bold mb-4">
            Transform any PDF into study materials
          </h1>
          <p className="text-xl text-white/80 mb-12">
            Upload your documents and let AI create notes, flashcards, and quizzes in seconds.
          </p>

          <div className="space-y-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-white/70 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">StudyPal</span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-display font-bold mb-2">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Enter your email to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </form>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center">
              This is a demo app. No password required.
            </p>
          </div>

          <p className="text-sm text-slate-400 mt-8 text-center">
            Built for AI Championship • Raindrop + Vultr
          </p>
        </div>
      </div>
    </div>
  )
}

