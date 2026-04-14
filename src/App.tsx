import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import DataTablePage from './pages/DataTablePage'
import Home from './pages/Home'
import Insights from './pages/Insights'

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Home />} />
        <Route path="insights" element={<Insights />} />
        <Route path="data-table" element={<DataTablePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
