import { useTopic } from '../context/TopicContext'
import './StatsModal.css'

const StatsModal = ({ onClose }) => {
  const { getStats } = useTopic()
  const stats = getStats()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-chart-bar"></i>
            Statistics
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-book"></i>
              </div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Topics</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-value">{stats.completedToday}</div>
              <div className="stat-label">Done Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon gold">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-value">{stats.mastered}</div>
              <div className="stat-label">Mastered</div>
            </div>
          </div>
          <div className="streak-card">
            <div className="streak-icon">
              <i className="fas fa-fire"></i>
            </div>
            <div className="streak-info">
              <div className="streak-value">{stats.streak}</div>
              <div className="streak-label">Day Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsModal
