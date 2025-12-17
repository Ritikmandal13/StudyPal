import { useNavigate } from 'react-router-dom'
import { BookOpen, Sparkles, Brain, FileQuestion } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/upload')
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

      {/* Right side - Call to action (no login) */}
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
            <h2 className="text-2xl font-display font-bold mb-2">Welcome to StudyPal</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              No login needed. Jump straight into generating notes, flashcards, and quizzes from your PDFs.
            </p>

            <button
              type="button"
              onClick={handleGetStarted}
              className="btn btn-primary w-full"
            >
              Get started
            </button>
          </div>

          <p className="text-sm text-slate-400 mt-8 text-center">
            Built for AI Championship • Raindrop + Vultr
          </p>
        </div>
      </div>
    </div>
  )
}

