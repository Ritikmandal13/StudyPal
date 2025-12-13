const API_URL = import.meta.env.VITE_API_URL || ''

const api = {
  async uploadPDF(file) {
    const fd = new FormData()
    fd.append('pdf', file)
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
    return res.json()
  },

  async getStatus(jobId) {
    const res = await fetch(`${API_URL}/api/status/${jobId}`)
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to get status')
    return res.json()
  },

  async summarize(jobId) {
    const res = await fetch(`${API_URL}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
    if (!res.ok) throw new Error((await res.json()).error || 'Summarization failed')
    return res.json()
  },

  async getResults(jobId) {
    const res = await fetch(`${API_URL}/api/results/${jobId}`)
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to get results')
    return res.json()
  },

  async regenerate(jobId, type) {
    const res = await fetch(`${API_URL}/api/regenerate/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
    if (!res.ok) throw new Error((await res.json()).error || 'Regeneration failed')
    return res.json()
  },

  async getHistory() {
    const res = await fetch(`${API_URL}/api/history`)
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to get history')
    return res.json()
  },

  async deleteHistory(jobId) {
    const res = await fetch(`${API_URL}/api/history/${jobId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete history')
    return res.json()
  },

  async getPreferences() {
    const res = await fetch(`${API_URL}/api/preferences`)
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to get preferences')
    return res.json()
  },

  async updatePreferences(prefs) {
    const res = await fetch(`${API_URL}/api/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    })
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update preferences')
    return res.json()
  },
}

export default api

