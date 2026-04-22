import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, FileSpreadsheet, Database, CheckCircle, AlertCircle, ArrowRight, X, Table } from 'lucide-react'
import { loadDemoDataset, uploadDataset, previewDataset } from '../utils/api'

export default function UploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleDemoLoad = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await loadDemoDataset()
      setResult(res.data)
      const prev = await previewDataset(8)
      setPreview(prev.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load demo dataset')
    }
    setLoading(false)
  }

  const handleFileUpload = async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    setSelectedFile(file)
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await uploadDataset(file)
      setResult(res.data)
      const prev = await previewDataset(8)
      setPreview(prev.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file')
    }
    setLoading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Upload Dataset</h1>
        <p style={{ color: '#94a3b8' }}>Upload your CSV file or load the demo dataset to begin bias analysis.</p>
      </div>

      {/* Upload Options */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Upload CSV */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`glass-card p-8 cursor-pointer group relative overflow-hidden ${dragOver ? 'ring-2 ring-orange-500' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform group-hover:scale-110"
                 style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <Upload size={28} style={{ color: '#f97316' }} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Upload CSV File</h3>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
              Drag & drop or click to browse
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
                 style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
              <FileSpreadsheet size={14} />
              Supports .csv files up to 50MB
            </div>
          </div>
        </motion.div>

        {/* Demo Dataset */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="glass-card p-8 cursor-pointer group relative overflow-hidden"
          onClick={handleDemoLoad}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform group-hover:scale-110"
                 style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <Database size={28} style={{ color: '#a855f7' }} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Load Demo Dataset</h3>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
              Adult Census Income Dataset (32K+ records)
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
                 style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
              <Table size={14} />
              Pre-configured: target=income, sensitive=sex
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 flex flex-col items-center justify-center"
        >
          <div className="spinner mb-4" />
          <p className="text-white font-medium">Processing dataset...</p>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>This may take a few seconds</p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
          <div>
            <p className="font-medium" style={{ color: '#ef4444' }}>Upload Failed</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto" style={{ color: '#64748b' }}>
            <X size={18} />
          </button>
        </motion.div>
      )}

      {/* Success Result */}
      {result && result.success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Success Banner */}
          <div className="rounded-2xl p-5 flex items-center gap-4"
               style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle size={24} style={{ color: '#22c55e' }} />
            <div className="flex-1">
              <p className="font-medium text-white">{result.message}</p>
              <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
                {result.total_rows?.toLocaleString()} rows × {result.total_columns} columns
              </p>
            </div>
            <button onClick={() => navigate('/analysis')} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              Run Analysis <ArrowRight size={16} />
            </button>
          </div>

          {/* Column Tags */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Detected Columns</h3>
            <div className="flex flex-wrap gap-2">
              {result.columns?.map((col, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        background: col === 'income' ? 'rgba(249,115,22,0.15)' :
                                   col === 'sex' ? 'rgba(168,85,247,0.15)' :
                                   'rgba(255,255,255,0.05)',
                        color: col === 'income' ? '#f97316' :
                               col === 'sex' ? '#a855f7' : '#94a3b8',
                        border: `1px solid ${col === 'income' ? 'rgba(249,115,22,0.3)' :
                                 col === 'sex' ? 'rgba(168,85,247,0.3)' :
                                 'rgba(255,255,255,0.08)'}`,
                      }}>
                  {col}
                  {col === 'income' && ' (target)'}
                  {col === 'sex' && ' (sensitive)'}
                </span>
              ))}
            </div>
          </div>

          {/* Data Preview */}
          {preview && preview.data && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Table size={16} style={{ color: '#f97316' }} />
                  Data Preview (first {preview.data.length} rows)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      {preview.columns?.map((col, i) => (
                        <th key={i}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.data.map((row, ri) => (
                      <tr key={ri}>
                        {preview.columns.map((col, ci) => (
                          <td key={ci} className="whitespace-nowrap">{String(row[col])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
