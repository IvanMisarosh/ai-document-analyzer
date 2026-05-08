import { useState, type FormEvent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadDocument } from '../api/documents'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [context, setContext] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const doc = await uploadDocument(file, context || undefined)
      navigate(`/documents/${doc.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Upload document</h1>
        <p className="text-sm text-gray-500">Upload a PDF Terms &amp; Conditions document for AI analysis.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          >
            {file ? (
              <p className="text-sm text-gray-700 font-medium">{file.name}</p>
            ) : (
              <p className="text-sm text-gray-400">Click to select a PDF file</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Context <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. I'm a freelance designer evaluating this contract…"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  )
}
