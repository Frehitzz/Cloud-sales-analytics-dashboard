type TopbarProps = {
  isSidebarCollapsed: boolean
  onMenuClick: () => void
  onSidebarToggle: () => void
}

function Topbar({
  isSidebarCollapsed,
  onMenuClick,
  onSidebarToggle,
}: TopbarProps) {
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

      <strong className="min-w-0 truncate font-display text-base font-semibold text-text-primary">
        Job Salary Analytics Dashboard
      </strong>
    </header>
  )
}

export default Topbar
