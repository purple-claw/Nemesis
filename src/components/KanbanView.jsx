import { useTopic } from '../context/TopicContext'
import TaskCard from './TaskCard'
import './KanbanView.css'

const KanbanView = ({ onTopicClick }) => {
  const { getTodayTasks } = useTopic()
  const tasks = getTodayTasks()

  const columns = [
    { 
      id: 'today', 
      title: 'Today', 
      icon: 'fa-sun', 
      tasks: tasks.today,
      colorClass: 'today'
    },
    { 
      id: 'day1', 
      title: 'Day +1', 
      icon: 'fa-redo', 
      tasks: tasks.day1,
      colorClass: 'day1'
    },
    { 
      id: 'day4', 
      title: 'Day +4', 
      icon: 'fa-sync', 
      tasks: tasks.day4,
      colorClass: 'day4'
    },
    { 
      id: 'day7', 
      title: 'Day +7', 
      icon: 'fa-check-double', 
      tasks: tasks.day7,
      colorClass: 'day7'
    },
    { 
      id: 'completed', 
      title: 'Mastered', 
      icon: 'fa-trophy', 
      tasks: tasks.completed,
      colorClass: 'completed'
    }
  ]

  return (
    <div className="kanban-container">
      {columns.map(column => (
        <div key={column.id} className="kanban-column">
          <div className={`column-header ${column.colorClass}`}>
            <div className="column-title">
              <i className={`fas ${column.icon}`}></i>
              <span>{column.title}</span>
            </div>
            <span className="column-count">{column.tasks.length}</span>
          </div>
          <div className="column-content">
            {column.tasks.length === 0 ? (
              <div className="empty-column">
                <i className="fas fa-inbox"></i>
                <p>No topics</p>
              </div>
            ) : (
              column.tasks.map(topic => (
                <TaskCard 
                  key={topic.id} 
                  topic={topic} 
                  onClick={() => onTopicClick(topic.id)}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanView
