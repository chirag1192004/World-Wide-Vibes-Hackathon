'use client'

import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreRing({ score, label = 'Business Survival Score', size = 'md' }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  const sizeConfig = {
    sm: { width: 100, radius: 40, strokeWidth: 8, fontSize: 24, subSize: 10 },
    md: { width: 140, radius: 56, strokeWidth: 10, fontSize: 32, subSize: 12 },
    lg: { width: 180, radius: 72, strokeWidth: 12, fontSize: 40, subSize: 14 },
  }
  
  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const dashArray = (animatedScore / 100) * circumference
  
  const getColor = () => {
    if (score >= 70) return '#22c55e'
    if (score >= 40) return '#f97316'
    return '#ef4444'
  }
  
  const getLabel = () => {
    if (score >= 70) return 'Excellent'
    if (score >= 50) return 'Good'
    if (score >= 30) return 'Fair'
    return 'Poor'
  }
  
  const color = getColor()
  
  useEffect(() => {
    const duration = 1200
    const startTime = Date.now()
    const startScore = 0
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      setAnimatedScore(Math.round(startScore + (score - startScore) * eased))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [score])
  
  const center = config.width / 2
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-2xl"
        style={{
          background: `radial-gradient(circle, ${color}60, transparent 70%)`,
        }}
      />
      
      <svg
        width={config.width}
        height={config.width}
        viewBox={`0 0 ${config.width} ${config.width}`}
        className="relative -rotate-90 transform"
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          stroke="rgba(39, 39, 42, 0.6)"
          strokeWidth={config.strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={config.strokeWidth}
          strokeDasharray={`${dashArray} ${circumference}`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 0.3s ease-out',
            filter: `drop-shadow(0 0 12px ${color}80)`,
          }}
        />
        
        {/* Score text */}
        <g className="transform rotate-90" style={{ transformOrigin: `${center}px ${center}px` }}>
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize={config.fontSize}
            fontWeight="bold"
            className="font-sans"
          >
            {animatedScore}
          </text>
          <text
            x={center}
            y={center + config.fontSize * 0.5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#a1a1aa"
            fontSize={config.subSize}
            className="font-sans"
          >
            /100
          </text>
        </g>
      </svg>
      
      <div className="mt-3 text-center">
        <span 
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color }}
        >
          {getLabel()}
        </span>
        {label && (
          <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        )}
      </div>
    </div>
  )
}
