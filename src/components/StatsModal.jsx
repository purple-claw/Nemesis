import { useTopic } from '../context/TopicContext'
import './StatsModal.css'

const StatsModal = ({ isOpen, onClose }) => {
  const { getStats, topics, lastSync } = useTopic()
  
  if (!isOpen) return null

  const stats = getStats()
  
  const categoryCounts = topics.reduce((acc, topic) => {
    acc[topic.category] = (acc[topic.category] || 0) + 1
    return acc
  }, {})

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content stats-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Your Progress</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="stats-content">
          <div className="streak-section">
            <div className="big-streak">
              <div className="streak-flame">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                </svg>
              </div>
              <div className="streak-info">
                <span className="streak-count">{stats.streak}</span>
                <span className="streak-label">Day Streak</span>
              </div>
            </div>
            <div className="streak-best">
              Best: {stats.longestStreak} days
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Topics</span>
            </div>
            <div className="stat-card">
              <span className="stat-value pending">{stats.pending}</span>
              <span className="stat-label">Pending Reviews</span>
            </div>
            <div className="stat-card">
              <span className="stat-value overdue">{stats.overdue}</span>
              <span className="stat-label">Overdue</span>
            </div>
            <div className="stat-card">
              <span className="stat-value mastered">{stats.mastered}</span>
              <span className="stat-label">Mastered</span>
            </div>
          </div>

          {sortedCategories.length > 0 && (
            <div className="categories-section">
              <h3>Top Categories</h3>
              <div className="category-bars">
                {sortedCategories.map(([category, count]) => (
                  <div key={category} className="category-bar">
                    <div className="bar-header">
                      <span className="bar-label">{category}</span>
                      <span className="bar-count">{count}</span>
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="method-info">
            <h3>The 1-4-7 Method</h3>
            <p>
              Based on the forgetting curve, reviewing information at increasing intervals 
              helps transfer knowledge to long-term memory:
            </p>
            <ul>
              <li><strong>Day 1:</strong> First review (next day)</li>
              <li><strong>Day 4:</strong> Second review (4 days later)</li>
              <li><strong>Day 7:</strong> Final review (7 days later)</li>
            </ul>
          </div>

          {lastSync && (
            <div className="sync-info">
              Last synced: {lastSync.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsModal
