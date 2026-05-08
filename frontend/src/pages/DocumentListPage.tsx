import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { getDocuments, type Document } from '../api/documents'

const STATUS_COLORS: Record<string, string> = {
  uploaded: 'bg-gray-100 text-gray-700',
  queued_for_analysis: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  analyzed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function DocumentRow({ doc }: { doc: Document }) {
  return (
    <Link
      to={`/documents/${doc.id}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {doc.object_key.split('/').pop() ?? `Document #${doc.id}`}
        </p>
        {doc.user_context && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{doc.user_context}</p>
        )}
      </div>
      <StatusBadge status={doc.status} />
    </Link>
  )
}

export default function DocumentListPage() {
  const navigate = useNavigate()
  const { data: docs = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
    refetchInterval: 10_000,
  })

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">T&amp;C Analyzer</h1>
          <div className="flex gap-3">
            <Link
              to="/upload"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Upload
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My documents</h2>

        {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">Failed to load documents.</p>}

        {!isLoading && docs.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No documents yet.</p>
            <Link to="/upload" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
              Upload your first document →
            </Link>
          </div>
        )}

        {docs.length > 0 && (
          <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
            {docs.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
