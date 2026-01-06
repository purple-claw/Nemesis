import './Navigation.css'

const Navigation = ({ currentView, setCurrentView }) => {
  const tabs = [
    { id: 'kanban', icon: 'fa-columns', label: 'Board' },
    { id: 'calendar', icon: 'fa-calendar-alt', label: 'Calendar' },
    { id: 'topics', icon: 'fa-list', label: 'Topics' }
  ]

  return (
    <nav className="nav-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${currentView === tab.id ? 'active' : ''}`}
          onClick={() => setCurrentView(tab.id)}
        >
          <i className={`fas ${tab.icon}`}></i>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navigation
