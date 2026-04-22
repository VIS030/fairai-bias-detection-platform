import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, BarChart3, Zap, Brain, ArrowRight, ExternalLink, Star, Users, FileCheck } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const features = [
  {
    icon: BarChart3,
    title: 'Bias Detection',
    desc: 'Detect demographic parity and equal opportunity gaps using Fairlearn ML metrics.',
    color: '#f97316',
  },
  {
    icon: Zap,
    title: 'Auto Mitigation',
    desc: 'Apply ExponentiatedGradient algorithms to reduce bias while preserving accuracy.',
    color: '#a855f7',
  },
  {
    icon: Brain,
    title: 'Explainable AI',
    desc: 'Understand why bias exists with human-readable insights and feature analysis.',
    color: '#22c55e',
  },
  {
    icon: FileCheck,
    title: 'Visual Reports',
    desc: 'Interactive charts showing before vs after comparisons with clear metrics.',
    color: '#f59e0b',
  },
]

const stats = [
  { value: '32K+', label: 'Records Analyzed' },
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '< 2s', label: 'Analysis Speed' },
  { value: '12+', label: 'Bias Metrics' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-15"
           style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />

      {/* Top Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">FairAI</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             className="p-2.5 rounded-xl hover:bg-white/5 transition-all" style={{ color: '#94a3b8' }}>
            <ExternalLink size={20} />
          </a>
          <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
            Launch App <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 72px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium mb-10"
            style={{ 
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              color: '#f97316'
            }}
          >
            <Star size={14} fill="#f97316" /> Google Solution Challenge 2025
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8" style={{ lineHeight: '1.15' }}>
            <span className="text-white">Detect & Fix </span>
            <span className="gradient-text">AI Bias</span>
            <br />
            <span className="text-white" style={{ marginTop: '8px', display: 'inline-block' }}>Before It Harms</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-12"
             style={{ color: '#94a3b8', lineHeight: '1.8' }}>
            FairAI is an intelligent platform that detects hidden biases in your ML datasets, 
            applies cutting-edge mitigation techniques, and explains exactly what went wrong — and how to fix it.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-5 flex-wrap">
            <button onClick={() => navigate('/upload')} className="btn-primary text-lg py-4 px-10 flex items-center gap-3">
              Get Started Free <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary text-lg py-4 px-10">
              View Demo
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto mt-16"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm mt-2" style={{ color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Everything You Need for <span className="gradient-text">Fair ML</span>
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.8' }} className="max-w-xl mx-auto text-lg">
            From detection to mitigation to explainability — one platform handles it all.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 group cursor-pointer text-center"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 mx-auto transition-transform group-hover:scale-110"
                   style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}30` }}>
                <feat.icon size={24} style={{ color: feat.color }} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{feat.title}</h3>
              <p className="text-sm" style={{ color: '#94a3b8', lineHeight: '1.7' }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-8" style={{ paddingTop: '80px', paddingBottom: '100px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-16 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(168,85,247,0.1))',
            border: '1px solid rgba(249,115,22,0.15)',
          }}
        >
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Build Fairer AI?
            </h2>
            <p className="mb-10 max-w-lg mx-auto text-lg" style={{ color: '#94a3b8', lineHeight: '1.8' }}>
              Upload your dataset and get instant bias analysis with actionable insights.
            </p>
            <button onClick={() => navigate('/upload')} className="btn-primary text-lg py-4 px-10 flex items-center gap-3 mx-auto">
              Start Analysis <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t py-12 px-8" style={{ borderColor: 'rgba(255,255,255,0.06)', marginTop: '40px' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-base font-semibold gradient-text">FairAI</span>
            <span className="text-sm" style={{ color: '#64748b' }}>— Bias Detection & Correction Platform</span>
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>
            &copy; 2025 FairAI — Built for Google Solution Challenge
          </p>
        </div>
      </footer>
    </div>
  )
}
