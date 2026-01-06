import { useTopic } from '../context/TopicContext'
import './SideMenu.css'

const SideMenu = ({ isOpen, onClose, onAboutClick }) => {
  const { exportData, importData, clearAllData, forceSync, isOnline } = useTopic()

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (file) {
        const text = await file.text()
        const success = await importData(text)
        if (success) {
          alert('Data imported successfully!')
        } else {
          alert('Failed to import data. Invalid file format.')
        }
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      clearAllData()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="menu-backdrop" onClick={onClose} />
      <div className="side-menu">
        <div className="menu-header">
          <div className="menu-logo">
            <span className="m1">1</span>
            <span className="m4">4</span>
            <span className="m7">7</span>
          </div>
          <h2>Retention</h2>
        </div>

        <nav className="menu-nav">
          <button className="menu-item" onClick={forceSync} disabled={!isOnline}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            <span>Sync Now</span>
            {!isOnline && <span className="offline-tag">Offline</span>}
          </button>

          <button className="menu-item" onClick={exportData}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span>Export Data</span>
          </button>

          <button className="menu-item" onClick={handleImport}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
            </svg>
            <span>Import Data</span>
          </button>

          <div className="menu-divider" />

          <button className="menu-item" onClick={onAboutClick}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>About</span>
          </button>

          <button className="menu-item danger" onClick={handleClearData}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>Clear All Data</span>
          </button>
        </nav>

        <div className="menu-footer">
          <p>Version 2.0</p>
          <p>Made with ❤️ for learners</p>
        </div>
      </div>
    </>
  )
}

export default SideMenu
