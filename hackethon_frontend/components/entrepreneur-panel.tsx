'use client'

import { useState, useEffect } from 'react'
import ScoreRing from './score-ring'
import AddressAutocomplete from './address-autocomplete'
import { exportToPdf } from '@/lib/export-pdf'
import {
  BUSINESS_CATEGORIES,
  type BusinessCategory,
  type BlockAnalysis,
} from '@/lib/mock-data'
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, Building2, Sparkles, Search, ChevronRight, Navigation, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { AreaChart, Area, ResponsiveContainer, Tooltip as RTooltip } from 'recharts'

const ACCENT = '#f97316'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://chirag11092004-civicpulse-api.hf.space')

// Mock trend data generator
function generateTrendData(score: number) {
  const years = [2019, 2020, 2021, 2022, 2023, 2024]
  return years.map((y, i) => ({
    year: y,
    score: Math.max(10, Math.min(100, score - 15 + Math.round(Math.random() * 20) + i * 3)),
  }))
}

interface EntrepreneurPanelProps {
  selectedLocation?: { lat: number; lng: number } | null
  selectedCategory?: BusinessCategory
  onCategoryChange?: (cat: BusinessCategory) => void
}

export default function EntrepreneurPanel({
  selectedLocation,
  selectedCategory: externalCategory,
  onCategoryChange,
}: EntrepreneurPanelProps) {
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState<BusinessCategory>(externalCategory || 'restaurant')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<BlockAnalysis | null>(null)
  const [aiOutput, setAiOutput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Sync with external category
  useEffect(() => {
    if (externalCategory && externalCategory !== category) {
      setCategory(externalCategory)
    }
  }, [externalCategory])

  // Auto-analyze when map location is selected
  useEffect(() => {
    if (selectedLocation) {
      setAddress(`${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)} — Montgomery AL`)
      analyzeLocation(selectedLocation.lat, selectedLocation.lng)
    }
  }, [selectedLocation])

  async function analyzeLocation(lat: number, lng: number) {
    setLoading(true)
    setData(null)
    setAiOutput('')
    try {
      const res = await fetch(`${API_BASE}/api/block?lat=${lat}&lng=${lng}&category=${category}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function analyze() {
    if (!address.trim()) return
    const lat = 32.3617 + (address.length % 7) * 0.003
    const lng = -86.2964 - (address.length % 5) * 0.003
    await analyzeLocation(lat, lng)
  }

  async function generateProspectus() {
    if (!data) return
    setAiLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'entrepreneur',
          data: {
            address: data.address,
            business_category: category,
            survival_score: data.survival_score,
            permit_history: JSON.stringify(data.permit_history),
            crime_count: data.crime_density_halfmile,
            competitor_count: data.competitor_count,
            investment_trend: data.investment_trend,
            city_spend: data.city_spend_last_3yr,
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

  const handleCategoryChange = (newCat: BusinessCategory) => {
    setCategory(newCat)
    onCategoryChange?.(newCat)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500'
      case 'expired_closed':
      case 'revoked':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
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
            <Building2 className="h-4 w-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Site Selection</h2>
            <p className="text-xs text-muted-foreground">Predictive business viability analysis</p>
          </div>
        </div>
      </div>

      {/* Map Click Hint */}
      {!selectedLocation && !data && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2">
          <Navigation className="h-4 w-4 text-orange-400" />
          <p className="text-xs text-orange-300">Click the map or type an address below</p>
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-3">
        <AddressAutocomplete
          value={address}
          onChange={setAddress}
          onSelect={(addr, lat, lng) => {
            setAddress(addr)
            analyzeLocation(lat, lng)
            toast.success('Location selected', { description: addr, duration: 2000 })
          }}
        />
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as BusinessCategory)}
            className="flex-1 rounded-xl border border-border bg-secondary/50 px-3 py-3 text-sm text-foreground outline-none"
          >
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={analyze}
            disabled={loading || !address.trim()}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </div>

      {/* Loading shimmer */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-shimmer h-16 rounded-xl bg-secondary/50" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Score Ring */}
            <div className="flex justify-center py-4">
              <ScoreRing score={data.survival_score} />
            </div>

            {/* Trend Sparkline */}
            <div className="glass-card rounded-xl p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                5-Year Survival Trend
              </h3>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={generateTrendData(data.survival_score)}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <RTooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--muted-foreground)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke={ACCENT} fill="url(#trendGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: AlertTriangle, label: 'Crime Rate', value: data.crime_density_halfmile, unit: '/0.5mi' },
                { icon: Building2, label: 'Competitors', value: data.competitor_count, unit: 'nearby' },
                { icon: getTrendIcon(data.investment_trend).type, label: 'Trend', value: data.investment_trend, unit: '' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-xl p-3 text-center"
                >
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    {i === 2 ? getTrendIcon(data.investment_trend) : <stat.icon className="h-3 w-3" />}
                    <span className="text-xs">{stat.label}</span>
                  </div>
                  <p className="mt-1 text-lg font-bold capitalize text-foreground">{stat.value}</p>
                  {stat.unit && <p className="text-xs text-muted-foreground">{stat.unit}</p>}
                </motion.div>
              ))}
            </div>

            {/* Permit History */}
            <div className="glass-card rounded-xl p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Permit History
              </h3>
              <div className="space-y-3">
                {data.permit_history.map((permit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div
                      className="mt-1.5 h-2 w-2 rounded-full"
                      style={{ backgroundColor: permit.status === 'active' ? '#22c55e' : '#ef4444' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {permit.business_name || 'Unknown Business'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {permit.year} · {permit.permit_type.replace('_', ' ')} ·{' '}
                        <span className={getStatusColor(permit.status)}>
                          {permit.status.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Better Locations */}
            {data.top_3_alternatives.length > 0 && (
              <div className="glass-card rounded-xl p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alternative Locations
                </h3>
                <div className="space-y-2">
                  {data.top_3_alternatives.map((alt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate text-sm text-foreground">{alt.address}</span>
                      </div>
                      <span className="text-sm font-bold text-green-500">{alt.survival_score}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate AI Prospectus */}
            <button
              onClick={generateProspectus}
              disabled={aiLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/30 py-3 text-sm font-medium text-foreground transition-all hover:border-[#f97316] hover:bg-[#f97316]/10"
            >
              {aiLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#f97316]" />
                  Generate Location Prospectus
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* AI Output */}
            <AnimatePresence>
              {aiOutput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card glow-border rounded-xl p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: ACCENT }} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      AI Location Prospectus
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{aiOutput}</p>
                  <button
                    onClick={() => {
                      exportToPdf('Location Prospectus', aiOutput, `prospectus_${Date.now()}`)
                      toast.success('PDF downloaded!')
                    }}
                    className="mt-3 flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Download className="h-3 w-3" />
                    Export PDF
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!data && !loading && (
        <div className="glass-card rounded-xl p-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${ACCENT}15` }}
          >
            <Building2 className="h-6 w-6" style={{ color: ACCENT }} />
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a Montgomery address or click the map to analyze business viability.
          </p>
        </div>
      )}
    </div>
  )
}
