import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Lifestyle from './pages/Lifestyle'
import Portfolio from './pages/Portfolio'

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')

  return (
    <BrowserRouter basename={base}>
      <div className="app-shell">
        <header>
          <h1>Shashank Bagda – React Area</h1>
          <nav>
            <Link to="/">Home</Link> | <Link to="/lifestyle">Lifestyle</Link> |{' '}
            <Link to="/portfolio">Portfolio</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <h2>Welcome</h2>
                  <p>
                    This is the new React section served from
                    <code> /app/</code>. Your existing static sites at
                    <code> /</code>, <code> /lifestyle/</code> and
                    <code> /portfolio/</code> remain unchanged.
                  </p>
                </div>
              }
            />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
