import { useState } from 'react'
import ProjectLauncherDemo from './ProjectLauncherDemo'
import GitDemo from './GitDemo'
import './App.css'

function App() {
  const [demoType, setDemoType] = useState<'launcher' | 'git' | null>(null)

  if (demoType === 'launcher') {
    return (
      <div>
        <button 
          onClick={() => setDemoType(null)} 
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, padding: '6px 12px', cursor: 'pointer' }}
        >
          Back to Menu
        </button>
        <ProjectLauncherDemo />
      </div>
    )
  }

  if (demoType === 'git') {
    return (
      <div>
        <button 
          onClick={() => setDemoType(null)} 
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, padding: '6px 12px', cursor: 'pointer' }}
        >
          Back to Menu
        </button>
        <GitDemo />
      </div>
    )
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
      
      <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
        <button
          type="button"
          className="counter"
          onClick={() => setDemoType('launcher')}
          style={{ padding: '12px 24px', cursor: 'pointer' }}
        >
          View ProjectLauncher Demo
        </button>
        <button
          type="button"
          className="counter"
          onClick={() => setDemoType('git')}
          style={{ padding: '12px 24px', cursor: 'pointer', backgroundColor: '#007acc' }}
        >
          View Git UI Demo
        </button>
      </div>
    </div>
  )
}

export default App


