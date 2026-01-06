import './SplashScreen.css'

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <i className="fas fa-brain"></i>
        </div>
        <h1>Retention Master</h1>
        <p>1-4-7 Spaced Repetition</p>
        <div className="splash-loader"></div>
      </div>
    </div>
  )
}

export default SplashScreen
