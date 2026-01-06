import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { addDays, format, isToday, isBefore, startOfDay } from 'date-fns'

const TopicContext = createContext()

export const useTopic = () => {
  const context = useContext(TopicContext)
  if (!context) {
    throw new Error('useTopic must be used within TopicProvider')
  }
  return context
}

// 1-4-7 schedule: reviews on day +1, +4, +7 after creation
const REVIEW_INTERVALS = [1, 4, 7]

export const TopicProvider = ({ children, showToast }) => {
  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('retention-topics')
    return saved ? JSON.parse(saved) : []
  })

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('retention-streak')
    return saved ? JSON.parse(saved) : { count: 0, lastDate: null }
  })

  useEffect(() => {
    localStorage.setItem('retention-topics', JSON.stringify(topics))
  }, [topics])

  useEffect(() => {
    localStorage.setItem('retention-streak', JSON.stringify(streak))
  }, [streak])

  // Calculate review dates based on 1-4-7 rule
  const calculateReviewDates = (startDate) => {
    const start = new Date(startDate)
    return REVIEW_INTERVALS.map(days => ({
      date: format(addDays(start, days), 'yyyy-MM-dd'),
      day: days,
      completed: false
    }))
  }

  // Add new topic
  const addTopic = (topicData) => {
    const newTopic = {
      id: uuidv4(),
      title: topicData.title,
      category: topicData.category,
      priority: topicData.priority,
      createdAt: topicData.date,
      notes: '',
      reviews: calculateReviewDates(topicData.date),
      currentStage: 0, // 0=created, 1=day1, 2=day4, 3=day7, 4=mastered
      completed: false
    }
    setTopics(prev => [...prev, newTopic])
    return newTopic
  }

  // Update topic
  const updateTopic = (id, updates) => {
    setTopics(prev => prev.map(topic => 
      topic.id === id ? { ...topic, ...updates } : topic
    ))
  }

  // Delete topic
  const deleteTopic = (id) => {
    setTopics(prev => prev.filter(topic => topic.id !== id))
  }

  // Mark review as completed
  const markReviewComplete = (topicId) => {
    setTopics(prev => prev.map(topic => {
      if (topic.id !== topicId) return topic
      
      const nextStage = topic.currentStage + 1
      const updatedReviews = topic.reviews.map((review, idx) => 
        idx === topic.currentStage ? { ...review, completed: true } : review
      )
      
      // Update streak
      const today = format(new Date(), 'yyyy-MM-dd')
      if (streak.lastDate !== today) {
        const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')
        if (streak.lastDate === yesterday) {
          setStreak({ count: streak.count + 1, lastDate: today })
        } else {
          setStreak({ count: 1, lastDate: today })
        }
      }
      
      return {
        ...topic,
        reviews: updatedReviews,
        currentStage: nextStage,
        completed: nextStage >= 3
      }
    }))
  }

  // Get topics for today's Kanban columns
  const getTodayTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayStart = startOfDay(new Date())
    
    const result = {
      today: [],
      day1: [],
      day4: [],
      day7: [],
      completed: []
    }

    topics.forEach(topic => {
      if (topic.completed) {
        result.completed.push(topic)
        return
      }

      // Check if topic was created today
      if (topic.createdAt === today && topic.currentStage === 0) {
        result.today.push(topic)
        return
      }

      // Check review stages
      topic.reviews.forEach((review, idx) => {
        if (review.completed) return
        
        const reviewDate = new Date(review.date)
        const isReviewDue = isToday(reviewDate) || isBefore(reviewDate, todayStart)
        
        if (isReviewDue && idx === topic.currentStage) {
          if (review.day === 1) result.day1.push(topic)
          else if (review.day === 4) result.day4.push(topic)
          else if (review.day === 7) result.day7.push(topic)
        }
      })
    })

    return result
  }

  // Get topics for a specific date (for calendar)
  const getTopicsForDate = (date) => {
    const dateStr = format(new Date(date), 'yyyy-MM-dd')
    const result = []

    topics.forEach(topic => {
      // Check if created on this date
      if (topic.createdAt === dateStr) {
        result.push({ ...topic, type: 'new', reviewDay: 0 })
      }

      // Check review dates
      topic.reviews.forEach(review => {
        if (review.date === dateStr) {
          result.push({ 
            ...topic, 
            type: 'review', 
            reviewDay: review.day,
            reviewCompleted: review.completed 
          })
        }
      })
    })

    return result
  }

  // Get dates that have tasks (for calendar indicators)
  const getDatesWithTasks = () => {
    const dates = new Set()
    
    topics.forEach(topic => {
      dates.add(topic.createdAt)
      topic.reviews.forEach(review => dates.add(review.date))
    })

    return dates
  }

  // Get statistics
  const getStats = () => {
    const total = topics.length
    const mastered = topics.filter(t => t.completed).length
    
    let pending = 0
    const today = startOfDay(new Date())
    
    topics.forEach(topic => {
      if (topic.completed) return
      topic.reviews.forEach((review, idx) => {
        if (!review.completed && idx === topic.currentStage) {
          const reviewDate = new Date(review.date)
          if (isBefore(reviewDate, addDays(today, 1))) {
            pending++
          }
        }
      })
    })

    // Count completed reviews today
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    let completedToday = 0
    topics.forEach(topic => {
      topic.reviews.forEach(review => {
        if (review.completed && review.date === todayStr) {
          completedToday++
        }
      })
    })

    return {
      total,
      pending,
      completedToday,
      mastered,
      streak: streak.count
    }
  }

  // Export data
  const exportData = () => {
    const data = { topics, streak, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `retention-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import data
  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      if (data.topics) {
        setTopics(data.topics)
      }
      if (data.streak) {
        setStreak(data.streak)
      }
      return true
    } catch {
      return false
    }
  }

  // Clear all data
  const clearAllData = () => {
    setTopics([])
    setStreak({ count: 0, lastDate: null })
  }

  const value = {
    topics,
    addTopic,
    updateTopic,
    deleteTopic,
    markReviewComplete,
    getTodayTasks,
    getTopicsForDate,
    getDatesWithTasks,
    getStats,
    exportData,
    importData,
    clearAllData
  }

  return (
    <TopicContext.Provider value={value}>
      {children}
    </TopicContext.Provider>
  )
}
