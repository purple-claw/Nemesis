import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { addDays, format, isBefore, startOfDay } from 'date-fns'
import api from '../services/api'

const TopicContext = createContext()

export const useTopic = () => {
  const context = useContext(TopicContext)
  if (!context) {
    throw new Error('useTopic must be used within TopicProvider')
  }
  return context
}

const offlineStorage = {
  getTopics: () => {
    const data = localStorage.getItem('retention-topics-cache')
    return data ? JSON.parse(data) : []
  },
  setTopics: (topics) => {
    localStorage.setItem('retention-topics-cache', JSON.stringify(topics))
  },
  getStreak: () => {
    const data = localStorage.getItem('retention-streak-cache')
    return data ? JSON.parse(data) : { count: 0, lastDate: null }
  },
  setStreak: (streak) => {
    localStorage.setItem('retention-streak-cache', JSON.stringify(streak))
  },
  getPendingActions: () => {
    const data = localStorage.getItem('retention-pending-actions')
    return data ? JSON.parse(data) : []
  },
  addPendingAction: (action) => {
    const pending = offlineStorage.getPendingActions()
    pending.push({ ...action, timestamp: Date.now() })
    localStorage.setItem('retention-pending-actions', JSON.stringify(pending))
  },
  clearPendingActions: () => {
    localStorage.setItem('retention-pending-actions', '[]')
  }
}

