import { useRef } from 'react'
import { useTopic } from '../context/TopicContext'
import './SideMenu.css'

const SideMenu = ({ onClose, onAboutClick, showToast }) => {
  const { exportData, importData, clearAllData } = useTopic()
  const fileInputRef = useRef(null)

  const handleExport = () => {
    exportData()
    showToast('Data exported successfully!', 'success')
    onClose()
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const success = importData(event.target?.result)
      if (success) {
        showToast('Data imported successfully!', 'success')
      } else {
        showToast('Failed to import data', 'error')
      }
      onClose()
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      clearAllData()
      showToast('All data cleared', 'success')
      onClose()
    }
  }

  return (
    <>
      <div className="side-menu-overlay" onClick={onClose} />
      <div className="side-menu">
        <div className="side-menu-header">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <h3>Retention Master</h3>
          <p>1-4-7 Technique</p>
        </div>

        <nav className="side-menu-nav">
          <button className="side-menu-item" onClick={handleExport}>
            <i className="fas fa-download"></i>
            <span>Export Data</span>
          </button>
          <button className="side-menu-item" onClick={handleImportClick}>
            <i className="fas fa-upload"></i>
            <span>Import Data</span>
          </button>
          <button className="side-menu-item danger" onClick={handleClear}>
            <i className="fas fa-trash-alt"></i>
            <span>Clear All Data</span>
          </button>
          <div className="side-menu-divider" />
          <button className="side-menu-item" onClick={onAboutClick}>
            <i className="fas fa-info-circle"></i>
            <span>About 1-4-7</span>
          </button>
        </nav>

        <div className="side-menu-footer">
          <p>Made with <i className="fas fa-heart"></i> for learners</p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />
      </div>
    </>
  )
}

export default SideMenu
