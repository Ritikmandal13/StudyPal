import { useState } from 'react'
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react'

export default function Quiz({ questions }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [revealed, setRevealed] = useState({})

  if (!questions.length) {
    return <div className="card p-8 text-center"><p>No quiz yet</p></div>
  }

  const q = questions[currentIndex]
  const sel = selectedAnswers[currentIndex]
  const rev = revealed[currentIndex]

  if (showResults) {
    const score = questions.filter((qu, i) => selectedAnswers[i] === qu.correct).length
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="card p-8 max-w-md mx-auto text-center">
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${pct >= 80 ? 'text-green-500' : 'text-yellow-500'}`} />
        <h2 className="text-2xl font-bold mb-2">{pct >= 80 ? 'Excellent!' : 'Good!'}</h2>
        <p className="text-3xl gradient-text mb-4">{score}/{questions.length}</p>
        <button onClick={() => { setCurrentIndex(0); setSelectedAnswers({}); setRevealed({}); setShowResults(false) }} className="btn btn-primary">
          <RotateCcw className="w-4 h-4 mr-2" />Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">Question {currentIndex + 1} of {questions.length}</div>
      <div className="card p-6 mb-6">
        <h3 className="text-xl font-semibold mb-6">{q?.question}</h3>
        <div className="space-y-3">
          {q?.options.map((opt, i) => {
            const letter = opt.charAt(0)
            const isSel = sel === letter
            const isCor = letter === q.correct
            let cls = 'border-slate-200'
            if (rev && isCor) cls = 'border-green-500 bg-green-50'
            else if (rev && isSel) cls = 'border-red-500 bg-red-50'
            else if (isSel) cls = 'border-primary-500 bg-primary-50'
            return (
              <button key={i} onClick={() => !rev && setSelectedAnswers(p => ({...p, [currentIndex]: letter}))} className={`w-full p-4 rounded-xl border-2 text-left ${cls}`}>
                <span className={`inline-block w-8 h-8 rounded-full mr-3 text-center leading-8 ${isSel ? 'bg-primary-500 text-white' : 'bg-slate-100'}`}>{letter}</span>
                {opt.substring(3)}
              </button>
            )
          })}
        </div>
        {rev && q?.explanation && <p className="mt-4 p-3 bg-slate-50 rounded text-sm">{q.explanation}</p>}
      </div>
      <div className="flex justify-end">
        {!rev ? <button onClick={() => setRevealed(p => ({...p, [currentIndex]: true}))} disabled={!sel} className="btn btn-primary">Check</button>
          : <button onClick={() => currentIndex < questions.length - 1 ? setCurrentIndex(currentIndex + 1) : setShowResults(true)} className="btn btn-primary">
              {currentIndex < questions.length - 1 ? 'Next' : 'Results'}
            </button>}
      </div>
    </div>
  )
}

