import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-bg-base md:flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-[120] border-0 bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          onMenuClick={() => setIsSidebarOpen(true)}
          onSidebarToggle={() => setIsSidebarCollapsed((value) => !value)}
        />
        <main className="mx-auto w-full max-w-[1440px] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
