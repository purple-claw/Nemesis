// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Device ID for anonymous auth
const getDeviceId = () => {
  let deviceId = localStorage.getItem('retention-device-id')
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now()
    localStorage.setItem('retention-device-id', deviceId)
  }
  return deviceId
}

// API Client
class RetentionAPI {
  constructor() {
    this.baseUrl = API_URL
    this.userId = null
    this.serverTimeDiff = 0
    this.lastSyncTime = null
    this.isOnline = navigator.onLine
    
    window.addEventListener('online', () => {
      this.isOnline = true
      this.sync()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  getServerTime() {
    return new Date(Date.now() + this.serverTimeDiff)
  }

  getServerDate() {
    return this.getServerTime().toISOString().split('T')[0]
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    if (options.body) {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (data.serverTime) {
        const serverTimestamp = new Date(data.serverTime.timestamp).getTime()
        this.serverTimeDiff = serverTimestamp - Date.now()
      }

      if (!response.ok) {
        throw new Error(data.error || 'API Error')
      }

      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  async initialize() {
    try {
      const deviceId = getDeviceId()
      const data = await this.request('/api/users/register', {
        method: 'POST',
        body: { deviceId }
      })
      this.userId = data.user.id
      localStorage.setItem('retention-user-id', this.userId)
      return data
    } catch (error) {
      this.userId = localStorage.getItem('retention-user-id')
      throw error
    }
  }

  async syncTime() {
    try {
      const data = await this.request('/api/time')
      return data
    } catch {
      return { date: new Date().toISOString().split('T')[0] }
    }
  }

  async getTopics() {
    return this.request(`/api/topics?userId=${this.userId}`)
  }

  async createTopic(topicData) {
    return this.request('/api/topics', {
      method: 'POST',
      body: {
        userId: this.userId,
        ...topicData,
        date: topicData.date || this.getServerDate()
      }
    })
  }

  async updateTopic(topicId, updates) {
    return this.request(`/api/topics/${topicId}`, {
      method: 'PUT',
      body: updates
    })
  }

  async deleteTopic(topicId) {
    return this.request(`/api/topics/${topicId}`, {
      method: 'DELETE'
    })
  }

  async markReviewComplete(topicId) {
    return this.request(`/api/topics/${topicId}/review`, {
      method: 'POST',
      body: { userId: this.userId }
    })
  }

  async getDashboard() {
    return this.request(`/api/dashboard?userId=${this.userId}`)
  }

  async getCalendar(year, month) {
    return this.request(`/api/calendar/${year}/${month}?userId=${this.userId}`)
  }

  async getStats() {
    return this.request(`/api/stats?userId=${this.userId}`)
  }

  async sync() {
    if (!this.isOnline) return null
    
    try {
      const data = await this.request('/api/sync', {
        method: 'POST',
        body: {
          userId: this.userId,
          lastSyncTime: this.lastSyncTime
        }
      })
      this.lastSyncTime = data.syncedAt
      return data
    } catch (error) {
      console.error('Sync failed:', error)
      return null
    }
  }
}

const api = new RetentionAPI()

export default api
export { getDeviceId }
