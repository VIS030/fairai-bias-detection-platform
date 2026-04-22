import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  BarChart3, Zap, CheckCircle, AlertTriangle, ArrowRight,
  TrendingDown, TrendingUp, RefreshCw, Play, Shield
} from 'lucide-react'
import { runAnalysis, applyMitigation, getAnalysisResults } from '../utils/api'
import { useNavigate } from 'react-router-dom'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16 }
    },
    tooltip: {
      backgroundColor: '#1a1a24',
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      titleFont: { family: 'Inter', weight: '600' },
      bodyFont: { family: 'Inter' }
    }
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.03)' },
      border: { color: 'rgba(255,255,255,0.06)' }
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      grid: { color: 'rgba(255,255,255,0.03)' },
      border: { color: 'rgba(255,255,255,0.06)' }
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16 }
    },
    tooltip: {
      backgroundColor: '#1a1a24',
      titleColor: '#f8fafc',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
    }
  },
  cutout: '65%'
}

function MetricCard({ label, value, threshold, icon: Icon, color }) {
  const isBad = Math.abs(value) > threshold
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${isBad ? 'badge-high' : 'badge-low'}`}>
          {isBad ? 'Biased' : 'Fair'}
        </span>
      </div>
      <div className="text-xl font-bold text-white">{value?.toFixed(4)}</div>
      <div className="text-xs mt-1" style={{ color: '#64748b' }}>{label}</div>
      <div className="text-xs mt-2" style={{ color: '#64748b' }}>
        Threshold: ±{threshold}
      </div>
    </div>
  )
}

export default function BiasAnalysis() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [mitigation, setMitigation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mitigating, setMitigating] = useState(false)
  const [step, setStep] = useState('idle') // idle, analyzing, done, mitigating, mitigated

  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await getAnalysisResults()
        if (res.data.success) {
          setAnalysis(res.data)
          setStep('done')
          if (res.data.mitigation_results) {
            setMitigation(res.data.mitigation_results)
            setStep('mitigated')
          }
        }
      } catch {}
    }
    checkExisting()
  }, [])

  const handleRunAnalysis = async () => {
    setStep('analyzing')
    setLoading(true)
    setMitigation(null)
    try {
      const res = await runAnalysis()
      if (res.data.success) {
        setAnalysis(res.data)
        setStep('done')
      }
    } catch (err) {
      console.error(err)
      setStep('idle')
    }
    setLoading(false)
  }

  const handleMitigate = async () => {
    setStep('mitigating')
    setMitigating(true)
    try {
      const res = await applyMitigation()
      if (res.data.success) {
        setMitigation(res.data)
        setStep('mitigated')
      }
    } catch (err) {
      console.error(err)
      setStep('done')
    }
    setMitigating(false)
  }

  const groups = analysis?.group_metrics || []
  const biasMetrics = analysis?.bias_metrics || {}
  const modelMetrics = analysis?.model_metrics || {}
  const featureImportance = analysis?.feature_importance || {}

  // Chart data for group comparison
  const barData = {
    labels: groups.map(g => g.group),
    datasets: [
      {
        label: 'Positive Outcome Rate',
        data: groups.map(g => (g.positive_rate * 100).toFixed(1)),
        backgroundColor: ['rgba(249, 115, 22, 0.7)', 'rgba(168, 85, 247, 0.7)'],
        borderColor: ['#f97316', '#a855f7'],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  // Fair vs Unfair pie
  const dpd = Math.abs(biasMetrics?.demographic_parity_difference || 0)
  const fairPercent = Math.max(0, Math.round((1 - dpd) * 100))
  const unfairPercent = 100 - fairPercent

  const pieData = {
    labels: ['Fair', 'Unfair'],
    datasets: [{
      data: [fairPercent, unfairPercent],
      backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(239, 68, 68, 0.7)'],
      borderColor: ['#22c55e', '#ef4444'],
      borderWidth: 2,
    }]
  }

  // Feature importance bar
  const featureData = {
    labels: Object.keys(featureImportance).slice(0, 8),
    datasets: [{
      label: 'Feature Weight',
      data: Object.values(featureImportance).slice(0, 8),
      backgroundColor: Object.keys(featureImportance).slice(0, 8).map(k =>
        k === 'sex' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(249, 115, 22, 0.5)'
      ),
      borderColor: Object.keys(featureImportance).slice(0, 8).map(k =>
        k === 'sex' ? '#ef4444' : '#f97316'
      ),
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    }]
  }

  // Mitigation comparison chart
  const mitigationBarData = mitigation ? {
    labels: ['Demographic Parity', 'Equalized Odds'],
    datasets: [
      {
        label: 'Before Mitigation',
        data: [
          Math.abs(mitigation.before.demographic_parity_difference),
          Math.abs(mitigation.before.equalized_odds_difference)
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'After Mitigation',
        data: [
          Math.abs(mitigation.after.demographic_parity_difference),
          Math.abs(mitigation.after.equalized_odds_difference)
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  } : null

  // Mitigation group comparison
  const mitigationGroupData = mitigation ? {
    labels: mitigation.before_groups.map(g => g.group),
    datasets: [
      {
        label: 'Before',
        data: mitigation.before_groups.map(g => (g.positive_rate * 100).toFixed(1)),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'After',
        data: mitigation.after_groups.map(g => (g.positive_rate * 100).toFixed(1)),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  } : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header & Action */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bias Analysis</h1>
          <p style={{ color: '#94a3b8' }}>Detect and visualize bias in your ML pipeline.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRunAnalysis} disabled={loading}
                  className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 disabled:opacity-50">
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Analyzing...</>
                     : <><Play size={16} /> Run Analysis</>}
          </button>
          {step === 'done' && (
            <button onClick={handleMitigate} disabled={mitigating}
                    className="btn-secondary text-sm py-2.5 px-5 flex items-center gap-2 disabled:opacity-50"
                    style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}>
              {mitigating ? <><RefreshCw size={16} className="animate-spin" /> Mitigating...</>
                          : <><Zap size={16} /> Apply Mitigation</>}
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <div className="spinner mb-4" />
          <p className="text-white font-medium">Running bias analysis pipeline...</p>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>Training model & computing fairness metrics</p>
        </div>
      )}

      {/* Analysis Results */}
      {step !== 'idle' && !loading && analysis && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Demographic Parity Diff"
              value={biasMetrics.demographic_parity_difference || 0}
              threshold={0.1}
              icon={BarChart3}
              color="#f97316"
            />
            <MetricCard
              label="Equalized Odds Diff"
              value={biasMetrics.equalized_odds_difference || 0}
              threshold={0.1}
              icon={Shield}
              color="#a855f7"
            />
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <TrendingUp size={16} style={{ color: '#22c55e' }} />
                </div>
              </div>
              <div className="text-xl font-bold text-white">{((modelMetrics.accuracy || 0) * 100).toFixed(1)}%</div>
              <div className="text-xs mt-1" style={{ color: '#64748b' }}>Model Accuracy</div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <TrendingUp size={16} style={{ color: '#f59e0b' }} />
                </div>
              </div>
              <div className="text-xl font-bold text-white">{((modelMetrics.f1_score || 0) * 100).toFixed(1)}%</div>
              <div className="text-xs mt-1" style={{ color: '#64748b' }}>F1 Score</div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Group Comparison Bar */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={16} style={{ color: '#f97316' }} />
                Positive Outcome Rate by Group
              </h3>
              <div className="chart-container">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            {/* Fairness Pie */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={16} style={{ color: '#22c55e' }} />
                Fairness Score Breakdown
              </h3>
              <div className="chart-container flex items-center justify-center">
                <div style={{ width: '220px', height: '220px' }}>
                  <Doughnut data={pieData} options={doughnutOptions} />
                </div>
                <div className="ml-6">
                  <div className="text-4xl font-bold gradient-text-green mb-1">{fairPercent}%</div>
                  <div className="text-xs" style={{ color: '#64748b' }}>Fairness Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingDown size={16} style={{ color: '#f59e0b' }} />
              Feature Importance (Top 8)
            </h3>
            <div style={{ height: '280px' }}>
              <Bar data={featureData} options={{
                ...chartOptions,
                indexAxis: 'y',
                plugins: { ...chartOptions.plugins, legend: { display: false } }
              }} />
            </div>
          </div>
        </>
      )}

      {/* Mitigation Results */}
      {mitigation && step === 'mitigated' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <CheckCircle size={24} style={{ color: '#22c55e' }} />
            <div className="flex-1">
              <p className="font-medium text-white">Bias Mitigation Applied Successfully!</p>
              <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
                Demographic Parity improved by {(mitigation.improvement.demographic_parity * 100).toFixed(1)}% | 
                Accuracy change: {(mitigation.improvement.accuracy_change * 100).toFixed(1)}%
              </p>
            </div>
          </motion.div>

          {/* Before vs After */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Metrics Comparison */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={16} style={{ color: '#22c55e' }} />
                Before vs After: Bias Metrics
              </h3>
              <div className="chart-container">
                <Bar data={mitigationBarData} options={chartOptions} />
              </div>
            </div>

            {/* Group Rate Comparison */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={16} style={{ color: '#a855f7' }} />
                Before vs After: Group Rates
              </h3>
              <div className="chart-container">
                <Bar data={mitigationGroupData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-semibold text-white">Detailed Metrics Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Demographic Parity', before: mitigation.before.demographic_parity_difference, after: mitigation.after.demographic_parity_difference },
                    { label: 'Equalized Odds', before: mitigation.before.equalized_odds_difference, after: mitigation.after.equalized_odds_difference },
                    { label: 'Accuracy', before: mitigation.before.accuracy, after: mitigation.after.accuracy },
                    { label: 'Precision', before: mitigation.before.precision, after: mitigation.after.precision },
                    { label: 'Recall', before: mitigation.before.recall, after: mitigation.after.recall },
                    { label: 'F1 Score', before: mitigation.before.f1_score, after: mitigation.after.f1_score },
                  ].map((row, i) => {
                    const change = row.after - row.before
                    const isImproved = row.label.includes('Parity') || row.label.includes('Odds')
                      ? Math.abs(row.after) < Math.abs(row.before)
                      : change >= 0
                    return (
                      <tr key={i}>
                        <td className="font-medium text-white">{row.label}</td>
                        <td>{row.before.toFixed(4)}</td>
                        <td>{row.after.toFixed(4)}</td>
                        <td>
                          <span className="flex items-center gap-1" style={{ color: isImproved ? '#22c55e' : '#ef4444' }}>
                            {isImproved ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {change >= 0 ? '+' : ''}{change.toFixed(4)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {step === 'idle' && !loading && (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
               style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.15)' }}>
            <BarChart3 size={36} style={{ color: '#f97316' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Run Bias Analysis</h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: '#94a3b8' }}>
            Click "Run Analysis" to train the model and compute fairness metrics on your loaded dataset.
          </p>
          <button onClick={handleRunAnalysis} className="btn-primary flex items-center gap-2 mx-auto">
            <Play size={16} /> Start Analysis
          </button>
        </div>
      )}
    </motion.div>
  )
}
