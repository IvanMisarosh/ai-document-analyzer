import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getClauses, type ClauseAnalysis } from '../api/documents'

const RISK_COLORS: Record<string, string> = {
  standard_practice: 'bg-green-100 text-green-700 border-green-200',
  low: 'bg-teal-100 text-teal-700 border-teal-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
}

function RiskBadge({ level }: { level: string }) {
  const cls = RISK_COLORS[level] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <span className={`inline-block border px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {level.replace(/_/g, ' ')}
    </span>
  )
}

function ClauseCard({ clause }: { clause: ClauseAnalysis }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          {clause.chapter_name && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              {clause.chapter_name}
            </p>
          )}
          {clause.category && clause.category.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {clause.category.map((c) => (
                <span key={c} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
        <RiskBadge level={clause.risk_level} />
      </div>

      {clause.reason && <p className="text-sm text-gray-600">{clause.reason}</p>}

      {clause.key_points.length > 0 && (
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          {clause.key_points.map((kp, i) => (
            <li key={i}>{kp}</li>
          ))}
        </ul>
      )}

      <p className="text-sm font-medium text-gray-800 border-t border-gray-100 pt-3">
        {clause.conclusion}
      </p>

      {clause.page_start != null && (
        <p className="text-xs text-gray-400">
          Pages {clause.page_start}–{clause.page_end}
        </p>
      )}
    </div>
  )
}

export default function ClausesPage() {
  const { id } = useParams<{ id: string }>()
  const docId = Number(id)

  const { data: clauses = [], isLoading, error } = useQuery({
    queryKey: ['clauses', docId],
    queryFn: () => getClauses(docId),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={`/documents/${docId}`} className="text-sm text-gray-500 hover:text-gray-700">
            ← Document
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">Clauses</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading && <p className="text-sm text-gray-500">Loading clauses…</p>}
        {error && <p className="text-sm text-red-600">Failed to load clauses.</p>}

        {!isLoading && clauses.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-16">No clauses found.</p>
        )}

        <div className="space-y-4">
          {clauses.map((clause) => (
            <ClauseCard key={clause.index} clause={clause} />
          ))}
        </div>
      </main>
    </div>
  )
}
