import { useState } from 'react'
import ProjectLauncherDemo from './ProjectLauncherDemo'
import './App.css'

function App() {
  const [showDemo, setShowDemo] = useState(false)

  if (showDemo) {
    return <ProjectLauncherDemo />
  }

  return (
    <div className="landing-page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#fff'
    }}>
      <h1>ReSTAR App React Library</h1>
      <p>Components for building AI-powered applications.</p>
      
      <button
        type="button"
        className="counter"
        onClick={() => setShowDemo(true)}
        style={{ marginTop: '20px', padding: '12px 24px', cursor: 'pointer' }}
      >
        View ProjectLauncher Demo
      </button>
    </div>
  )
}

export default App

