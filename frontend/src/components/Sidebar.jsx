import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Upload, BarChart3, Lightbulb, 
  Shield, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Data', icon: Upload },
  { path: '/analysis', label: 'Bias Analysis', icon: BarChart3 },
  { path: '/insights', label: 'AI Insights', icon: Lightbulb },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`${collapsed ? 'w-20' : 'w-64'} h-screen flex flex-col border-r transition-all duration-300 ease-in-out`}
      style={{ 
        background: 'rgba(13, 13, 18, 0.95)',
        borderColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
          <Shield size={20} className="text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="gradient-text">FairAI</span>
            </h1>
            <p className="text-xs" style={{ color: '#64748b' }}>Bias Detection</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 mt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <span>{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ color: '#64748b' }}
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
