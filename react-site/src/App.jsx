import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lifestyle from './pages/Lifestyle'
import Portfolio from './pages/Portfolio'

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsReady(true)
    }, 900)

    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <BrowserRouter basename={base}>
      <div className="app-shell">
        {!isReady && (
          <div className="page-loader" aria-label="Loading Shashank Bagda site">
            <div className="loader-orbit">
              <div className="loader-core" />
              <div className="loader-ring loader-ring--one" />
              <div className="loader-ring loader-ring--two" />
            </div>
            <p className="loader-caption">Shashank Bagda · Portfolio</p>
          </div>
        )}
        <main className={isReady ? 'is-ready' : ''}>
          <Routes>
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="*" element={<Portfolio />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
