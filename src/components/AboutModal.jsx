import './AboutModal.css'

const AboutModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-info-circle"></i>
            About 1-4-7 Technique
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body about-content">
          <div className="about-section">
            <h3>
              <i className="fas fa-brain"></i>
              What is Spaced Repetition?
            </h3>
            <p>
              Spaced repetition is a learning technique that involves reviewing 
              information at increasing intervals to maximize long-term retention.
            </p>
          </div>

          <div className="about-section">
            <h3>
              <i className="fas fa-calendar-check"></i>
              The 1-4-7 Rule
            </h3>
            <p>The 1-4-7 technique schedules reviews at optimal intervals:</p>
            <ul>
              <li><strong>Day 0:</strong> Initial learning</li>
              <li><strong>Day +1:</strong> First review (next day)</li>
              <li><strong>Day +4:</strong> Second review (4 days after)</li>
              <li><strong>Day +7:</strong> Final review (7 days after)</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>
              <i className="fas fa-lightbulb"></i>
              Why It Works
            </h3>
            <p>
              This technique leverages the spacing effect - a phenomenon where 
              information is better retained when study sessions are spaced out 
              over time rather than crammed in a single session.
            </p>
          </div>

          <div className="about-section tip">
            <h3>
              <i className="fas fa-star"></i>
              Pro Tip
            </h3>
            <p>
              Use the notes section to write down key points, create summaries, 
              or add questions to test yourself during reviews!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutModal
