import type { ReactNode } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import TeamPanel from './TeamPanel'

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden p-0 bg-lab-bg">
          {children}
        </main>
        <TeamPanel />
      </div>
    </div>
  )
}