import type { ReactNode } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import TeamPanel from './TeamPanel'

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
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