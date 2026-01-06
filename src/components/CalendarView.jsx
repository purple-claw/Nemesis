import { useState } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns'
import { useTopic } from '../context/TopicContext'
import './CalendarView.css'

const CalendarView = ({ onTopicClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { getTopicsForDate, getDatesWithTasks } = useTopic()

  const datesWithTasks = getDatesWithTasks()
  const selectedDateTopics = getTopicsForDate(selectedDate)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const hasTasksOnDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return datesWithTasks.has(dateStr)
  }

  return (
    <div className="calendar-view">
      <div className="calendar-container">
        <div className="calendar-header">
          <button 
            className="calendar-nav" 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
          <button 
            className="calendar-nav" 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map(day => (
            <button
              key={day.toISOString()}
              className={`calendar-day 
                ${!isSameMonth(day, currentMonth) ? 'other-month' : ''} 
                ${isToday(day) ? 'today' : ''} 
                ${isSameDay(day, selectedDate) ? 'selected' : ''}
                ${hasTasksOnDate(day) ? 'has-tasks' : ''}
              `}
              onClick={() => setSelectedDate(day)}
            >
              <span className="calendar-day-number">{format(day, 'd')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="day-details">
        <h3>
          <i className="fas fa-calendar-day"></i>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <div className="day-topics">
          {selectedDateTopics.length === 0 ? (
            <div className="empty-day">
              <i className="fas fa-calendar-check"></i>
              <p>No topics scheduled</p>
            </div>
          ) : (
            selectedDateTopics.map((topic, idx) => (
              <div 
                key={`${topic.id}-${idx}`}
                className="day-topic-item"
                onClick={() => onTopicClick(topic.id)}
              >
                <div className="day-topic-info">
                  <div className={`day-topic-type ${topic.type}`}>
                    <i className={`fas ${topic.type === 'new' ? 'fa-plus' : 'fa-redo'}`}></i>
                  </div>
                  <div>
                    <span className="day-topic-title">{topic.title}</span>
                    <span className="day-topic-subtitle">
                      {topic.type === 'new' ? 'New topic' : `Review Day +${topic.reviewDay}`}
                    </span>
                  </div>
                </div>
                {topic.type === 'review' && (
                  <span className={`day-topic-badge ${topic.reviewCompleted ? 'done' : 'pending'}`}>
                    {topic.reviewCompleted ? 'Done' : 'Pending'}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarView
