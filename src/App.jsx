import { useState, useEffect } from 'react'
import { TopicProvider } from './context/TopicContext'
import SplashScreen from './components/SplashScreen'
import Header from './components/Header'
import Navigation from './components/Navigation'
import KanbanView from './components/KanbanView'
import CalendarView from './components/CalendarView'
import TopicsView from './components/TopicsView'
import BottomNav from './components/BottomNav'
import FAB from './components/FAB'
import AddTopicModal from './components/AddTopicModal'
import TopicDetailModal from './components/TopicDetailModal'
import StatsModal from './components/StatsModal'
import SideMenu from './components/SideMenu'
import AboutModal from './components/AboutModal'
import Toast from './components/Toast'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('kanban')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showSideMenu, setShowSideMenu] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openTopicDetail = (topicId) => {
    setSelectedTopicId(topicId)
    setShowTopicModal(true)
  }

  if (loading) {
    return <SplashScreen />
  }

  return (
    <TopicProvider showToast={showToast}>
      <div className="app">
        <Header 
          onMenuClick={() => setShowSideMenu(true)}
          onStatsClick={() => setShowStatsModal(true)}
        />
        
        <Navigation currentView={currentView} setCurrentView={setCurrentView} />
        
        <main className="main-content">
          {currentView === 'kanban' && (
            <KanbanView onTopicClick={openTopicDetail} />
          )}
          {currentView === 'calendar' && (
            <CalendarView onTopicClick={openTopicDetail} />
          )}
          {currentView === 'topics' && (
            <TopicsView onTopicClick={openTopicDetail} />
          )}
        </main>

        <FAB onClick={() => setShowAddModal(true)} />
        
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

        {showAddModal && (
          <AddTopicModal 
            onClose={() => setShowAddModal(false)}
            showToast={showToast}
          />
        )}

        {showTopicModal && selectedTopicId && (
          <TopicDetailModal 
            topicId={selectedTopicId}
            onClose={() => {
              setShowTopicModal(false)
              setSelectedTopicId(null)
            }}
            showToast={showToast}
          />
        )}

        {showStatsModal && (
          <StatsModal onClose={() => setShowStatsModal(false)} />
        )}

        {showSideMenu && (
          <SideMenu 
            onClose={() => setShowSideMenu(false)}
            onAboutClick={() => {
              setShowSideMenu(false)
              setShowAboutModal(true)
            }}
            showToast={showToast}
          />
        )}

        {showAboutModal && (
          <AboutModal onClose={() => setShowAboutModal(false)} />
        )}

        {toast && (
          <Toast message={toast.message} type={toast.type} />
        )}
      </div>
    </TopicProvider>
  )
}

export default App
