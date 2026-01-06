import './Navigation.css'

const Navigation = ({ activeView, onViewChange }) => {
  const views = [
    { id: 'kanban', label: 'Today', icon: 'M4 5v14h6V5H4zm10 0v14h6V5h-6z' },
    { id: 'calendar', label: 'Calendar', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z' },
    { id: 'topics', label: 'All Topics', icon: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z' }
  ]

  return (
    <nav className="navigation">
      {views.map(view => (
        <button
          key={view.id}
          className={`nav-item ${activeView === view.id ? 'active' : ''}`}
          onClick={() => onViewChange(view.id)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d={view.icon} />
          </svg>
          <span>{view.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navigation
