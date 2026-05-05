import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { HomePage } from './pages/HomePage'
import { BookCatalogPage } from './pages/BookCatalogPage'
import { BookEventTypePage } from './pages/BookEventTypePage'
import { BookConfirmPage } from './pages/BookConfirmPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookCatalogPage />} />
        <Route path="/book/:eventTypeId" element={<BookEventTypePage />} />
        <Route path="/book/:eventTypeId/confirm" element={<BookConfirmPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/schedule" element={<AdminPage />} />
        <Route path="/admin/settings" element={<AdminPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