export const TopicProvider = ({ children, showToast }) => {
  const [topics, setTopics] = useState(() => offlineStorage.getTopics())
  const [streak, setStreak] = useState(() => offlineStorage.getStreak())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isLoading, setIsLoading] = useState(true)
  const [serverDate, setServerDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [lastSync, setLastSync] = useState(null)

  const processPendingActions = useCallback(async () => {
    const pending = offlineStorage.getPendingActions()
    if (pending.length === 0) return

    for (const action of pending) {
      try {
        switch (action.type) {
          case 'create':
            await api.createTopic(action.data)
            break
          case 'update':
            await api.updateTopic(action.topicId, action.data)
            break
          case 'delete':
            await api.deleteTopic(action.topicId)
            break
          case 'review':
            await api.markReviewComplete(action.topicId)
            break
        }
      } catch (error) {
        console.error('Failed to process action:', action, error)
      }
    }

    offlineStorage.clearPendingActions()
    showToast?.('Synced offline changes', 'success')
  }, [showToast])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await api.initialize()
        setServerDate(api.getServerDate())
        
        const dashboardData = await api.getDashboard()
        if (dashboardData) {
          setStreak({ 
            count: dashboardData.stats.streak, 
            longest: dashboardData.stats.longestStreak 
          })
          offlineStorage.setStreak({ 
            count: dashboardData.stats.streak, 
            longest: dashboardData.stats.longestStreak 
          })
        }

        const topicsData = await api.getTopics()
        if (topicsData?.topics) {
          setTopics(topicsData.topics)
          offlineStorage.setTopics(topicsData.topics)
        }

        setLastSync(new Date())
        setIsOnline(true)
      } catch (error) {
        console.log('Offline mode - using cached data')
        setIsOnline(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()

    const syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          const timeData = await api.syncTime()
          setServerDate(timeData.date)
          await processPendingActions()
          const topicsData = await api.getTopics()
          if (topicsData?.topics) {
            setTopics(topicsData.topics)
            offlineStorage.setTopics(topicsData.topics)
          }
          setLastSync(new Date())
          setIsOnline(true)
        } catch {
          setIsOnline(false)
        }
      }
    }, 5 * 60 * 1000)

    const handleOnline = () => {
      setIsOnline(true)
      processPendingActions()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(syncInterval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [processPendingActions])

  const calculateReviewDates = (startDate) => {
    const start = new Date(startDate)
    const intervals = [1, 4, 7]
    return intervals.map(days => ({
      scheduled_date: format(addDays(start, days), 'yyyy-MM-dd'),
      review_day: days,
      completed: false
    }))
  }

  const addTopic = async (topicData) => {
    const localTopic = {
      id: 'local_' + Date.now(),
      title: topicData.title,
      category: topicData.category || 'general',
      priority: topicData.priority || 'medium',
      created_at: topicData.date || serverDate,
      notes: '',
      reviews: calculateReviewDates(topicData.date || serverDate),
      current_stage: 0,
      completed: false
    }

    setTopics(prev => {
      const updated = [...prev, localTopic]
      offlineStorage.setTopics(updated)
      return updated
    })

    if (isOnline) {
      try {
        const result = await api.createTopic(topicData)
        setTopics(prev => {
          const updated = prev.map(t => 
            t.id === localTopic.id ? result.topic : t
          )
          offlineStorage.setTopics(updated)
          return updated
        })
        return result.topic
      } catch (error) {
        offlineStorage.addPendingAction({ type: 'create', data: topicData })
        showToast?.('Saved offline - will sync when online', 'warning')
      }
    } else {
      offlineStorage.addPendingAction({ type: 'create', data: topicData })
      showToast?.('Saved offline - will sync when online', 'warning')
    }

    return localTopic
  }

  const updateTopic = async (id, updates) => {
    setTopics(prev => {
      const updated = prev.map(topic => 
        topic.id === id ? { ...topic, ...updates } : topic
      )
      offlineStorage.setTopics(updated)
      return updated
    })

    if (isOnline && !id.startsWith('local_')) {
      try {
        await api.updateTopic(id, updates)
      } catch (error) {
        offlineStorage.addPendingAction({ type: 'update', topicId: id, data: updates })
      }
    } else {
      offlineStorage.addPendingAction({ type: 'update', topicId: id, data: updates })
    }
  }

  const deleteTopic = async (id) => {
    setTopics(prev => {
      const updated = prev.filter(topic => topic.id !== id)
      offlineStorage.setTopics(updated)
      return updated
    })

    if (isOnline && !id.startsWith('local_')) {
      try {
        await api.deleteTopic(id)
      } catch (error) {
        offlineStorage.addPendingAction({ type: 'delete', topicId: id })
      }
    } else if (!id.startsWith('local_')) {
      offlineStorage.addPendingAction({ type: 'delete', topicId: id })
    }
  }

  const markReviewComplete = async (topicId) => {
    setTopics(prev => prev.map(topic => {
      if (topic.id !== topicId) return topic
      
      const nextStage = topic.current_stage + 1
      const updatedReviews = topic.reviews.map((review, idx) => 
        idx === topic.current_stage ? { ...review, completed: true } : review
      )
      
      return {
        ...topic,
        reviews: updatedReviews,
        current_stage: nextStage,
        completed: nextStage >= 3
      }
    }))

    const today = serverDate
    if (streak.lastDate !== today) {
      const newStreak = { 
        count: streak.count + 1, 
        lastDate: today,
        longest: Math.max(streak.count + 1, streak.longest || 0)
      }
      setStreak(newStreak)
      offlineStorage.setStreak(newStreak)
    }

    if (isOnline && !topicId.startsWith('local_')) {
      try {
        const result = await api.markReviewComplete(topicId)
        if (result.streak !== undefined) {
          setStreak(prev => ({ ...prev, count: result.streak }))
        }
      } catch (error) {
        offlineStorage.addPendingAction({ type: 'review', topicId })
      }
    } else {
      offlineStorage.addPendingAction({ type: 'review', topicId })
    }
  }

  const getTodayTasks = useCallback(() => {
    const today = serverDate
    const todayStart = startOfDay(new Date(today))
    
    const result = {
      today: [],
      day1: [],
      day4: [],
      day7: [],
      completed: [],
      overdue: []
    }

    topics.forEach(topic => {
      if (topic.completed) {
        result.completed.push(topic)
        return
      }

      if (topic.created_at === today && topic.current_stage === 0) {
        result.today.push(topic)
        return
      }

      const reviews = topic.reviews || []
      reviews.forEach((review, idx) => {
        if (review.completed) return
        
        const reviewDate = new Date(review.scheduled_date)
        const isOverdue = isBefore(reviewDate, todayStart)
        const isReviewToday = review.scheduled_date === today
        
        if ((isReviewToday || isOverdue) && idx === topic.current_stage) {
          if (isOverdue && !isReviewToday) {
            result.overdue.push(topic)
          } else if (review.review_day === 1) {
            result.day1.push(topic)
          } else if (review.review_day === 4) {
            result.day4.push(topic)
          } else if (review.review_day === 7) {
            result.day7.push(topic)
          }
        }
      })
    })

    return result
  }, [topics, serverDate])

  const getTopicsForDate = useCallback((date) => {
    const dateStr = format(new Date(date), 'yyyy-MM-dd')
    const result = []

    topics.forEach(topic => {
      if (topic.created_at === dateStr) {
        result.push({ ...topic, type: 'new', reviewDay: 0 })
      }

      topic.reviews?.forEach(review => {
        if (review.scheduled_date === dateStr) {
          result.push({ 
            ...topic, 
            type: 'review', 
            reviewDay: review.review_day,
            reviewCompleted: review.completed 
          })
        }
      })
    })

    return result
  }, [topics])

  const getDatesWithTasks = useCallback(() => {
    const dates = new Set()
    
    topics.forEach(topic => {
      dates.add(topic.created_at)
      topic.reviews?.forEach(review => dates.add(review.scheduled_date))
    })

    return dates
  }, [topics])

  const getStats = useCallback(() => {
    const total = topics.length
    const mastered = topics.filter(t => t.completed).length
    const today = serverDate
    
    let pending = 0
    let overdue = 0
    
    topics.forEach(topic => {
      if (topic.completed) return
      topic.reviews?.forEach((review, idx) => {
        if (!review.completed && idx === topic.current_stage) {
          if (review.scheduled_date <= today) {
            pending++
            if (review.scheduled_date < today) overdue++
          }
        }
      })
    })

    return {
      total,
      pending,
      overdue,
      mastered,
      streak: streak.count,
      longestStreak: streak.longest || 0
    }
  }, [topics, streak, serverDate])

  const exportData = () => {
    const data = { 
      topics, 
      streak, 
      exportedAt: new Date().toISOString(),
      version: '2.0'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `retention-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      if (data.topics) {
        setTopics(data.topics)
        offlineStorage.setTopics(data.topics)
      }
      if (data.streak) {
        setStreak(data.streak)
        offlineStorage.setStreak(data.streak)
      }
      return true
    } catch {
      return false
    }
  }

  const clearAllData = () => {
    setTopics([])
    setStreak({ count: 0, lastDate: null, longest: 0 })
    offlineStorage.setTopics([])
    offlineStorage.setStreak({ count: 0, lastDate: null, longest: 0 })
    offlineStorage.clearPendingActions()
  }

  const forceSync = async () => {
    if (!isOnline) {
      showToast?.('No internet connection', 'error')
      return
    }

    try {
      setIsLoading(true)
      await processPendingActions()
      const topicsData = await api.getTopics()
      if (topicsData?.topics) {
        setTopics(topicsData.topics)
        offlineStorage.setTopics(topicsData.topics)
      }
      setLastSync(new Date())
      showToast?.('Synced successfully', 'success')
    } catch (error) {
      showToast?.('Sync failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    topics,
    isLoading,
    isOnline,
    serverDate,
    lastSync,
    streak,
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
    clearAllData,
    forceSync
  }

  return (
    <TopicContext.Provider value={value}>
      {children}
    </TopicContext.Provider>
  )
}
