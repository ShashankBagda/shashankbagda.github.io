import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lifestyle from './pages/Lifestyle'
import Portfolio from './pages/Portfolio'

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement
      const total = scrollHeight - clientHeight
      const ratio = total > 0 ? scrollTop / total : 0
      setScrollProgress(ratio)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <BrowserRouter basename={base}>
      <div className="app-shell">
        <main>
          <Routes>
            <Route
              path="/portfolio"
              element={<Portfolio scrollProgress={scrollProgress} />}
            />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route
              path="*"
              element={<Portfolio scrollProgress={scrollProgress} />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
