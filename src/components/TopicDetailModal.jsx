import { useState } from 'react'
import { useTopic } from '../context/TopicContext'
import './TopicDetailModal.css'

const TopicDetailModal = ({ topic, isOpen, onClose }) => {
  const { updateTopic, deleteTopic, markReviewComplete } = useTopic()
  const [notes, setNotes] = useState(topic?.notes || '')
  const [isEditing, setIsEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  if (!isOpen || !topic) return null

  const handleSaveNotes = () => {
    updateTopic(topic.id, { notes })
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteTopic(topic.id)
    onClose()
  }

  const handleMarkComplete = () => {
    markReviewComplete(topic.id)
  }

  const getNextReview = () => {
    if (topic.completed) return null
    const review = topic.reviews?.[topic.current_stage]
    return review
  }

  const nextReview = getNextReview()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content topic-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-info">
            <span className="detail-category">{topic.category}</span>
            <h2>{topic.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3>Progress</h3>
            <div className="progress-track">
              {[
                { day: 1, label: 'Day 1' },
                { day: 4, label: 'Day 4' },
                { day: 7, label: 'Day 7' }
              ].map((stage, idx) => {
                const review = topic.reviews?.[idx]
                const isComplete = review?.completed
                const isCurrent = idx === topic.current_stage && !topic.completed
                
                return (
                  <div 
                    key={stage.day} 
                    className={`progress-step ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="step-circle">
                      {isComplete ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      ) : (
                        <span>{stage.day}</span>
                      )}
                    </div>
                    <span className="step-label">{stage.label}</span>
                    {review && (
                      <span className="step-date">
                        {new Date(review.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {topic.completed && (
              <div className="mastered-banner">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Topic Mastered!</span>
              </div>
            )}
          </div>

          <div className="detail-section">
            <div className="section-header">
              <h3>Notes</h3>
              {!isEditing && (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="notes-editor">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes, key points, or links..."
                  rows={6}
                />
                <div className="editor-actions">
                  <button className="cancel-btn" onClick={() => {
                    setNotes(topic.notes || '')
                    setIsEditing(false)
                  }}>
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleSaveNotes}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="notes-content">
                {topic.notes ? (
                  <p>{topic.notes}</p>
                ) : (
                  <p className="no-notes">No notes yet. Tap edit to add some!</p>
                )}
              </div>
            )}
          </div>

          <div className="detail-section meta-section">
            <div className="meta-item">
              <span className="meta-label">Created</span>
              <span className="meta-value">
                {new Date(topic.created_at).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Priority</span>
              <span className={`meta-value priority-${topic.priority}`}>
                {topic.priority}
              </span>
            </div>
          </div>

          <div className="detail-actions">
            {nextReview && !topic.completed && (
              <button className="action-btn complete-action" onClick={handleMarkComplete}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Mark Review Complete
              </button>
            )}
            
            {!showDelete ? (
              <button className="action-btn delete-action" onClick={() => setShowDelete(true)}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Delete Topic
              </button>
            ) : (
              <div className="delete-confirm">
                <span>Are you sure?</span>
                <button className="confirm-delete" onClick={handleDelete}>Yes, Delete</button>
                <button className="cancel-delete" onClick={() => setShowDelete(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicDetailModal
