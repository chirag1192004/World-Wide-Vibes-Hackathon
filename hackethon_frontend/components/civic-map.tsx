'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'

import { MapPin, Layers, Box, Map as MapIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

interface CivicMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  activeMode: 'entrepreneur' | 'contractor' | 'resident'
  mapView: '3d' | 'street'
  selectedCategory?: string
}

const modeColors = {
  entrepreneur: '#f97316',
  contractor: '#a855f7',
  resident: '#22c55e',
}

const MAPTILER_API_KEY = 'cqSLxCfaZH1NYfFh5044'

// Montgomery, AL coordinates
const MONTGOMERY_CENTER = { lng: -86.2999, lat: 32.3668 }

export default function CivicMap({ onLocationSelect, activeMode, mapView, selectedCategory }: CivicMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptilersdk.Map | null>(null)
  const markersRef = useRef<maptilersdk.Marker[]>([])
  const selectedMarkerRef = useRef<maptilersdk.Marker | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const { resolvedTheme } = useTheme()

  const currentColor = modeColors[activeMode]

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22c55e'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    maptilersdk.config.apiKey = MAPTILER_API_KEY

    const isDark = resolvedTheme === 'dark'
    const styleUrl = isDark
      ? 'https://api.maptiler.com/maps/streets-v2-dark/style.json'
      : 'https://api.maptiler.com/maps/streets-v2-light/style.json'

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: `${styleUrl}?key=${MAPTILER_API_KEY}`,
      center: [MONTGOMERY_CENTER.lng, MONTGOMERY_CENTER.lat],
      zoom: 12,
      pitch: mapView === '3d' ? 60 : 0,
      bearing: mapView === '3d' ? -17 : 0,
      maxZoom: 18,
      minZoom: 10,
    })

    map.current.addControl(new maptilersdk.NavigationControl(), 'bottom-right')
    map.current.addControl(new maptilersdk.ScaleControl(), 'bottom-left')

    map.current.on('load', () => {
      setMapLoaded(true)

      // Enable 3D buildings if in 3D mode
      if (mapView === '3d' && map.current) {
        const layers = map.current.getStyle()?.layers
        if (layers) {
          for (const layer of layers) {
            if (layer.type === 'symbol' && (layer as maptilersdk.LayerSpecification & { layout?: { 'text-field'?: unknown } }).layout?.['text-field']) {
              map.current.setLayoutProperty(layer.id, 'visibility', 'visible')
            }
          }
        }
      }
    })

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      onLocationSelect(lat, lng)

      // Update selected marker
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.remove()
      }

      const el = document.createElement('div')
      el.className = 'selected-marker'
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: ${currentColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 20px ${currentColor}80;
          animation: pulse 2s infinite;
        "></div>
      `

      selectedMarkerRef.current = new maptilersdk.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current!)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update map style based on theme
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const isDark = resolvedTheme === 'dark'
    const styleUrl = isDark
      ? 'https://api.maptiler.com/maps/streets-v2-dark/style.json'
      : 'https://api.maptiler.com/maps/streets-v2-light/style.json'

    map.current.setStyle(`${styleUrl}?key=${MAPTILER_API_KEY}`)
  }, [resolvedTheme, mapLoaded])

  // Update map view (3D vs street)
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    if (mapView === '3d') {
      map.current.easeTo({
        pitch: 60,
        bearing: -17,
        duration: 1000,
      })
    } else {
      map.current.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000,
      })
    }
  }, [mapView, mapLoaded])

  // Add data markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Fetch and add new markers for each data point
    const categoryParam = selectedCategory ? `?category=${selectedCategory}` : ''
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://chirag11092004-civicpulse-api.hf.space'
    fetch(`${API_BASE}/api/heatmap${categoryParam}`)
      .then(r => r.json())
      .then(data => {
        data.forEach((point: any) => {
          const color = getScoreColor(point.survival_score)
          const height = Math.max(20, (point.survival_score / 100) * 50)

          const el = document.createElement('div')
          el.className = 'data-marker'
          el.style.cursor = 'pointer'
          el.innerHTML = `
        <div style="
          width: 12px;
          height: ${height}px;
          background: linear-gradient(to top, ${color}60, ${color});
          border-radius: 4px 4px 0 0;
          box-shadow: 0 0 12px ${color}60;
          transition: all 0.2s ease;
        " class="pillar"></div>
        <div style="
          width: 20px;
          height: 6px;
          background: radial-gradient(ellipse at center, ${color}80 0%, transparent 70%);
          margin-top: -2px;
          margin-left: -4px;
        "></div>
      `

          el.addEventListener('mouseenter', () => {
            const pillar = el.querySelector('.pillar') as HTMLElement
            if (pillar) {
              pillar.style.transform = 'scale(1.2)'
              pillar.style.boxShadow = `0 0 24px ${color}`
            }
          })

          el.addEventListener('mouseleave', () => {
            const pillar = el.querySelector('.pillar') as HTMLElement
            if (pillar) {
              pillar.style.transform = 'scale(1)'
              pillar.style.boxShadow = `0 0 12px ${color}60`
            }
          })

          el.addEventListener('click', (e) => {
            e.stopPropagation()
            onLocationSelect(point.lat, point.lng)
          })

          const marker = new maptilersdk.Marker({
            element: el,
            anchor: 'bottom',
          })
            .setLngLat([point.lng, point.lat])
            .addTo(map.current!)

          markersRef.current.push(marker)
        })
      })
      .catch(e => console.warn('Heatmap API failed', e))
  }, [mapLoaded, onLocationSelect, selectedCategory])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainer} className="h-full w-full" />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading Montgomery map...</p>
          </div>
        </div>
      )}

      {/* City Label */}
      <div className="absolute left-4 top-4 z-10">
        <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Viewing</p>
              <p className="font-semibold text-foreground">Montgomery, Alabama</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-12 left-4 z-10">
        <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
          <div className="mb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Business Survival Index
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
              <span className="text-xs text-foreground">High (70+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#f97316]" />
              <span className="text-xs text-foreground">Medium (40-69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
              <span className="text-xs text-foreground">Low (&lt;40)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Click Instruction */}
      <div className="absolute bottom-12 right-4 z-10">
        <div className="glass-card rounded-xl px-4 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">Click anywhere to analyze location</p>
        </div>
      </div>

      {/* Pulse animation styles */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}
