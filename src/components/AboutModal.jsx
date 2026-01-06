import './AboutModal.css'

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content about-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>About Retention</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="about-content">
          <div className="about-logo">
            <span className="a1">1</span>
            <span className="a4">4</span>
            <span className="a7">7</span>
          </div>

          <h3>Master Anything with Spaced Repetition</h3>
          
          <p className="about-desc">
            Retention uses the scientifically-proven 1-4-7 spaced repetition method 
            to help you remember anything you learn. By reviewing at optimal intervals, 
            you can transfer knowledge from short-term to long-term memory effectively.
          </p>

          <div className="feature-list">
            <div className="feature">
              <div className="feature-icon">📋</div>
              <div className="feature-text">
                <strong>Kanban-Style Dashboard</strong>
                <span>See all your daily reviews at a glance</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📅</div>
              <div className="feature-text">
                <strong>Calendar View</strong>
                <span>Plan ahead and track your schedule</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📝</div>
              <div className="feature-text">
                <strong>Notes & Documents</strong>
                <span>Add detailed notes to each topic</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🔥</div>
              <div className="feature-text">
                <strong>Streak Tracking</strong>
                <span>Stay motivated with daily streaks</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">☁️</div>
              <div className="feature-text">
                <strong>Cloud Sync</strong>
                <span>Your data syncs across devices</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📱</div>
              <div className="feature-text">
                <strong>Offline Support</strong>
                <span>Works without internet connection</span>
              </div>
            </div>
          </div>

          <div className="about-science">
            <h4>The Science</h4>
            <p>
              Hermann Ebbinghaus discovered the "forgetting curve" - we forget 70% of 
              new information within 24 hours. Spaced repetition counters this by 
              reviewing at increasing intervals, strengthening neural pathways each time.
            </p>
          </div>

          <div className="about-footer">
            <p>Version 2.0 • Free & Open Source</p>
            <p>Built with React • PWA Enabled</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutModal
