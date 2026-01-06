import './Header.css'

const Header = ({ onMenuClick, onStatsClick }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onMenuClick}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="app-title">
          <i className="fas fa-brain"></i>
          <span>Retention</span>
        </h1>
      </div>
      <div className="header-right">
        <button className="icon-btn" onClick={onStatsClick}>
          <i className="fas fa-chart-bar"></i>
        </button>
      </div>
    </header>
  )
}

export default Header
