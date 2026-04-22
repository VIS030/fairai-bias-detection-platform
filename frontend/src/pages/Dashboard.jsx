import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart3, Users, Target, Shield, TrendingUp, 
  ArrowRight, Database, Zap, Activity 
} from 'lucide-react'
import { getAnalysisResults, getDatasetInfo } from '../utils/api'

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
           style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <TrendingUp size={14} style={{ color: '#22c55e' }} />
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs" style={{ color: '#64748b' }}>{label}</div>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [datasetInfo, setDatasetInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [analysisRes, datasetRes] = await Promise.allSettled([
          getAnalysisResults(),
          getDatasetInfo()
        ])
        if (analysisRes.status === 'fulfilled' && analysisRes.value.data.success) {
          setAnalysis(analysisRes.value.data)
        }
        if (datasetRes.status === 'fulfilled' && datasetRes.value.data.success) {
          setDatasetInfo(datasetRes.value.data)
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const hasData = analysis && analysis.success
  const biasMetrics = analysis?.bias_metrics || {}
  const modelMetrics = analysis?.model_metrics || {}
  const dpd = Math.abs(biasMetrics?.demographic_parity_difference || 0)
  const fairnessScore = Math.max(0, Math.min(100, Math.round((1 - dpd) * 100)))

  const getFairnessRating = (score) => {
    if (score >= 80) return { label: 'Good', color: '#22c55e' }
    if (score >= 60) return { label: 'Moderate', color: '#f59e0b' }
    if (score >= 40) return { label: 'Poor', color: '#f97316' }
    return { label: 'Critical', color: '#ef4444' }
  }

  const rating = getFairnessRating(fairnessScore)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(168,85,247,0.06))',
          border: '1px solid rgba(249, 115, 22, 0.1)',
        }}
      >
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome to FairAI 👋</h1>
            <p style={{ color: '#94a3b8' }}>
              {hasData 
                ? 'Your latest bias analysis results are ready.'
                : 'Upload a dataset to start detecting and mitigating bias.'}
            </p>
          </div>
          <button 
            onClick={() => navigate(hasData ? '/analysis' : '/upload')}
            className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
          >
            {hasData ? 'View Analysis' : 'Upload Data'} <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {hasData ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Database}
              label="Total Records"
              value={(analysis.dataset_summary?.total_records || 0).toLocaleString()}
              color="#a855f7"
              delay={0.1}
            />
            <StatCard
              icon={Shield}
              label="Fairness Score"
              value={`${fairnessScore}%`}
              color={rating.color}
              delay={0.2}
            />
            <StatCard
              icon={Target}
              label="Model Accuracy"
              value={`${((modelMetrics.accuracy || 0) * 100).toFixed(1)}%`}
              color="#f97316"
              delay={0.3}
            />
            <StatCard
              icon={Activity}
              label="Fairness Rating"
              value={rating.label}
              color={rating.color}
              delay={0.4}
            />
          </div>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Bias Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={16} style={{ color: '#f97316' }} />
                Bias Metrics Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: '#94a3b8' }}>Demographic Parity Diff</span>
                    <span className="text-sm font-semibold" style={{ color: dpd > 0.1 ? '#ef4444' : '#22c55e' }}>
                      {(biasMetrics.demographic_parity_difference || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ 
                      width: `${Math.min(Math.abs(biasMetrics.demographic_parity_difference || 0) * 200, 100)}%`,
                      background: dpd > 0.1 ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #22c55e, #10b981)'
                    }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: '#94a3b8' }}>Equalized Odds Diff</span>
                    <span className="text-sm font-semibold" style={{ 
                      color: Math.abs(biasMetrics.equalized_odds_difference || 0) > 0.1 ? '#ef4444' : '#22c55e'
                    }}>
                      {(biasMetrics.equalized_odds_difference || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ 
                      width: `${Math.min(Math.abs(biasMetrics.equalized_odds_difference || 0) * 200, 100)}%`,
                      background: Math.abs(biasMetrics.equalized_odds_difference || 0) > 0.1 
                        ? 'linear-gradient(90deg, #ef4444, #f97316)' 
                        : 'linear-gradient(90deg, #22c55e, #10b981)'
                    }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Group Outcomes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Users size={16} style={{ color: '#a855f7' }} />
                Group Outcome Rates
              </h3>
              <div className="space-y-4">
                {(analysis.group_metrics || []).map((g, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-white">{g.group}</span>
                      <span className="text-sm font-semibold" style={{ color: '#f97316' }}>
                        {(g.positive_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ 
                        width: `${g.positive_rate * 100}%`,
                        background: i === 0 ? 'linear-gradient(90deg, #f97316, #f59e0b)' : 'linear-gradient(90deg, #a855f7, #7c3aed)'
                      }} />
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#64748b' }}>
                      {g.positive_count.toLocaleString()} / {g.count.toLocaleString()} positive
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/analysis')}
              className="glass-card p-4 flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(249,115,22,0.1)' }}>
                <BarChart3 size={18} style={{ color: '#f97316' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Detailed Analysis</p>
                <p className="text-xs" style={{ color: '#64748b' }}>View charts & metrics</p>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/insights')}
              className="glass-card p-4 flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(168,85,247,0.1)' }}>
                <Zap size={18} style={{ color: '#a855f7' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI Insights</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Smart recommendations</p>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/upload')}
              className="glass-card p-4 flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(34,197,94,0.1)' }}>
                <Database size={18} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">New Dataset</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Upload another CSV</p>
              </div>
            </motion.button>
          </div>
        </>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-12 text-center"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
               style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.15)' }}>
            <Database size={36} style={{ color: '#f97316' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Analysis Data Yet</h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: '#94a3b8' }}>
            Upload a dataset and run the bias analysis pipeline to see your dashboard come alive with insights.
          </p>
          <button onClick={() => navigate('/upload')} className="btn-primary flex items-center gap-2 mx-auto">
            Get Started <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
