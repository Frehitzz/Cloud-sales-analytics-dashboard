import {
  House,
  Lightbulb,
  PanelLeftClose,
  PanelLeftOpen,
  Table2,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/classNames'

type SidebarProps = {
  isCollapsed: boolean
  isOpen: boolean
  onClose: () => void
  onSidebarToggle: () => void
}

type NavItem = {
  icon: LucideIcon
  label: string
  metric?: string
  to: string
}

const navItems: NavItem[] = [
  { icon: House, label: 'Home', to: '/' },
  { icon: Lightbulb, label: 'Insights', to: '/insights' },
  { icon: Table2, label: 'Data Table', to: '/data-table' },
]

function Sidebar({
  isCollapsed,
  isOpen,
  onClose,
  onSidebarToggle,
}: SidebarProps) {
  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        'fixed top-0 z-[150] flex h-screen w-[240px] shrink-0 flex-col border-r border-border bg-bg-surface transition-[left,width] duration-200 ease-out md:sticky md:left-0 md:w-[72px]',
        isOpen ? 'left-0' : '-left-[240px]',
        isCollapsed ? 'lg:w-[72px]' : 'lg:w-[240px]',
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 md:justify-center md:px-3',
          isCollapsed
            ? 'lg:justify-center lg:px-3'
            : 'lg:justify-between lg:px-6',
          isOpen && 'justify-between px-4',
        )}
      >
        <strong
          className={cn(
            'min-w-0 truncate font-display text-base font-bold text-text-primary md:hidden',
            isCollapsed ? 'lg:hidden' : 'lg:block',
            isOpen && 'block',
          )}
        >
          Job Analytics
        </strong>

        <button
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden h-10 w-10 flex-none cursor-pointer place-items-center rounded-lg border border-border-strong bg-transparent text-text-primary transition-colors duration-150 hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:grid"
          onClick={onSidebarToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          type="button"
        >
          {isCollapsed ? (
            <PanelLeftOpen aria-hidden="true" size={20} strokeWidth={2.2} />
          ) : (
            <PanelLeftClose aria-hidden="true" size={20} strokeWidth={2.2} />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-1 pt-6">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'group flex min-h-11 items-center gap-3 border-l-[3px] border-transparent px-6 py-3 font-display text-sm font-medium text-text-secondary no-underline transition-colors duration-150 hover:bg-bg-hover hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:justify-center md:px-3',
                isActive &&
                'border-l-primary bg-primary-subtle text-primary hover:text-primary',
                isCollapsed
                  ? 'lg:justify-center lg:px-3'
                  : 'lg:justify-start lg:px-6',
                isOpen && 'justify-start px-6',
              )
            }
            end={item.to === '/'}
            key={item.to}
            onClick={onClose}
            title={isCollapsed ? item.label : undefined}
            to={item.to}
          >
            <span className="grid h-7 w-7 flex-none place-items-center rounded-md bg-bg-elevated text-current transition-colors duration-150">
              <item.icon aria-hidden="true" size={18} strokeWidth={2.2} />
            </span>
            <span
              className={cn(
                'md:hidden',
                isCollapsed ? 'lg:hidden' : 'lg:inline',
                isOpen && 'inline',
              )}
            >
              {item.label}
            </span>
            {item.metric && (
              <span
                className={cn(
                  'ml-auto font-mono text-xs text-text-muted md:hidden',
                  isCollapsed ? 'lg:hidden' : 'lg:inline',
                  isOpen && 'inline',
                )}
              >
                {item.metric}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className={cn(
          'mt-auto flex min-h-14 items-center gap-2 px-6 py-6 text-xs text-text-secondary md:justify-center md:px-3',
          isCollapsed ? 'lg:justify-center lg:px-3' : 'lg:justify-start lg:px-6',
          isOpen && 'justify-start px-6',
        )}
      >
      </div>
    </aside>
  )
}

export default Sidebar
