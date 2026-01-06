import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Supabase client - Replace with your credentials from supabase.com (FREE tier)
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// SERVER TIME ENDPOINT - Critical for sync
// ============================================
app.get('/api/time', (req, res) => {
  const now = new Date()
  res.json({
    timestamp: now.getTime(),
    iso: now.toISOString(),
    date: now.toISOString().split('T')[0],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
})

// ============================================
// USER MANAGEMENT
// ============================================

// Register/Login user (creates if not exists)
app.post('/api/users/register', async (req, res) => {
  try {
    const { deviceId, name } = req.body
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' })
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('device_id', deviceId)
      .single()

    if (existing) {
      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', existing.id)
      
      return res.json({ user: existing, isNew: false })
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      device_id: deviceId,
      name: name || 'Learner',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      settings: { theme: 'dark', notifications: true }
    }

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single()

    if (error) throw error

    res.json({ user: data, isNew: true })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get user by device ID
app.get('/api/users/:deviceId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('device_id', req.params.deviceId)
      .single()

    if (error) throw error
    res.json({ user: data })
  } catch (error) {
    res.status(404).json({ error: 'User not found' })
  }
})

// ============================================
// TOPICS CRUD
// ============================================

// Get all topics for a user
app.get('/api/topics', async (req, res) => {
  try {
    const { deviceId } = req.query
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        reviews (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ topics: data })
  } catch (error) {
    console.error('Get topics error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create a new topic
app.post('/api/topics', async (req, res) => {
  try {
    const { deviceId, title, category, priority, date, notes } = req.body

    if (!deviceId || !title) {
      return res.status(400).json({ error: 'Device ID and title required' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const startDate = date || new Date().toISOString().split('T')[0]
    const topicId = uuidv4()

    // Create topic
    const newTopic = {
      id: topicId,
      user_id: user.id,
      title,
      category: category || 'general',
      priority: priority || 'medium',
      notes: notes || '',
      created_at: startDate,
      current_stage: 0,
      completed: false
    }

    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .insert([newTopic])
      .select()
      .single()

    if (topicError) throw topicError

    // Create 1-4-7 review schedule
    const reviews = [
      { topic_id: topicId, review_day: 1, scheduled_date: addDays(startDate, 1), completed: false },
      { topic_id: topicId, review_day: 4, scheduled_date: addDays(startDate, 4), completed: false },
      { topic_id: topicId, review_day: 7, scheduled_date: addDays(startDate, 7), completed: false }
    ]

    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .insert(reviews)
      .select()

    if (reviewsError) throw reviewsError

    // Log activity
    await logActivity(user.id, 'topic_created', { topicId, title })

    res.json({ topic: { ...topic, reviews: reviewsData } })
  } catch (error) {
    console.error('Create topic error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update a topic
app.put('/api/topics/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, category, priority, notes } = req.body

    const updates = {}
    if (title !== undefined) updates.title = title
    if (category !== undefined) updates.category = category
    if (priority !== undefined) updates.priority = priority
    if (notes !== undefined) updates.notes = notes

    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ topic: data })
  } catch (error) {
    console.error('Update topic error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete a topic
app.delete('/api/topics/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Delete reviews first (cascade)
    await supabase.from('reviews').delete().eq('topic_id', id)

    // Delete topic
    const { error } = await supabase.from('topics').delete().eq('id', id)

    if (error) throw error

    res.json({ success: true })
  } catch (error) {
    console.error('Delete topic error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// REVIEWS
// ============================================

// Mark a review as complete
app.post('/api/reviews/:topicId/complete', async (req, res) => {
  try {
    const { topicId } = req.params
    const { deviceId } = req.body

    // Get topic with reviews
    const { data: topic } = await supabase
      .from('topics')
      .select('*, reviews(*)')
      .eq('id', topicId)
      .single()

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    const currentStage = topic.current_stage
    const reviews = topic.reviews.sort((a, b) => a.review_day - b.review_day)

    if (currentStage >= reviews.length) {
      return res.status(400).json({ error: 'All reviews completed' })
    }

    // Mark current review as complete
    const currentReview = reviews[currentStage]
    await supabase
      .from('reviews')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', currentReview.id)

    // Update topic stage
    const newStage = currentStage + 1
    const isCompleted = newStage >= 3

    await supabase
      .from('topics')
      .update({ 
        current_stage: newStage,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', topicId)

    // Update streak
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single()

    if (user) {
      await updateStreak(user.id)
      await logActivity(user.id, 'review_completed', { topicId, stage: newStage })
    }

    // Get updated topic
    const { data: updatedTopic } = await supabase
      .from('topics')
      .select('*, reviews(*)')
      .eq('id', topicId)
      .single()

    res.json({ topic: updatedTopic, streak: await getStreak(user?.id) })
  } catch (error) {
    console.error('Complete review error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// DASHBOARD & STATS
// ============================================

// Get dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    const { deviceId } = req.query

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const today = new Date().toISOString().split('T')[0]

    // Get topics with reviews due today or overdue
    const { data: topics } = await supabase
      .from('topics')
      .select('*, reviews(*)')
      .eq('user_id', user.id)

    const stats = {
      total: topics?.length || 0,
      pending: 0,
      overdue: 0,
      mastered: 0,
      streak: await getStreak(user.id),
      longestStreak: await getLongestStreak(user.id)
    }

    topics?.forEach(topic => {
      if (topic.completed) {
        stats.mastered++
        return
      }

      const reviews = topic.reviews || []
      const currentReview = reviews.find((r, idx) => idx === topic.current_stage && !r.completed)
      
      if (currentReview) {
        if (currentReview.scheduled_date <= today) {
          stats.pending++
          if (currentReview.scheduled_date < today) {
            stats.overdue++
          }
        }
      }
    })

    res.json({ stats, serverTime: new Date().toISOString() })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get calendar data
app.get('/api/calendar', async (req, res) => {
  try {
    const { deviceId, month, year } = req.query

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get all topics with reviews
    const { data: topics } = await supabase
      .from('topics')
      .select('*, reviews(*)')
      .eq('user_id', user.id)

    // Build calendar data
    const calendarData = {}

    topics?.forEach(topic => {
      // Add creation date
      if (!calendarData[topic.created_at]) {
        calendarData[topic.created_at] = []
      }
      calendarData[topic.created_at].push({
        id: topic.id,
        title: topic.title,
        type: 'new'
      })

      // Add review dates
      topic.reviews?.forEach(review => {
        if (!calendarData[review.scheduled_date]) {
          calendarData[review.scheduled_date] = []
        }
        calendarData[review.scheduled_date].push({
          id: topic.id,
          title: topic.title,
          type: 'review',
          reviewDay: review.review_day,
          completed: review.completed
        })
      })
    })

    res.json({ calendar: calendarData })
  } catch (error) {
    console.error('Calendar error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// SYNC ENDPOINT
// ============================================

app.post('/api/sync', async (req, res) => {
  try {
    const { deviceId, localTopics, lastSync } = req.body

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('device_id', deviceId)
      .single()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get server topics
    const { data: serverTopics } = await supabase
      .from('topics')
      .select('*, reviews(*)')
      .eq('user_id', user.id)

    // Simple sync: return server data (client will merge)
    res.json({
      serverTopics,
      serverTime: new Date().toISOString(),
      streak: await getStreak(user.id)
    })
  } catch (error) {
    console.error('Sync error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function addDays(dateStr, days) {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

async function updateStreak(userId) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    // Create new streak
    await supabase.from('streaks').insert([{
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today
    }])
    return
  }

  const lastDate = streak.last_activity_date
  const yesterday = addDays(today, -1)

  if (lastDate === today) {
    // Already counted today
    return
  } else if (lastDate === yesterday) {
    // Consecutive day
    const newStreak = streak.current_streak + 1
    await supabase.from('streaks').update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, streak.longest_streak),
      last_activity_date: today
    }).eq('user_id', userId)
  } else {
    // Streak broken
    await supabase.from('streaks').update({
      current_streak: 1,
      last_activity_date: today
    }).eq('user_id', userId)
  }
}

async function getStreak(userId) {
  if (!userId) return 0
  
  const { data } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single()

  return data?.current_streak || 0
}

async function getLongestStreak(userId) {
  if (!userId) return 0
  
  const { data } = await supabase
    .from('streaks')
    .select('longest_streak')
    .eq('user_id', userId)
    .single()

  return data?.longest_streak || 0
}

async function logActivity(userId, action, data) {
  try {
    await supabase.from('activity_log').insert([{
      user_id: userId,
      action,
      data,
      created_at: new Date().toISOString()
    }])
  } catch (error) {
    console.error('Log activity error:', error)
  }
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Retention API Server running on port ${PORT}`)
  console.log(`📅 Server time: ${new Date().toISOString()}`)
  console.log(`\n📋 Endpoints:`)
  console.log(`   GET  /api/time - Server time`)
  console.log(`   POST /api/users/register - Register/login user`)
  console.log(`   GET  /api/topics - Get all topics`)
  console.log(`   POST /api/topics - Create topic`)
  console.log(`   PUT  /api/topics/:id - Update topic`)
  console.log(`   DELETE /api/topics/:id - Delete topic`)
  console.log(`   POST /api/reviews/:topicId/complete - Complete review`)
  console.log(`   GET  /api/dashboard - Get stats`)
  console.log(`   GET  /api/calendar - Get calendar data`)
  console.log(`   POST /api/sync - Sync data`)
})
