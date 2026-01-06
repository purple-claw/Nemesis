import { useState, useMemo } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { useTopic } from '../context/TopicContext'
import './CalendarView.css'

const CalendarView = ({ onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { getDatesWithTasks, getTopicsForDate, serverDate } = useTopic()
  
  const taskDates = useMemo(() => getDatesWithTasks(), [getDatesWithTasks])
  const today = new Date(serverDate)

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentMonth])

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDateStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const hasTasks = taskDates.has(dateStr)
    const topics = hasTasks ? getTopicsForDate(date) : []
    
    const hasNew = topics.some(t => t.type === 'new')
    const hasReview = topics.some(t => t.type === 'review' && !t.reviewCompleted)
    const hasCompleted = topics.some(t => t.reviewCompleted)
    
    return { hasTasks, hasNew, hasReview, hasCompleted, count: topics.length }
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button 
          className="month-nav" 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <h2 className="current-month">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button 
          className="month-nav" 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="days">
          {days.map((day, index) => {
            const status = getDateStatus(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, today)
            
            return (
              <button
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${status.hasTasks ? 'has-tasks' : ''}`}
                onClick={() => onDateSelect(day)}
              >
                <span className="day-number">{format(day, 'd')}</span>
                {status.hasTasks && (
                  <div className="day-indicators">
                    {status.hasNew && <span className="indicator new"></span>}
                    {status.hasReview && <span className="indicator review"></span>}
                    {status.hasCompleted && <span className="indicator completed"></span>}
                  </div>
                )}
                {status.count > 0 && (
                  <span className="task-count">{status.count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot new"></span>
          <span>New topic</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot review"></span>
          <span>Review due</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot completed"></span>
          <span>Completed</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
