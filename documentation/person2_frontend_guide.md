# 🎨 PERSON 2 — FRONTEND & 3D MAP ENGINEER
## CivicPulse (Atlas Edition) — Complete Implementation Guide

> **Role:** React 18 UI, Mapbox map, Three.js 3D pillars, three side panels
> **Workdir:** `World Wide Vibes Hackathon/civicpulse/`
> **Backend URL:** `http://localhost:8000` (confirm with Person 1 before starting)
> **Deadline:** Monday March 9, 9:00 AM CT

---

## 1. UNDERSTANDING THE CURRENT REPO STATE

```
civicpulse/
├── .env.example          ← Copy to .env and add your Mapbox token
├── package.json          ← All deps already installed
├── tailwind.config.js    ← COMPLETE — do not change this
├── postcss.config.js     ← COMPLETE — do not change this
├── vite.config.js        ← Default Vite config, no changes needed
└── src/
    ├── index.css         ← Tailwind directives — COMPLETE
    ├── main.jsx          ← React entry point — COMPLETE
    └── App.jsx           ← Shell layout + mode toggle — COMPLETE
                             This file has placeholders for your components
```

### The Exact Color System (DO NOT change these, they're already in `tailwind.config.js`)
| Token | Hex | Usage |
|---|---|---|
| `civic-bg` | `#0a0a0f` | Full-screen dark background |
| `civic-panel` | `#13131a` | Side panel and nav background |
| `civic-red` | `#ff3b30` | Entrepreneur mode accent |
| `civic-yellow` | `#ffd60a` | Contractor mode accent |
| `civic-green` | `#30d158` | Resident mode accent |
| `civic-text-primary` | `#f5f5f7` | Main readable text |
| `civic-text-secondary` | `#8e8e93` | Dimmed/label text |
| `civic-border` | `#2c2c3a` | Panel and input borders |
| `shadow-glow-red` | `rgba(255,59,48,0.3)` | Box shadow for red elements |
| `shadow-glow-yellow` | `rgba(255,214,10,0.3)` | Box shadow for yellow elements |
| `shadow-glow-green` | `rgba(48,209,88,0.3)` | Box shadow for green elements |

---

## 2. ENVIRONMENT SETUP

### Step 1 — Clone and Install
```bash
git clone <github-repo-url>
cd "World Wide Vibes Hackathon/civicpulse"
npm install
```

### Step 2 — Set Up Your `.env` File
```bash
copy .env.example .env    # Windows
```
```ini
# civicpulse/.env
VITE_MAPBOX_TOKEN=pk.eyJ1...your_mapbox_public_token...
VITE_API_BASE_URL=http://localhost:8000
```

> Get your token at: **mapbox.com → Account → Access Tokens**  
> The public token starting with `pk.` is safe to use in frontend code.

### Step 3 — Run the Dev Server
```bash
npm run dev
# App runs at: http://localhost:5173
```

---

## 3. DELIVERABLE A — `src/components/CivicMap.jsx`

**Goal:** Render the Mapbox dark map of Montgomery, AL. Fetch heatmap data and display it as a color-coded circle layer. Fire events to parent when user clicks.

```jsx
// src/components/CivicMap.jsx
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const API_BASE     = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function CivicMap({ onLocationSelect, activeMode }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return // only init once
    mapboxgl.accessToken = MAPBOX_TOKEN
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-86.2964, 32.3617],  // Montgomery, AL [lng, lat]
      zoom: 12,
    })

    map.current.on('load', async () => {
      // 1. Fetch heatmap data from backend
      let heatmapData = []
      try {
        const res = await fetch(`${API_BASE}/api/heatmap`)
        heatmapData = await res.json()
      } catch (e) {
        console.warn('Heatmap fetch failed, using empty data:', e)
      }

      // 2. Convert to GeoJSON FeatureCollection
      const geojson = {
        type: 'FeatureCollection',
        features: heatmapData.map(b => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
          properties: { survival_score: b.survival_score }
        }))
      }

      // 3. Add the source
      map.current.addSource('blocks', { type: 'geojson', data: geojson })

      // 4. Add circle layer colored by survival_score
      map.current.addLayer({
        id: 'block-circles',
        type: 'circle',
        source: 'blocks',
        paint: {
          'circle-radius': 8,
          'circle-opacity': 0.75,
          'circle-color': [
            'interpolate', ['linear'], ['get', 'survival_score'],
            0,   '#ff3b30',  // Red — failing
            50,  '#ffd60a',  // Yellow — moderate
            100, '#30d158',  // Green — thriving
          ]
        }
      })

      // 5. Add 3D Extrusion layer (the "pillars" — Mapbox native approach)
      map.current.addLayer({
        id: 'block-extrusions',
        type: 'fill-extrusion',
        source: 'blocks',
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['get', 'survival_score'],
            0,   '#ff3b30',
            50,  '#ffd60a',
            100, '#30d158',
          ],
          'fill-extrusion-height': ['*', ['get', 'survival_score'], 3],
          'fill-extrusion-opacity': 0.7,
        }
      })
    })

    // 6. Fire location event when user clicks the map
    map.current.on('click', (e) => {
      const { lat, lng } = e.lngLat
      if (onLocationSelect) onLocationSelect(lat, lng)
      
      // Drop a marker at click location
      new mapboxgl.Marker({ color: '#ff3b30' })
        .setLngLat([lng, lat])
        .addTo(map.current)
    })
  }, [])

  return (
    <div ref={mapContainer} className="w-full h-full" />
  )
}
```

**Integrate into `App.jsx`:** Replace the map placeholder div:
```jsx
import CivicMap from './components/CivicMap'

// Inside your layout — replace the placeholder:
<div className="w-[70%] relative border-r border-civic-border">
  <CivicMap onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })} activeMode={activeMode} />
</div>
```

Also add this state to `App.jsx`:
```js
const [selectedLocation, setSelectedLocation] = useState(null)
```

---

## 4. DELIVERABLE B — `src/components/EntrepreneurPanel.jsx`

**Goal:** Address input + category dropdown → fetch block analysis → display survival score ring + permit history + AI output.

```jsx
// src/components/EntrepreneurPanel.jsx
import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const CATEGORIES = ['restaurant', 'salon', 'retail', 'auto', 'cafe', 'gym', 'barbershop', 'clinic']

// Animated circular score ring component
function ScoreRing({ score }) {
  const color = score > 75 ? '#30d158' : score > 50 ? '#ffd60a' : '#ff3b30'
  const radius = 52, circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center my-6">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#2c2c3a" strokeWidth="10" />
        <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <text x="65" y="60" textAnchor="middle" fill={color} fontSize="28" fontWeight="bold">{score}</text>
        <text x="65" y="78" textAnchor="middle" fill="#8e8e93" fontSize="11">/100</text>
      </svg>
      <p className="text-xs text-civic-text-secondary mt-1">Business Survival Score</p>
    </div>
  )
}

export default function EntrepreneurPanel() {
  const [address, setAddress]     = useState('')
  const [category, setCategory]   = useState('restaurant')
  const [loading, setLoading]     = useState(false)
  const [data, setData]           = useState(null)
  const [aiOutput, setAiOutput]   = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  async function analyze() {
    if (!address.trim()) return
    setLoading(true)
    setData(null)
    try {
      // Quick geocode approximation using a fixed Montgomery lat/lng offset by address hash
      const lat = 32.3617 + (address.length % 7) * 0.003
      const lng = -86.2964 - (address.length % 5) * 0.003
      const res = await fetch(`${API_BASE}/api/block?lat=${lat}&lng=${lng}&category=${category}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      alert('Backend unreachable. Is Person 1 running the server?')
    }
    setLoading(false)
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
    } catch (e) {
      setAiOutput('AI service unavailable. Try again shortly.')
    }
    setAiLoading(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-civic-red mb-1">🔴 Predictive Site Selection</h2>
        <p className="text-xs text-civic-text-secondary">10 years of permit data. One survival score. Sign or skip.</p>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="123 Dexter Ave, Montgomery AL"
          className="w-full bg-civic-bg border border-civic-border rounded-lg px-3 py-2 text-sm text-civic-text-primary placeholder-civic-text-secondary outline-none focus:border-civic-red transition-colors"
        />
        <div className="flex gap-2">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="flex-1 bg-civic-bg border border-civic-border rounded-lg px-3 py-2 text-sm text-civic-text-primary outline-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <button
            onClick={analyze}
            disabled={loading}
            className="px-4 py-2 bg-civic-red text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 shadow-glow-red"
          >
            {loading ? '...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Results */}
      {data && (
        <div>
          <ScoreRing score={data.survival_score} />

          {/* Permit History Timeline */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-civic-text-secondary uppercase tracking-wider mb-2">Permit History</h3>
            <div className="space-y-2">
              {(data.permit_history || []).map((p, i) => (
                <div key={i} className="flex items-start gap-3 border-l-2 border-civic-border pl-3">
                  <div>
                    <p className="text-xs font-medium text-civic-text-primary">{p.business_name || 'Unknown Business'}</p>
                    <p className="text-xs text-civic-text-secondary">{p.year} · {p.permit_type} · <span className={p.status === 'active' ? 'text-civic-green' : 'text-civic-red'}>{p.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Alternatives */}
          {data.top_3_alternatives?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-civic-text-secondary uppercase tracking-wider mb-2">Better Locations</h3>
              {data.top_3_alternatives.map((alt, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-civic-border">
                  <span className="text-xs text-civic-text-secondary truncate w-2/3">{alt.address}</span>
                  <span className="text-xs font-bold text-civic-green">{alt.survival_score}/100</span>
                </div>
              ))}
            </div>
          )}

          {/* AI Prospectus */}
          <button
            onClick={generateProspectus}
            disabled={aiLoading}
            className="w-full mt-4 py-2 border border-civic-red text-civic-red text-sm rounded-lg hover:bg-civic-red hover:text-white transition disabled:opacity-50"
          >
            {aiLoading ? 'Generating...' : '✨ Generate Location Prospectus'}
          </button>
          {aiOutput && (
            <div className="mt-3 p-3 bg-civic-bg border border-civic-border rounded-lg text-xs text-civic-text-secondary leading-relaxed whitespace-pre-wrap">
              {aiOutput}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 5. DELIVERABLE C — `src/components/ContractorPanel.jsx`

```jsx
// src/components/ContractorPanel.jsx
import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function ContractorPanel() {
  const [contracts, setContracts] = useState([])
  const [selected, setSelected]   = useState(null)
  const [aiOutput, setAiOutput]   = useState('')
  const [loading, setLoading]     = useState(true)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/contracts`)
      .then(r => r.json())
      .then(d => { setContracts(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function generateBid(contract) {
    setSelected(contract.contract_id)
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
    if (!aiOutput) return
    const blob = new Blob([aiOutput], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bid_proposal_${selected}.txt`
    link.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-civic-yellow mb-1">🟡 B2G Procurement Engine</h2>
        <p className="text-xs text-civic-text-secondary">Upcoming city contracts matched to local businesses. One click to a winning bid.</p>
      </div>

      {loading && <p className="text-xs text-civic-text-secondary">Loading contracts...</p>}

      {/* Contract Cards */}
      <div className="space-y-3">
        {contracts.map(c => (
          <div key={c.contract_id} className="border border-civic-border rounded-lg p-3 bg-civic-bg hover:border-civic-yellow transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-civic-text-primary capitalize">{c.category.replace('_',' ')}</p>
                <p className="text-xs text-civic-text-secondary mt-0.5">Est. ${c.estimated_value.toLocaleString()} · {c.historical_frequency}</p>
                <p className="text-xs text-civic-text-secondary">Next: {c.predicted_next}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-civic-yellow">{c.matched_business?.name}</p>
                <p className="text-xs text-civic-green">Match: {c.matched_business?.match_score}%</p>
              </div>
            </div>
            <button
              onClick={() => generateBid(c)}
              disabled={aiLoading && selected === c.contract_id}
              className="mt-3 w-full py-1.5 text-xs border border-civic-yellow text-civic-yellow rounded hover:bg-civic-yellow hover:text-black transition disabled:opacity-50"
            >
              {aiLoading && selected === c.contract_id ? 'Drafting...' : '⚡ Generate Bid Proposal'}
            </button>
          </div>
        ))}
      </div>

      {/* AI Bid Proposal Output */}
      {aiOutput && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-semibold text-civic-yellow uppercase tracking-wider">Generated Bid Proposal</h3>
            <button onClick={downloadBid} className="text-xs text-civic-text-secondary hover:text-civic-yellow transition">⬇ Download</button>
          </div>
          <div className="p-3 bg-civic-bg border border-civic-border rounded-lg text-xs text-civic-text-secondary whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {aiOutput}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 6. DELIVERABLE D — `src/components/ResidentPanel.jsx`

```jsx
// src/components/ResidentPanel.jsx
import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function ScoreBar({ label, score, color }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-civic-text-secondary">{label}</span>
        <span style={{ color }}>{score}/100</span>
      </div>
      <div className="w-full bg-civic-bg rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function ResidentPanel({ selectedLocation }) {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [aiOutput, setAiOutput]   = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (!selectedLocation) return
    setLoading(true)
    setData(null)
    setAiOutput('')
    fetch(`${API_BASE}/api/neighborhood?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
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
    } catch { setAiOutput('AI unavailable.') }
    setAiLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-civic-green mb-1">🟢 Civic Equity Tracker</h2>
        <p className="text-xs text-civic-text-secondary">Click any neighborhood on the map to reveal its Civic Health Score.</p>
      </div>

      {!selectedLocation && (
        <div className="border border-civic-border rounded-lg p-4 text-center">
          <p className="text-xs text-civic-text-secondary">👆 Click anywhere on the map to analyze a neighborhood</p>
        </div>
      )}

      {loading && <p className="text-xs text-civic-text-secondary">Analyzing neighborhood...</p>}

      {data && (
        <div>
          {/* Neighborhood Name + Overall Score */}
          <div className="border border-civic-border rounded-lg p-4 mb-4">
            <h3 className="text-base font-bold text-civic-text-primary">{data.name}</h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-civic-green">{data.civic_health_score}</span>
              <span className="text-sm text-civic-text-secondary">/100 Civic Health</span>
            </div>
            <p className="text-xs text-civic-text-secondary mt-2">${data.city_spend_last_3yr?.toLocaleString()} city investment (last 3 years)</p>
          </div>

          {/* Score Bars */}
          <ScoreBar label="Infrastructure" score={data.infrastructure_score} color="#30d158" />
          <ScoreBar label="Permit Activity" score={data.permit_velocity_score} color="#ffd60a" />
          <ScoreBar label="Public Safety" score={data.safety_score} color="#ff3b30" />
          <ScoreBar label="Contract Equity" score={data.contract_equity_score} color="#636366" />

          {/* Comparison */}
          {data.comparison_district && (
            <div className="mt-4 p-3 border border-civic-border rounded-lg bg-civic-bg">
              <p className="text-xs font-semibold text-civic-text-secondary mb-1 uppercase tracking-wider">vs. Wealthiest District</p>
              <div className="flex justify-between text-xs">
                <span className="text-civic-text-secondary">{data.name}</span>
                <span className="text-civic-red font-bold">${data.city_spend_last_3yr?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-civic-text-secondary">{data.comparison_district.name}</span>
                <span className="text-civic-green font-bold">${data.comparison_district.city_spend_last_3yr?.toLocaleString()}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-civic-border flex justify-between text-xs">
                <span className="text-civic-text-secondary">Investment Gap</span>
                <span className="text-civic-yellow font-bold">-${data.investment_gap?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Generate Letter */}
          <button
            onClick={generateLetter}
            disabled={aiLoading}
            className="w-full mt-4 py-2 border border-civic-green text-civic-green text-sm rounded-lg hover:bg-civic-green hover:text-black transition disabled:opacity-50"
          >
            {aiLoading ? 'Drafting...' : '✉ Generate Advocacy Letter'}
          </button>
          {aiOutput && (
            <div className="mt-3 p-3 bg-civic-bg border border-civic-border rounded-lg text-xs text-civic-text-secondary whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {aiOutput}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 7. WIRE EVERYTHING INTO `App.jsx`

Replace the existing `App.jsx` with this completed version:

```jsx
// src/App.jsx
import { useState } from 'react'
import CivicMap from './components/CivicMap'
import EntrepreneurPanel from './components/EntrepreneurPanel'
import ContractorPanel from './components/ContractorPanel'
import ResidentPanel from './components/ResidentPanel'

function App() {
  const [activeMode, setActiveMode] = useState('entrepreneur')
  const [selectedLocation, setSelectedLocation] = useState(null)

  return (
    <div className="flex flex-col h-screen w-full bg-civic-bg text-civic-text-primary overflow-hidden">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-4 bg-civic-panel border-b border-civic-border z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-civic-red shadow-glow-red animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight">CivicPulse</h1>
          <span className="text-xs text-civic-text-secondary ml-1 hidden sm:block">Atlas Edition</span>
        </div>
        <div className="flex space-x-1 bg-civic-bg p-1 rounded-lg border border-civic-border">
          {[
            { id: 'entrepreneur', label: '🔴 Entrepreneur', color: 'civic-red' },
            { id: 'contractor',   label: '🟡 Contractor',   color: 'civic-yellow' },
            { id: 'resident',     label: '🟢 Resident',     color: 'civic-green' },
          ].map(m => (
            <button key={m.id} onClick={() => setActiveMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeMode === m.id
                  ? `bg-civic-panel text-${m.color} border border-${m.color}/30`
                  : 'text-civic-text-secondary hover:text-civic-text-primary'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
        <span className="text-sm font-medium text-civic-text-secondary">Montgomery, AL</span>
      </nav>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[70%] relative border-r border-civic-border">
          <CivicMap onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })} activeMode={activeMode} />
        </div>
        <div className="w-[30%] bg-civic-panel p-5 overflow-y-auto">
          {activeMode === 'entrepreneur' && <EntrepreneurPanel />}
          {activeMode === 'contractor'   && <ContractorPanel />}
          {activeMode === 'resident'     && <ResidentPanel selectedLocation={selectedLocation} />}
        </div>
      </div>
    </div>
  )
}
export default App
```

---

## 8. FINAL CHECKLIST — Before Demo

- [ ] `npm run dev` starts with no console errors
- [ ] Map loads, centered on Montgomery, with dark style
- [ ] Colored circles (heatmap) appear on the map after load
- [ ] Clicking map fires location event and drops a marker
- [ ] Entrepreneur: Address input → survival score ring animates
- [ ] Contractor: Contract cards load and "Generate Bid" works
- [ ] Resident: Map click → neighborhood scores appear
- [ ] AI output boxes populate for all 3 modes
- [ ] Mobile: App looks acceptable at 768px width
- [ ] ✅ Push to GitHub and verify Vercel auto-deploys
