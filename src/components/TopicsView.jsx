import { format } from 'date-fns'
import { useTopic } from '../context/TopicContext'
import './TopicsView.css'

const TopicsView = ({ onTopicClick }) => {
  const { topics } = useTopic()

  const getCategoryIcon = (category) => {
    const icons = {
      general: 'fa-book',
      programming: 'fa-code',
      math: 'fa-calculator',
      science: 'fa-flask',
      language: 'fa-language',
      history: 'fa-landmark',
      other: 'fa-folder'
    }
    return icons[category] || 'fa-book'
  }

  const getStageLabel = (stage, completed) => {
    if (completed) return 'Mastered'
    const labels = ['New', 'Day +1', 'Day +4', 'Day +7']
    return labels[stage] || 'New'
  }

  if (topics.length === 0) {
    return (
      <div className="topics-view">
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No Topics Yet</h3>
          <p>Tap the + button to add your first topic</p>
        </div>
      </div>
    )
  }

  return (
    <div className="topics-view">
      <div className="topics-list">
        {topics.map(topic => (
          <div 
            key={topic.id}
            className="topic-list-item"
            onClick={() => onTopicClick(topic.id)}
          >
            <div className={`topic-list-icon ${topic.category}`}>
              <i className={`fas ${getCategoryIcon(topic.category)}`}></i>
            </div>
            <div className="topic-list-content">
              <span className="topic-list-title">{topic.title}</span>
              <div className="topic-list-meta">
                <span className={`topic-stage ${topic.completed ? 'mastered' : ''}`}>
                  {getStageLabel(topic.currentStage, topic.completed)}
                </span>
                <span className="topic-date">
                  <i className="fas fa-calendar"></i>
                  {format(new Date(topic.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <div className="topic-list-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopicsView
