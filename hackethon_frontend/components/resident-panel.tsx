'use client'

import { useState, useEffect } from 'react'
import { type Neighborhood } from '@/lib/mock-data'
import { exportToPdf } from '@/lib/export-pdf'
import { MapPin, User, Mail, Sparkles, TrendingDown, Copy, Check, BarChart3, Shield, Download } from 'lucide-react'
import { toast } from 'sonner'

const ACCENT = '#22c55e'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://chirag11092004-civicpulse-api.hf.space'

interface ResidentPanelProps {
  selectedLocation: { lat: number; lng: number } | null
}

interface ScoreBarProps {
  label: string
  score: number
  color: string
}

function ScoreBar({ label, score, color }: ScoreBarProps) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}60`,
          }}
        />
      </div>
    </div>
  )
}

export default function ResidentPanel({ selectedLocation }: ResidentPanelProps) {
  const [data, setData] = useState<Neighborhood | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiOutput, setAiOutput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!selectedLocation) return
    setLoading(true)
    setData(null)
    setAiOutput('')

    fetch(`${API_BASE}/api/neighborhood?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); toast.success(`Loaded ${d.name || 'neighborhood'} data`) })
      .catch(() => { setLoading(false); toast.error('Failed to load neighborhood data') })
  }, [selectedLocation])

  async function generateLetter() {
    if (!data) return
    setAiLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'resident',
          data: {
            neighborhood: data.name,
            council_member: data.council_member,
            civic_score: data.civic_health_score,
            local_spend: data.city_spend_last_3yr,
            rich_spend: data.comparison_district?.city_spend_last_3yr,
            gap: data.investment_gap,
            deficit_list: 'road maintenance, streetlights, park infrastructure',
          }
        })
      })
      const json = await res.json()
      setAiOutput(json.output)
    } catch {
      setAiOutput('AI unavailable.')
    }
    setAiLoading(false)
  }

  function copyLetter() {
    if (!aiOutput) return
    navigator.clipboard.writeText(aiOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22c55e'
    if (score >= 40) return '#f97316'
    return '#ef4444'
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
            <BarChart3 className="h-4 w-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Civic Equity</h2>
            <p className="text-xs text-muted-foreground">Neighborhood investment analysis</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!selectedLocation && (
        <div className="glass-card rounded-xl p-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${ACCENT}15` }}
          >
            <MapPin className="h-6 w-6" style={{ color: ACCENT }} />
          </div>
          <p className="text-sm text-muted-foreground">
            Click anywhere on the map to analyze neighborhood equity.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <span
              className="h-8 w-8 animate-spin rounded-full border-3 border-t-transparent"
              style={{ borderColor: `${ACCENT}40`, borderTopColor: 'transparent' }}
            />
            <span className="text-sm text-muted-foreground">Analyzing neighborhood...</span>
          </div>
        </div>
      )}

      {/* Neighborhood Data */}
      {data && !loading && (
        <div className="animate-fade-in-up space-y-5">
          {/* Main Score Card */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color: ACCENT }} />
              <h3 className="font-bold text-foreground">{data.name}</h3>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span
                className="text-5xl font-bold"
                style={{ color: getScoreColor(data.civic_health_score) }}
              >
                {data.civic_health_score}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Civic Health Score</p>
            <div className="mt-3 rounded-lg bg-secondary/50 px-3 py-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  ${data.city_spend_last_3yr.toLocaleString()}
                </span>{' '}
                city investment (3 years)
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="glass-card rounded-xl p-5">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Score Breakdown
            </h4>
            <ScoreBar label="Infrastructure" score={data.infrastructure_score} color="#22c55e" />
            <ScoreBar label="Permit Activity" score={data.permit_velocity_score} color="#f97316" />
            <ScoreBar label="Public Safety" score={data.safety_score} color="#ef4444" />
            <ScoreBar label="Contract Equity" score={data.contract_equity_score} color="#a855f7" />
          </div>

          {/* Comparison Card */}
          {data.comparison_district && (
            <div className="glass-card rounded-xl p-5">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Investment Comparison
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{data.name}</span>
                  <span className="text-sm font-bold text-red-500">
                    ${data.city_spend_last_3yr.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{data.comparison_district.name}</span>
                  <span className="text-sm font-bold text-green-500">
                    ${data.comparison_district.city_spend_last_3yr.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Investment Gap</span>
                </div>
                <span className="text-sm font-bold text-orange-500">
                  -${data.investment_gap.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Council Member */}
          <div className="glass-card flex items-center justify-between rounded-xl p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Council Member</span>
            </div>
            <span className="text-sm font-medium text-foreground">{data.council_member}</span>
          </div>

          {/* Generate Letter Button */}
          <button
            onClick={generateLetter}
            disabled={aiLoading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/30 py-3 text-sm font-medium text-foreground transition-all hover:border-[#22c55e] hover:bg-[#22c55e]/10"
          >
            {aiLoading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: `${ACCENT}60`, borderTopColor: 'transparent' }}
                />
                Drafting...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" style={{ color: ACCENT }} />
                Generate Advocacy Letter
              </>
            )}
          </button>

          {/* AI Letter Output */}
          {aiOutput && (
            <div className="glass-card glow-border rounded-xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: ACCENT }} />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Advocacy Letter
                  </h4>
                </div>
                <button
                  onClick={copyLetter}
                  className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    exportToPdf('Advocacy Letter', aiOutput, `advocacy_${data?.name || 'letter'}`)
                    toast.success('PDF exported!')
                  }}
                  className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Download className="h-3 w-3" />
                  PDF
                </button>
              </div>
              <div className="scrollbar-thin max-h-80 overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {aiOutput}
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Active Permits</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{data.active_permits_count}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Crime (Last Yr)</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{data.crime_incidents_last_yr}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
