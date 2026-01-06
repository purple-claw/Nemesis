import { useState, useMemo } from 'react'
import { useTopic } from '../context/TopicContext'
import './TopicsView.css'

const TopicsView = ({ onTopicClick }) => {
  const { topics, isLoading } = useTopic()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const filteredTopics = useMemo(() => {
    let result = [...topics]

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query)
      )
    }

    switch (filter) {
      case 'active':
        result = result.filter(t => !t.completed)
        break
      case 'completed':
        result = result.filter(t => t.completed)
        break
      case 'high':
        result = result.filter(t => t.priority === 'high')
        break
    }

    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'progress':
        result.sort((a, b) => b.current_stage - a.current_stage)
        break
    }

    return result
  }, [topics, filter, search, sortBy])

  const getProgressPercent = (topic) => {
    if (topic.completed) return 100
    return Math.round((topic.current_stage / 3) * 100)
  }

  if (isLoading) {
    return (
      <div className="topics-loading">
        <div className="loading-spinner"></div>
        <p>Loading topics...</p>
      </div>
    )
  }

  return (
    <div className="topics-view">
      <div className="topics-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Done' },
            { id: 'high', label: 'Priority' }
          ].map(f => (
            <button
              key={f.id}
              className={`filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select 
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="topics-empty">
          <div className="empty-icon">📚</div>
          <h3>No topics found</h3>
          <p>{search ? 'Try a different search term' : 'Add your first topic to start learning!'}</p>
        </div>
      ) : (
        <div className="topics-list">
          {filteredTopics.map(topic => (
            <div
              key={topic.id}
              className={`topic-card ${topic.completed ? 'completed' : ''}`}
              onClick={() => onTopicClick(topic)}
            >
              <div className="topic-main">
                <div className="topic-info">
                  <span className="topic-category">{topic.category}</span>
                  <h4 className="topic-title">{topic.title}</h4>
                  <span className="topic-date">
                    Added {new Date(topic.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="topic-status">
                  {topic.completed ? (
                    <div className="mastered-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Mastered
                    </div>
                  ) : (
                    <div className="progress-ring">
                      <svg viewBox="0 0 36 36">
                        <path
                          className="progress-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="progress-bar"
                          strokeDasharray={`${getProgressPercent(topic)}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="progress-text">{topic.current_stage}/3</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="topic-reviews">
                {[1, 4, 7].map((day, idx) => {
                  const review = topic.reviews?.[idx]
                  return (
                    <div 
                      key={day} 
                      className={`review-dot ${review?.completed ? 'done' : ''} ${idx === topic.current_stage && !topic.completed ? 'current' : ''}`}
                    >
                      Day {day}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TopicsView
