import { useEffect, useState } from 'react'
import './SplashScreen.css'

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 800)
    const t3 = setTimeout(() => setPhase(3), 1300)
    const t4 = setTimeout(() => onComplete?.(), 2000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onComplete])

  return (
    <div className={`splash-screen ${phase >= 3 ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className={`splash-logo ${phase >= 1 ? 'visible' : ''}`}>
          <div className="logo-icon">
            <span className="logo-1">1</span>
            <span className="logo-4">4</span>
            <span className="logo-7">7</span>
          </div>
        </div>
        <h1 className={`splash-title ${phase >= 2 ? 'visible' : ''}`}>
          Retention
        </h1>
        <p className={`splash-tagline ${phase >= 2 ? 'visible' : ''}`}>
          Master anything with spaced repetition
        </p>
        <div className={`splash-loader ${phase >= 2 ? 'visible' : ''}`}>
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
