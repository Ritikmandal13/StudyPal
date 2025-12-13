import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

// Poll job status until completion or error
export function useJobStatus(jobId) {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!jobId) {
      setStatus(null)
      setError(null)
      return
    }

    const poll = async () => {
      try {
        const data = await api.getStatus(jobId)
        setStatus(data)
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(intervalRef.current)
        }
      } catch (err) {
        setError(err.message)
        clearInterval(intervalRef.current)
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 2000)
    return () => clearInterval(intervalRef.current)
  }, [jobId])

  return { status, error }
}

