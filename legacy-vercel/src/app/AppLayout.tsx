import { type ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

interface AppLayoutProps {
  children: ReactNode
  title: string
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
