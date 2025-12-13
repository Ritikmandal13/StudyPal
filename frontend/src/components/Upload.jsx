import { useState, useCallback, useRef } from 'react'
import { Upload as UploadIcon, FileText, X, AlertCircle } from 'lucide-react'

export default function Upload({ onUpload, error }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    }
  }, [])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    await onUpload(selectedFile)
    setIsUploading(false)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="card p-8">
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-zone cursor-pointer text-center ${isDragging ? 'active' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 flex items-center justify-center">
          <UploadIcon className="w-8 h-8 text-primary-500" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          Drop your PDF here
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          or click to browse • Max 10MB
        </p>
      </div>

      {/* Selected file */}
      {selectedFile && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedFile.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedFile(null)
            }}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Upload button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="btn btn-primary w-full mt-6 disabled:opacity-50"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </span>
          ) : (
            'Generate Study Materials'
          )}
        </button>
      )}
    </div>
  )
}

