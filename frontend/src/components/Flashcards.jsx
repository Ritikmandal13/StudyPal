import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react'

export default function Flashcards({ cards }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledCards, setShuffledCards] = useState(cards)

  useEffect(() => {
    setShuffledCards(cards)
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [cards])

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowLeft':
        goToPrev()
        break
      case 'ArrowRight':
        goToNext()
        break
      case ' ':
      case 'Enter':
        e.preventDefault()
        setIsFlipped(f => !f)
        break
    }
  }, [currentIndex, shuffledCards.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const goToNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleReset = () => {
    setShuffledCards(cards)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  if (!cards.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">No flashcards generated yet</p>
      </div>
    )
  }

  const currentCard = shuffledCards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={handleShuffle}
            className="btn btn-ghost flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
          <button
            onClick={handleReset}
            className="btn btn-ghost flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
        
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {currentIndex + 1} / {shuffledCards.length}
        </span>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`flip-card cursor-pointer ${isFlipped ? 'flipped' : ''}`}
        style={{ height: '300px' }}
      >
        <div className="flip-card-inner relative w-full h-full">
          {/* Front (Question) */}
          <div className="flip-card-front absolute w-full h-full">
            <div className="card h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-4">
                Question
              </span>
              <p className="text-xl text-center font-medium leading-relaxed">
                {currentCard?.question}
              </p>
              <span className="mt-6 text-sm text-slate-400">
                Click to reveal answer
              </span>
            </div>
          </div>

          {/* Back (Answer) */}
          <div className="flip-card-back absolute w-full h-full">
            <div className="card h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <span className="text-sm font-medium text-green-600 dark:text-green-400 mb-4">
                Answer
              </span>
              <p className="text-xl text-center font-medium leading-relaxed">
                {currentCard?.answer}
              </p>
              <span className="mt-6 text-sm text-slate-400">
                Click to see question
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="btn btn-secondary p-3 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 overflow-x-auto max-w-xs py-2">
          {shuffledCards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsFlipped(false)
              }}
              className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${
                index === currentIndex
                  ? 'w-6 bg-primary-500'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === shuffledCards.length - 1}
          className="btn btn-secondary p-3 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-sm text-slate-400 mt-4">
        Use ← → arrows to navigate, Space to flip
      </p>
    </div>
  )
}

