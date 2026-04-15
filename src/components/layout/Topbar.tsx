type TopbarProps = {
  onMenuClick: () => void
}

function Topbar({ onMenuClick }: TopbarProps) {
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
    </header>
  )
}

export default Topbar
