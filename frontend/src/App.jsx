import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import BiasAnalysis from './pages/BiasAnalysis'
import AIInsights from './pages/AIInsights'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-dots">
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/upload" element={<AppLayout><UploadPage /></AppLayout>} />
        <Route path="/analysis" element={<AppLayout><BiasAnalysis /></AppLayout>} />
        <Route path="/insights" element={<AppLayout><AIInsights /></AppLayout>} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
