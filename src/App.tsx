import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import LabWorkspace from './pages/LabWorkspace'
import Dashboard from './pages/Dashboard'
import { ProjectProvider } from './context/ProjectContext'

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/app" element={<RootLayout><Dashboard /></RootLayout>} />
          <Route path="/app/lab" element={<RootLayout><LabWorkspace /></RootLayout>} />
          
          {/* Placeholder para otras rutas */}
          <Route path="/app/retos" element={<RootLayout><div className="p-8">Retos UI en construcción...</div></RootLayout>} />
          <Route path="/app/equipo" element={<RootLayout><div className="p-8">Equipo UI en construcción...</div></RootLayout>} />
          <Route path="/app/resultados" element={<RootLayout><div className="p-8">Resultados UI en construcción...</div></RootLayout>} />
          <Route path="/app/docs" element={<RootLayout><div className="p-8">Docs UI en construcción...</div></RootLayout>} />
          
          {/* Redirigir la raíz al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  )
}