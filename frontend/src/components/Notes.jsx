import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'

export default function Notes({ notes }) {
  const [expandedSections, setExpandedSections] = useState(
    notes.map((_, i) => i === 0) // First section expanded by default
  )
  const [copiedIndex, setCopiedIndex] = useState(null)

  const toggleSection = (index) => {
    setExpandedSections(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const copySection = async (section, index) => {
    const text = section.bullets.map(b => `• ${b}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!notes.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">No notes generated yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((section, index) => (
        <div key={index} className="card overflow-hidden">
          {/* Section header */}
          <button
            onClick={() => toggleSection(index)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expandedSections[index] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
              <div className="text-left">
                <h3 className="font-semibold">{section.section}</h3>
                {section.pageRange && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pages {section.pageRange[0]}-{section.pageRange[1]}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                copySection(section, index)
              }}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Copy section"
            >
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </button>

          {/* Section content */}
          {expandedSections[index] && (
            <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
              <ul className="pt-4 space-y-3">
                {section.bullets.map((bullet, bIndex) => (
                  <li 
                    key={bIndex}
                    className="flex gap-3 text-slate-700 dark:text-slate-300"
                  >
                    <span className="w-2 h-2 mt-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex-shrink-0" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

