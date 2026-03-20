import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import LabWorkspace from './pages/LabWorkspace'
import { ProjectProvider } from './context/ProjectContext'

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/app" element={
            <RootLayout>
              <LabWorkspace />
            </RootLayout>
          } />
          
          {/* Redirigir la raíz al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  )
}