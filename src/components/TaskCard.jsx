import { format } from 'date-fns'
import './TaskCard.css'

const TaskCard = ({ topic, onClick }) => {
  const { title, category, priority, createdAt, currentStage } = topic

  return (
    <div 
      className={`task-card priority-${priority}`}
      onClick={onClick}
    >
      <div className="task-card-header">
        <span className="task-title">{title}</span>
        <span className={`task-category ${category}`}>{category}</span>
      </div>
      <div className="task-meta">
        <span className="task-date">
          <i className="fas fa-calendar"></i>
          {format(new Date(createdAt), 'MMM d')}
        </span>
        <div className="task-progress">
          <div className={`progress-dot ${currentStage >= 0 ? 'completed' : ''}`}></div>
          <div className={`progress-dot ${currentStage >= 1 ? 'completed day1' : ''}`}></div>
          <div className={`progress-dot ${currentStage >= 2 ? 'completed day4' : ''}`}></div>
          <div className={`progress-dot ${currentStage >= 3 ? 'completed day7' : ''}`}></div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
