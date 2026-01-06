import { useTopic } from '../context/TopicContext'
import './Header.css'

const Header = ({ onMenuClick, onStatsClick }) => {
  const { streak, isOnline, serverDate } = useTopic()

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <header className="header">
      <button className="header-btn menu-btn" onClick={onMenuClick} aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>

      <div className="header-center">
        <div className="header-logo">
          <span className="logo-num n1">1</span>
          <span className="logo-num n4">4</span>
          <span className="logo-num n7">7</span>
        </div>
        <div className="header-info">
          <span className="header-date">{formatDate(serverDate)}</span>
          {!isOnline && <span className="offline-badge">Offline</span>}
        </div>
      </div>

      <button className="header-btn stats-btn" onClick={onStatsClick} aria-label="Stats">
        <div className="streak-badge">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
          </svg>
          <span>{streak?.count || 0}</span>
        </div>
      </button>
    </header>
  )
}

export default Header
