import { useState } from 'react'
import { useTopic } from '../context/TopicContext'
import './AddTopicModal.css'

const AddTopicModal = ({ isOpen, onClose, preselectedDate }) => {
  const { addTopic, serverDate } = useTopic()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [date, setDate] = useState(preselectedDate || serverDate)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { id: 'general', label: 'General', emoji: '📚' },
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'study', label: 'Study', emoji: '📖' },
    { id: 'tech', label: 'Tech', emoji: '💻' },
    { id: 'language', label: 'Language', emoji: '🌍' },
    { id: 'health', label: 'Health', emoji: '🏃' },
    { id: 'finance', label: 'Finance', emoji: '💰' },
    { id: 'personal', label: 'Personal', emoji: '🎯' }
  ]

  const priorities = [
    { id: 'low', label: 'Low', color: 'var(--accent-green)' },
    { id: 'medium', label: 'Medium', color: 'var(--accent-yellow)' },
    { id: 'high', label: 'High', color: 'var(--accent-primary)' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || isSubmitting) return

    setIsSubmitting(true)
    await addTopic({
      title: title.trim(),
      category,
      priority,
      date
    })
    
    setTitle('')
    setCategory('general')
    setPriority('medium')
    setDate(serverDate)
    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-topic-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Topic</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">What do you want to learn?</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React Hooks, Spanish verbs..."
              autoFocus
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-btn ${category === cat.id ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <div className="priority-buttons">
              {priorities.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`priority-btn ${priority === p.id ? 'selected' : ''}`}
                  style={{ '--priority-color': p.color }}
                  onClick={() => setPriority(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Start Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="schedule-preview">
            <h4>Review Schedule</h4>
            <div className="schedule-days">
              <div className="schedule-day">
                <span className="day-badge d1">Day 1</span>
                <span className="day-date">{getReviewDate(date, 1)}</span>
              </div>
              <div className="schedule-day">
                <span className="day-badge d4">Day 4</span>
                <span className="day-date">{getReviewDate(date, 4)}</span>
              </div>
              <div className="schedule-day">
                <span className="day-badge d7">Day 7</span>
                <span className="day-date">{getReviewDate(date, 7)}</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Topic'}
          </button>
        </form>
      </div>
    </div>
  )
}

function getReviewDate(startDate, days) {
  const date = new Date(startDate)
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default AddTopicModal
