import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDocument, getDocumentStatus, startAnalysis, getDownloadUrl } from '../api/documents'

const POLL_STATUSES = new Set(['queued_for_analysis', 'processing'])

const STATUS_COLORS: Record<string, string> = {
  uploaded: 'bg-gray-100 text-gray-700',
  queued_for_analysis: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  analyzed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const docId = Number(id)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', docId],
    queryFn: () => getDocument(docId),
  })

  // Poll status while in-progress
  const { data: statusData } = useQuery({
    queryKey: ['document-status', docId],
    queryFn: () => getDocumentStatus(docId),
    refetchInterval: (query) => {
      const s = query.state.data?.status
      return s && POLL_STATUSES.has(s) ? 2000 : false
    },
    enabled: !!doc,
    select: (d) => d.status,
  })

  const currentStatus = statusData ?? doc?.status

  const startMutation = useMutation({
    mutationFn: () => startAnalysis(docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-status', docId] }),
  })

  async function handleDownload() {
    const url = await getDownloadUrl(docId)
    window.open(url, '_blank')
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">Loading…</div>
  }

  if (!doc) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 text-sm">Document not found.</div>
  }

  const filename = doc.object_key.split('/').pop() ?? `document-${docId}.pdf`
  const statusColor = STATUS_COLORS[currentStatus ?? ''] ?? 'bg-gray-100 text-gray-700'
  const isPolling = currentStatus && POLL_STATUSES.has(currentStatus)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/documents" className="text-sm text-gray-500 hover:text-gray-700">← Documents</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-900 font-medium truncate">{filename}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{filename}</h2>
              {doc.user_context && (
                <p className="text-sm text-gray-500 mt-1">{doc.user_context}</p>
              )}
            </div>
            <span className={`shrink-0 inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {currentStatus?.replace(/_/g, ' ')}
              {isPolling && ' …'}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              className="text-sm text-indigo-600 hover:underline"
            >
              Download PDF ↗
            </button>

            {(currentStatus === 'uploaded' || currentStatus === 'failed') && (
              <button
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                className="bg-indigo-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {startMutation.isPending ? 'Starting…' : 'Analyze'}
              </button>
            )}

            {currentStatus === 'analyzed' && (
              <button
                onClick={() => navigate(`/documents/${docId}/clauses`)}
                className="bg-green-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-green-700 transition-colors"
              >
                View clauses →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
