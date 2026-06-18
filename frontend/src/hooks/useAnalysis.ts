import { useState } from 'react'
import axios from 'axios'
import type { AnalysisResponse } from '../types/ifc'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useAnalysis() {
  const [data, setData] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function analyze(file: File) {
    setLoading(true)
    setError(null)
    setFileName(file.name)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post<AnalysisResponse>(
        `${API_URL}/api/analyze`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        }
      )
      setData(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError('Koneksi timeout. Backend mungkin sedang cold start, coba lagi dalam 30 detik.')
        } else if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data?.detail || 'Terjadi kesalahan pada server.'}`)
        } else {
          setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
        }
      } else {
        setError('Terjadi kesalahan tidak terduga.')
      }
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setData(null)
    setError(null)
    setFileName(null)
  }

  return { data, loading, error, fileName, analyze, reset }
}
