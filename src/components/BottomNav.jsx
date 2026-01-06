import './BottomNav.css'

const BottomNav = ({ currentView, setCurrentView }) => {
  const items = [
    { id: 'kanban', icon: 'fa-columns', label: 'Board' },
    { id: 'calendar', icon: 'fa-calendar-alt', label: 'Calendar' },
    { id: 'topics', icon: 'fa-list', label: 'Topics' }
  ]

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.id}
          className={`bottom-nav-item ${currentView === item.id ? 'active' : ''}`}
          onClick={() => setCurrentView(item.id)}
        >
          <i className={`fas ${item.icon}`}></i>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomNav
