import { useState } from 'react'
import { format } from 'date-fns'
import { useTopic } from '../context/TopicContext'
import './AddTopicModal.css'

const AddTopicModal = ({ onClose, showToast }) => {
  const { addTopic } = useTopic()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    addTopic({
      title: title.trim(),
      category,
      priority,
      date
    })

    showToast('Topic added successfully!', 'success')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-plus-circle"></i>
            Add New Topic
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="topic-title">Topic Title</label>
            <input
              type="text"
              id="topic-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter topic name..."
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic-category">Category</label>
            <select 
              id="topic-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="general">General</option>
              <option value="programming">Programming</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="language">Language</option>
              <option value="history">History</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic-date">Start Date</label>
            <input
              type="date"
              id="topic-date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <div className="priority-selector">
              {['low', 'medium', 'high'].map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn ${priority === p ? 'active' : ''}`}
                  data-priority={p}
                  onClick={() => setPriority(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            <i className="fas fa-check"></i>
            Create Topic
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddTopicModal
