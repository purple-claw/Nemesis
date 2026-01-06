import './BottomNav.css'

const BottomNav = ({ activeView, onViewChange }) => {
  const items = [
    { 
      id: 'kanban', 
      label: 'Today', 
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z'
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z'
    },
    { 
      id: 'topics', 
      label: 'All', 
      icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z'
    }
  ]

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.id}
          className={`bottom-nav-item ${activeView === item.id ? 'active' : ''}`}
          onClick={() => onViewChange(item.id)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d={item.icon} />
          </svg>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomNav
