import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import TeamPanel from './TeamPanel'

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    // Si se cerró la pestaña, redirigir a login
    if (!sessionStorage.getItem('active_session')) {
      localStorage.removeItem('sapientlab_user_id');
      localStorage.removeItem('sapientlab_user_name');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden p-0 bg-lab-bg">
          {children}
        </main>
        <TeamPanel />
      </div>
    </div>
  )
}