'use client'

import { useState, useEffect } from 'react'
import { type Contract } from '@/lib/mock-data'
import { exportToPdf } from '@/lib/export-pdf'
import { Zap, Download, Building2, Calendar, DollarSign, Target, FileText, Sparkles, ChevronRight, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const ACCENT = '#a855f7'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

interface ContractorPanelProps {
  selectedLocation?: { lat: number; lng: number } | null
}

export default function ContractorPanel({ selectedLocation }: ContractorPanelProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [aiOutput, setAiOutput] = useState('')
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/contracts`)
      .then(r => r.json())
      .then(d => { setContracts(d); setLoading(false); toast.success(`${d.length} contracts loaded`, { duration: 2000 }) })
      .catch(() => { setLoading(false); toast.error('Failed to load contracts') })
  }, [])

  async function generateBid(contract: Contract) {
    setSelectedId(contract.contract_id)
    setAiLoading(true)
    setAiOutput('')

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'contractor',
          data: {
            business_name: contract.matched_business?.name || 'Local Business',
            business_industry: contract.category,
            contract_category: contract.category,
            contract_value: contract.estimated_value,
            frequency: contract.historical_frequency,
            past_vendors: 'Previous city vendors',
          }
        })
      })
      const json = await res.json()
      setAiOutput(json.output)
    } catch {
      setAiOutput('AI service unavailable.')
    }
    setAiLoading(false)
  }

  function downloadBid() {
    if (!aiOutput || !selectedId) return
    const blob = new Blob([aiOutput], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bid_proposal_${selectedId}.txt`
    link.click()
  }

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${ACCENT}20` }}
          >
            <FileText className="h-4 w-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">B2G Procurement</h2>
            <p className="text-xs text-muted-foreground">City contracts matched to your business</p>
          </div>
        </div>
      </div>

      {/* Location context badge */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2"
        >
          <MapPin className="h-4 w-4 text-purple-400" />
          <p className="text-xs text-purple-300">
            Showing contracts near {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </p>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="flex flex-col items-center gap-3">
              <span
                className="h-8 w-8 animate-spin rounded-full border-3 border-t-transparent"
                style={{ borderColor: `${ACCENT}40`, borderTopColor: 'transparent' }}
              />
              <span className="text-sm font-medium text-foreground">Scraping Local Businesses...</span>
              <span className="text-xs text-muted-foreground text-center max-w-[200px]">
                CivicPulse is performing a live web scrape to find real Montgomery contractors for these bids. This takes ~5 seconds.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Cards */}
      {!loading && (
        <div className="space-y-3">
          {contracts.map((contract, idx) => (
            <motion.div
              key={contract.contract_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ scale: 1.01 }}
              className={`glass-card rounded-xl p-4 transition-all cursor-pointer ${selectedId === contract.contract_id
                ? 'ring-2'
                : 'hover:border-[#a855f7]/30'
                }`}
              style={{
                boxShadow: selectedId === contract.contract_id ? `0 0 0 2px ${ACCENT}` : undefined,
              }}
              onClick={() => setSelectedId(contract.contract_id)}
            >
              {/* Contract Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" style={{ color: ACCENT }} />
                    <p className="font-semibold text-foreground">{formatCategory(contract.category)}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${contract.estimated_value.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {contract.historical_frequency}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Next: <span style={{ color: ACCENT }}>{contract.predicted_next}</span>
                  </p>
                </div>

                {/* Matched Business */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs font-medium" style={{ color: ACCENT }}>
                      {contract.matched_business.name}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <Target className="h-3 w-3 text-green-500" />
                    <p className="text-xs font-bold text-green-500">
                      {contract.matched_business.match_score}% Match
                    </p>
                  </div>
                </div>
              </div>

              {/* Contract ID & Action */}
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <span className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">
                  {contract.contract_id}
                </span>

                <button
                  onClick={(e) => { e.stopPropagation(); generateBid(contract) }}
                  disabled={aiLoading && selectedId === contract.contract_id}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: `${ACCENT}20`,
                    color: ACCENT,
                  }}
                >
                  {aiLoading && selectedId === contract.contract_id ? (
                    <>
                      <span
                        className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
                        style={{ borderColor: `${ACCENT}60`, borderTopColor: 'transparent' }}
                      />
                      Drafting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3" />
                      Generate Bid
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Bid Output */}
      <AnimatePresence>
        {aiOutput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card glow-border rounded-xl p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: ACCENT }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Generated Bid Proposal
                </h3>
              </div>
              <button
                onClick={downloadBid}
                className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
              <button
                onClick={() => {
                  exportToPdf('Bid Proposal', aiOutput, `bid_${selectedId || 'draft'}`)
                  toast.success('PDF exported!')
                }}
                className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <FileText className="h-3 w-3" />
                PDF
              </button>
            </div>
            <div className="scrollbar-thin max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {aiOutput}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && contracts.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${ACCENT}15` }}
          >
            <FileText className="h-6 w-6" style={{ color: ACCENT }} />
          </div>
          <p className="text-sm text-muted-foreground">
            No upcoming contracts available at this time.
          </p>
        </div>
      )}

      {/* Stats Footer */}
      {!loading && contracts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Contract Value</span>
            <span className="font-bold" style={{ color: ACCENT }}>
              ${contracts.reduce((sum, c) => sum + c.estimated_value, 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg Match Score</span>
            <span className="font-bold text-green-500">
              {Math.round(
                contracts.reduce((sum, c) => sum + c.matched_business.match_score, 0) /
                contracts.length
              )}%
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
