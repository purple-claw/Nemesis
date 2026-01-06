import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { useTopic } from '../context/TopicContext'
import './TopicDetailModal.css'

const TopicDetailModal = ({ topicId, onClose, showToast }) => {
  const { topics, updateTopic, deleteTopic, markReviewComplete } = useTopic()
  const topic = topics.find(t => t.id === topicId)
  const notesRef = useRef(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (topic) {
      setNotes(topic.notes || '')
      if (notesRef.current) {
        notesRef.current.innerHTML = topic.notes || ''
      }
    }
  }, [topic])

  if (!topic) return null

  const handleSaveNotes = () => {
    const content = notesRef.current?.innerHTML || ''
    updateTopic(topicId, { notes: content })
    showToast('Notes saved!', 'success')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      deleteTopic(topicId)
      showToast('Topic deleted', 'success')
      onClose()
    }
  }

  const handleMarkReviewed = () => {
    if (topic.currentStage < 3) {
      markReviewComplete(topicId)
      showToast('Review completed! Great job!', 'success')
    }
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    notesRef.current?.focus()
  }

  const stages = [
    { icon: 'fa-play', label: 'Created' },
    { icon: 'fa-redo', label: 'Day +1' },
    { icon: 'fa-sync', label: 'Day +4' },
    { icon: 'fa-check-double', label: 'Day +7' },
    { icon: 'fa-trophy', label: 'Mastered' }
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-book"></i>
            {topic.title}
          </h2>
          <div className="modal-actions">
            <button className="icon-btn danger" onClick={handleDelete} title="Delete">
              <i className="fas fa-trash"></i>
            </button>
            <button className="modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="topic-meta">
            <span className={`topic-category-badge ${topic.category}`}>
              {topic.category}
            </span>
            <span className={`topic-priority-badge ${topic.priority}`}>
              {topic.priority} priority
            </span>
            <span className="topic-date-badge">
              <i className="fas fa-calendar"></i>
              {format(new Date(topic.createdAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="topic-progress">
            <h4>Review Progress</h4>
            <div className="progress-steps">
              {stages.map((stage, idx) => (
                <div 
                  key={idx}
                  className={`progress-step ${idx <= topic.currentStage ? 'completed' : ''} ${idx === topic.currentStage ? 'active' : ''}`}
                >
                  <div className="step-icon">
                    <i className={`fas ${stage.icon}`}></i>
                  </div>
                  <span>{stage.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="topic-schedule">
            <h4>
              <i className="fas fa-calendar"></i>
              Review Schedule
            </h4>
            <div className="schedule-list">
              <div className="schedule-item completed">
                <div className="schedule-info">
                  <div className="schedule-icon">
                    <i className="fas fa-plus"></i>
                  </div>
                  <span className="schedule-label">Created</span>
                </div>
                <span className="schedule-date">
                  {format(new Date(topic.createdAt), 'MMM d, yyyy')}
                </span>
                <span className="schedule-status done">
                  <i className="fas fa-check"></i>
                </span>
              </div>
              {topic.reviews.map((review, idx) => (
                <div 
                  key={idx}
                  className={`schedule-item ${review.completed ? 'completed' : ''}`}
                >
                  <div className="schedule-info">
                    <div className="schedule-icon">
                      <i className="fas fa-redo"></i>
                    </div>
                    <span className="schedule-label">Day +{review.day}</span>
                  </div>
                  <span className="schedule-date">
                    {format(new Date(review.date), 'MMM d, yyyy')}
                  </span>
                  <span className={`schedule-status ${review.completed ? 'done' : 'pending'}`}>
                    {review.completed ? <i className="fas fa-check"></i> : <i className="fas fa-clock"></i>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="topic-notes">
            <div className="notes-header">
              <h4>
                <i className="fas fa-file-alt"></i>
                Notes & Content
              </h4>
              <button className="btn-small" onClick={handleSaveNotes}>
                <i className="fas fa-save"></i>
                Save
              </button>
            </div>
            <div className="notes-toolbar">
              <button type="button" className="toolbar-btn" onClick={() => execCommand('bold')} title="Bold">
                <i className="fas fa-bold"></i>
              </button>
              <button type="button" className="toolbar-btn" onClick={() => execCommand('italic')} title="Italic">
                <i className="fas fa-italic"></i>
              </button>
              <button type="button" className="toolbar-btn" onClick={() => execCommand('underline')} title="Underline">
                <i className="fas fa-underline"></i>
              </button>
              <span className="toolbar-divider"></span>
              <button type="button" className="toolbar-btn" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                <i className="fas fa-list-ul"></i>
              </button>
              <button type="button" className="toolbar-btn" onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                <i className="fas fa-list-ol"></i>
              </button>
              <span className="toolbar-divider"></span>
              <button type="button" className="toolbar-btn" onClick={() => execCommand('formatBlock', 'h3')} title="Heading">
                <i className="fas fa-heading"></i>
              </button>
              <button type="button" className="toolbar-btn" onClick={() => execCommand('formatBlock', 'blockquote')} title="Quote">
                <i className="fas fa-quote-right"></i>
              </button>
            </div>
            <div 
              ref={notesRef}
              className="notes-editor"
              contentEditable
              placeholder="Write your notes here..."
              suppressContentEditableWarning
            />
          </div>
        </div>

        <div className="modal-footer">
          {!topic.completed && topic.currentStage < 3 && (
            <button className="btn-primary" onClick={handleMarkReviewed}>
              <i className="fas fa-check"></i>
              Mark as Reviewed
            </button>
          )}
          {topic.completed && (
            <div className="mastered-badge">
              <i className="fas fa-trophy"></i>
              Topic Mastered!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopicDetailModal
