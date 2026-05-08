import { api } from './client'

export type DocumentStatus =
  | 'uploaded'
  | 'queued_for_analysis'
  | 'processing'
  | 'analyzed'
  | 'failed'

export interface Document {
  id: number
  object_key: string
  user_context: string | null
  status: DocumentStatus
}

export interface ClauseAnalysis {
  index: number
  document_id: number
  category: string[] | null
  risk_level: 'standard_practice' | 'low' | 'medium' | 'high' | 'critical'
  reason: string | null
  key_points: string[]
  conclusion: string
  is_valid: boolean
  chapter_name?: string | null
  page_start?: number | null
  page_end?: number | null
}

export async function uploadDocument(file: File, userContext?: string): Promise<Document> {
  const form = new FormData()
  form.append('document', file)
  if (userContext) form.append('user_context', userContext)
  const { data } = await api.post<Document>('/document/', form)
  return data
}

export async function getDocuments(): Promise<Document[]> {
  const { data } = await api.get<Document[]>('/documents/')
  return data
}

export async function getDocument(id: number): Promise<Document> {
  const { data } = await api.get<Document>(`/document/${id}`)
  return data
}

export async function getDocumentStatus(id: number): Promise<{ id: number; status: DocumentStatus }> {
  const { data } = await api.get(`/document/${id}/status`)
  return data
}

export async function startAnalysis(id: number): Promise<{ status: DocumentStatus }> {
  const { data } = await api.post(`/document/${id}/analyze`)
  return data
}

export async function getClauses(id: number): Promise<ClauseAnalysis[]> {
  const { data } = await api.get<ClauseAnalysis[]>(`/document/${id}/clauses`)
  return data
}

export async function getDownloadUrl(id: number): Promise<string> {
  const { data } = await api.get<{ url: string }>(`/document/${id}/download-url`)
  return data.url
}
