import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lifestyle from './pages/Lifestyle'
import Portfolio from './pages/Portfolio'

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')

  return (
    <BrowserRouter basename={base}>
      <div className="app-shell">
        <main>
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
