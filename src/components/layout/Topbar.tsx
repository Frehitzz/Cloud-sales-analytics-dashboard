import { useLocation } from 'react-router-dom'

type TopbarProps = {
  isSidebarCollapsed: boolean
  onMenuClick: () => void
  onSidebarToggle: () => void
}

const pageTitles: Record<string, { label: string; title: string }> = {
  '/': {
    label: 'Home',
    title: 'Job Analytics Dashboard',
  },
  '/data-table': {
    label: 'Data Table',
    title: 'Opportunity register',
  },
  '/insights': {
    label: 'Insights',
    title: 'Signals that need action',
  },
}

function Topbar({
  isSidebarCollapsed,
  onMenuClick,
  onSidebarToggle,
}: TopbarProps) {
  const { pathname } = useLocation()
  const pageTitle = pageTitles[pathname] ?? pageTitles['/']

  return (
    <header className="sticky top-0 z-[100] flex min-h-16 items-center gap-4 border-b border-border bg-bg-surface px-4 md:px-6">
      <button
        aria-label="Open sidebar"
        className="flex h-10 w-10 flex-none cursor-pointer flex-col justify-center gap-[5px] rounded-lg border-0 bg-bg-elevated px-3 transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
        onClick={onMenuClick}
        type="button"
      >
        <span className="block h-0.5 rounded-sm bg-text-primary" />
        <span className="block h-0.5 rounded-sm bg-text-primary" />
        <span className="block h-0.5 rounded-sm bg-text-primary" />
      </button>

      <button
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden min-h-9 cursor-pointer rounded-lg border border-border-strong bg-transparent px-4 font-display text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:block"
        onClick={onSidebarToggle}
        type="button"
      >
        {isSidebarCollapsed ? 'Expand' : 'Collapse'}
      </button>

      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-text-secondary">{pageTitle.label}</span>
        <strong className="truncate font-display text-base font-semibold text-text-primary">
          {pageTitle.title}
        </strong>
      </div>

      <div className="ml-auto hidden items-center gap-3 sm:flex">
        <span className="inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary">
          FY 2026
        </span>
        <button
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 bg-primary px-5 font-display text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          type="button"
        >
          Export
        </button>
      </div>
    </header>
  )
}

export default Topbar
