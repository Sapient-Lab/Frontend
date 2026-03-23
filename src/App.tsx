import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import LabWorkspace from './pages/LabWorkspace'
import Dashboard from './pages/Dashboard'
import DataAnalysis from './pages/DataAnalysis'
import ProtocolScanner from './pages/ProtocolScanner'
import Resources from './pages/Resources'
import TasksAndEvaluation from './pages/Tasks'
import Team from './pages/Team'
import ReportGenerator from './pages/ReportGenerator'
import LandingPage from './landing/LandingPage.jsx'
import { ProjectProvider } from './context/ProjectContext'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/onboarding" element={<Onboarding />} />
            
            <Route path="/app" element={<RootLayout><Dashboard /></RootLayout>} />
            <Route path="/app/lab" element={<RootLayout><LabWorkspace /></RootLayout>} />
            <Route path="/app/resultados" element={<RootLayout><DataAnalysis /></RootLayout>} />
            <Route path="/app/protocolos" element={<RootLayout><ProtocolScanner /></RootLayout>} />
            <Route path="/app/reportes" element={<RootLayout><ReportGenerator /></RootLayout>} />
            
            {/* Rutas adicionales de la aplicación */}
            <Route path="/app/tareas" element={<RootLayout><TasksAndEvaluation /></RootLayout>} />
            <Route path="/app/equipo" element={<RootLayout><Team /></RootLayout>} />
            <Route path="/app/docs" element={<RootLayout><Resources /></RootLayout>} />
            <Route path="/landing" element={<LandingPage />} />
            
            {/* Redirigir la raíz al login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </ThemeProvider>
  )
}