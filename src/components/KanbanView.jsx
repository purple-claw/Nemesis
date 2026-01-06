import { useTopic } from '../context/TopicContext'
import './KanbanView.css'

const KanbanView = ({ onTopicClick }) => {
  const { getTodayTasks, markReviewComplete, isLoading } = useTopic()
  const tasks = getTodayTasks()

  const columns = [
    { id: 'today', title: 'New Today', items: tasks.today, color: 'var(--accent-blue)', icon: '✨' },
    { id: 'day1', title: 'Day 1 Review', items: tasks.day1, color: 'var(--accent-green)', icon: '1' },
    { id: 'day4', title: 'Day 4 Review', items: tasks.day4, color: 'var(--accent-yellow)', icon: '4' },
    { id: 'day7', title: 'Day 7 Review', items: tasks.day7, color: 'var(--accent-primary)', icon: '7' },
    { id: 'overdue', title: 'Overdue', items: tasks.overdue, color: '#ff4444', icon: '⚠️' }
  ]

  const handleComplete = (e, topicId) => {
    e.stopPropagation()
    markReviewComplete(topicId)
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'low': return 'priority-low'
      default: return 'priority-medium'
    }
  }

  if (isLoading) {
    return (
      <div className="kanban-loading">
        <div className="loading-spinner"></div>
        <p>Loading your reviews...</p>
      </div>
    )
  }

  const hasNoTasks = columns.every(col => col.items.length === 0)

  if (hasNoTasks) {
    return (
      <div className="kanban-empty">
        <div className="empty-icon">🎉</div>
        <h3>All caught up!</h3>
        <p>No reviews scheduled for today. Add new topics to start learning!</p>
      </div>
    )
  }

  return (
    <div className="kanban-view">
      {columns.map(column => column.items.length > 0 && (
        <div key={column.id} className="kanban-column">
          <div className="column-header" style={{ '--column-color': column.color }}>
            <span className="column-icon">{column.icon}</span>
            <h3>{column.title}</h3>
            <span className="column-count">{column.items.length}</span>
          </div>
          <div className="column-content">
            {column.items.map(topic => (
              <div
                key={topic.id}
                className={`kanban-card ${getPriorityClass(topic.priority)}`}
                onClick={() => onTopicClick(topic)}
              >
                <div className="card-header">
                  <span className="card-category">{topic.category}</span>
                  {column.id !== 'today' && (
                    <button
                      className="complete-btn"
                      onClick={(e) => handleComplete(e, topic.id)}
                      aria-label="Mark complete"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </button>
                  )}
                </div>
                <h4 className="card-title">{topic.title}</h4>
                <div className="card-footer">
                  <span className="card-stage">
                    Stage {topic.current_stage + 1}/3
                  </span>
                  {topic.notes && (
                    <svg className="has-notes" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanView
