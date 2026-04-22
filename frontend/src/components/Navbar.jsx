import { useLocation } from 'react-router-dom'
import { Bell, Search, User } from 'lucide-react'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Dataset',
  '/analysis': 'Bias Analysis',
  '/insights': 'AI Insights',
}

export default function Navbar() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'FairAI'

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b shrink-0"
      style={{ 
        background: 'rgba(13, 13, 18, 0.8)',
        borderColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Left: Page Title */}
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={14} style={{ color: '#64748b' }} />
          <span style={{ color: '#64748b' }}>Search...</span>
        </div>

        {/* Notification */}
        <button className="relative p-2.5 rounded-xl transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <Bell size={18} style={{ color: '#94a3b8' }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 ml-1 border-l" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs" style={{ color: '#64748b' }}>Pro Plan</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
            <User size={16} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}
