import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Lightbulb, AlertTriangle, CheckCircle, Info,
  TrendingUp, Shield, ArrowRight, Brain, Sparkles,
  ChevronRight, Target, BarChart3
} from 'lucide-react'
import { getInsights } from '../utils/api'

const severityConfig = {
  high: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#ef4444', icon: AlertTriangle, label: 'High' },
  medium: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b', icon: AlertTriangle, label: 'Medium' },
  low: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#22c55e', icon: CheckCircle, label: 'Low' },
  info: { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', color: '#a855f7', icon: Info, label: 'Info' },
}

const categoryIcons = {
  imbalance: Target,
  bias: BarChart3,
  feature: TrendingUp,
  recommendation: Lightbulb,
}

function InsightCard({ insight, index }) {
  const [expanded, setExpanded] = useState(false)
  const config = severityConfig[insight.severity] || severityConfig.info
  const CategoryIcon = categoryIcons[insight.category] || Lightbulb

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card overflow-hidden cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
               style={{ background: config.bg, border: `1px solid ${config.border}` }}>
            <span className="text-lg">{insight.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-lg badge-${insight.severity}`}>
                {config.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
                <CategoryIcon size={10} />
                {insight.category}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}
               style={{ color: '#94a3b8' }}>
              {insight.description}
            </p>
          </div>

          {/* Expand */}
          <ChevronRight
            size={16}
            className={`flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            style={{ color: '#64748b' }}
          />
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-5 pb-5 pt-0"
        >
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
              {insight.description}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function AIInsights() {
  const navigate = useNavigate()
  const [insights, setInsights] = useState([])
  const [biasSummary, setBiasSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await getInsights()
        if (res.data.success) {
          setInsights(res.data.insights)
          setBiasSummary(res.data.bias_summary)
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchInsights()
  }, [])

  const filteredInsights = filter === 'all'
    ? insights
    : insights.filter(i => i.severity === filter)

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Good': return '#22c55e'
      case 'Moderate': return '#f59e0b'
      case 'Poor': return '#f97316'
      case 'Critical': return '#ef4444'
      default: return '#94a3b8'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles size={24} style={{ color: '#f97316' }} />
          AI Insights
        </h1>
        <p style={{ color: '#94a3b8' }}>Intelligent analysis and recommendations powered by our insights engine.</p>
      </div>

      {loading ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <div className="spinner mb-4" />
          <p className="text-white font-medium">Generating insights...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
               style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.15)' }}>
            <Brain size={36} style={{ color: '#a855f7' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Insights Available</h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: '#94a3b8' }}>
            Run a bias analysis first to generate AI-powered insights and recommendations.
          </p>
          <button onClick={() => navigate('/analysis')} className="btn-primary flex items-center gap-2 mx-auto">
            Go to Analysis <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {biasSummary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                     style={{ background: `radial-gradient(circle, ${getRatingColor(biasSummary.rating)}, transparent)` }} />
                <div className="text-xs mb-2" style={{ color: '#64748b' }}>Fairness Score</div>
                <div className="text-3xl font-bold" style={{ color: getRatingColor(biasSummary.rating) }}>
                  {biasSummary.fairness_score}%
                </div>
                <div className="text-xs mt-1 font-medium" style={{ color: getRatingColor(biasSummary.rating) }}>
                  {biasSummary.rating}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5"
              >
                <div className="text-xs mb-2" style={{ color: '#64748b' }}>Total Insights</div>
                <div className="text-3xl font-bold text-white">{biasSummary.total_insights}</div>
                <div className="text-xs mt-1" style={{ color: '#64748b' }}>Generated</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-5"
              >
                <div className="text-xs mb-2" style={{ color: '#64748b' }}>High Severity</div>
                <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>
                  {biasSummary.high_severity}
                </div>
                <div className="text-xs mt-1" style={{ color: '#64748b' }}>Issues found</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-5"
              >
                <div className="text-xs mb-2" style={{ color: '#64748b' }}>Recommendations</div>
                <div className="text-3xl font-bold" style={{ color: '#a855f7' }}>
                  {insights.filter(i => i.category === 'recommendation').length}
                </div>
                <div className="text-xs mt-1" style={{ color: '#64748b' }}>Actionable</div>
              </motion.div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'high', 'medium', 'low', 'info'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  filter === f
                    ? 'text-white'
                    : 'hover:bg-white/5'
                }`}
                style={{
                  background: filter === f
                    ? (f === 'high' ? 'rgba(239,68,68,0.2)' :
                       f === 'medium' ? 'rgba(245,158,11,0.2)' :
                       f === 'low' ? 'rgba(34,197,94,0.2)' :
                       f === 'info' ? 'rgba(168,85,247,0.2)' :
                       'rgba(249,115,22,0.2)')
                    : 'rgba(255,255,255,0.04)',
                  color: filter !== f ? '#94a3b8' : undefined,
                  border: `1px solid ${filter === f ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {f === 'all' ? `All (${insights.length})` :
                 `${f.charAt(0).toUpperCase() + f.slice(1)} (${insights.filter(i => i.severity === f).length})`}
              </button>
            ))}
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            {filteredInsights.map((insight, i) => (
              <InsightCard key={i} insight={insight} index={i} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
