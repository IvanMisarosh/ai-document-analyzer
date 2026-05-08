import { Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UploadPage from './pages/UploadPage'
import DocumentListPage from './pages/DocumentListPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import ClausesPage from './pages/ClausesPage'

const qc = new QueryClient()

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/upload" element={<RequireAuth><UploadPage /></RequireAuth>} />
        <Route path="/documents" element={<RequireAuth><DocumentListPage /></RequireAuth>} />
        <Route path="/documents/:id" element={<RequireAuth><DocumentDetailPage /></RequireAuth>} />
        <Route path="/documents/:id/clauses" element={<RequireAuth><ClausesPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/documents" replace />} />
      </Routes>
    </QueryClientProvider>
  )
}
