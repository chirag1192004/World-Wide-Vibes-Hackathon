'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  Building2,
  FileText,
  Users,
  BarChart3,
  Shield,
  MapPin,
  Zap,
  Globe,
  ChevronDown,
} from 'lucide-react'
import Image from 'next/image'

/* ─── Animated floating particle ──────────────────────────────────────── */
function Particle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)`,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

/* ─── 3D‑style globe canvas (pure CSS) ─────────────────────────────── */
function GlobeHero() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className="absolute h-[420px] w-[420px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(20,184,166,0.15) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Spinning rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 280 + i * 60,
            height: 280 + i * 60,
            borderColor: `rgba(20,184,166,${0.3 - i * 0.08})`,
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateX: 60, rotateZ: [0, 360] }}
          transition={{
            duration: 12 + i * 4,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Core sphere */}
      <motion.div
        className="relative z-10 flex h-48 w-48 items-center justify-center rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, rgba(20,184,166,0.6), rgba(9,9,11,0.9) 70%)',
          boxShadow:
            '0 0 60px 20px rgba(20,184,166,0.2), inset 0 0 60px rgba(20,184,166,0.1)',
        }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Globe className="h-20 w-20 text-teal-400/80" />
      </motion.div>

      {/* Data points orbiting */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute h-2 w-2 rounded-full bg-teal-400"
          style={{
            boxShadow: '0 0 8px 2px rgba(20,184,166,0.6)',
          }}
          animate={{
            rotate: [i * 72, i * 72 + 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
          // Position via transform-origin trick
          initial={{ x: 160, y: 0 }}
        />
      ))}
    </div>
  )
}

/* ─── Stat counter animation ──────────────────────────────────────── */
function AnimatedStat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-bold text-teal-400 md:text-4xl">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

/* ─── Feature card ────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: any
  title: string
  description: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group glass-card relative overflow-hidden rounded-2xl border border-border/50 p-6 transition-all duration-300"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 60%)` }}
      />
      <div
        className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <h3 className="relative mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="relative text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ═══  LANDING PAGE  ═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 4,
  }))

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ── Ambient background ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(168,85,247,0.06) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 10% 80%, rgba(249,115,22,0.04) 0%, transparent 50%)',
          }}
        />
        {mounted &&
          particles.map((p) => (
            <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} />
          ))}
      </div>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center gap-3 rounded-full border border-teal-500/30 bg-teal-500/10 px-5 py-2"
        >
          <div className="relative h-6 w-6 overflow-hidden rounded-full border border-teal-400/50 shadow-[0_0_12px_rgba(45,212,191,0.5)]">
             <Image src="/logo.png" alt="CivicPulse" fill className="object-cover" />
          </div>
          <span className="text-sm font-medium text-teal-400">World Wide Vibes Hackathon 2025</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 max-w-4xl text-center text-5xl font-bold leading-tight tracking-tight md:text-7xl"
        >
          Turn{' '}
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Open Data
          </span>{' '}
          Into{' '}
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Open Doors
          </span>
        </motion.h1>

        {/* Sub‑headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-10 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          CivicPulse transforms 10 years of Montgomery, AL city data into
          AI-powered insights for <strong className="text-foreground">entrepreneurs</strong>,{' '}
          <strong className="text-foreground">contractors</strong>, and{' '}
          <strong className="text-foreground">residents</strong>.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/app"
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30 hover:brightness-110"
          >
            Enter the Atlas
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 rounded-2xl border border-border/50 bg-secondary/50 px-6 py-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Learn More
            <ChevronDown className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Globe */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="mt-16"
        >
          <GlobeHero />
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 border-y border-border/30 bg-card/30 py-16 backdrop-blur-xl">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          <AnimatedStat value={10} label="Years of City Data" suffix="+" />
          <AnimatedStat value={3} label="Civic Modes" />
          <AnimatedStat value={150} label="Data Points per Block" suffix="+" />
          <AnimatedStat value={6} label="Montgomery Neighborhoods" />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Three Modes. One{' '}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Atlas
              </span>
              .
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Every stakeholder in the city has a unique perspective. CivicPulse serves them all.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Building2}
              title="Entrepreneur"
              description="AI-powered site selection. Get survival scores, competitor analysis, and a full location prospectus for any address in Montgomery."
              color="#f97316"
              delay={0}
            />
            <FeatureCard
              icon={FileText}
              title="Contractor"
              description="B2G procurement intelligence. Browse upcoming city contracts, see match scores, and auto-generate winning bid proposals."
              color="#a855f7"
              delay={0.15}
            />
            <FeatureCard
              icon={Users}
              title="Resident"
              description="Civic equity dashboard. Click any neighborhood to see investment gaps and generate data-backed advocacy letters."
              color="#22c55e"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 border-t border-border/30 bg-card/20 py-24 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-muted-foreground">From data to decision in three steps.</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                step: '01',
                title: 'Select a Location',
                description: 'Click anywhere on the 3D map of Montgomery to target a block.',
              },
              {
                icon: BarChart3,
                step: '02',
                title: 'Analyze the Data',
                description: 'Instantly get survival scores, permit history, crime density, and more.',
              },
              {
                icon: Zap,
                step: '03',
                title: 'Generate with AI',
                description: 'Get a full AI-generated report, bid proposal, or advocacy letter.',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                className="relative rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm"
              >
                <span className="mb-4 block font-mono text-3xl font-bold text-teal-400/40">
                  {item.step}
                </span>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10">
                  <item.icon className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Ready to explore the Atlas?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Montgomery's civic data, made actionable. Start exploring now.
            </p>
            <Link
              href="/app"
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30 hover:brightness-110"
            >
              Launch CivicPulse
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border/30 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-3">
             <div className="relative h-7 w-7 overflow-hidden rounded-md border border-teal-400/30">
                <Image src="/logo.png" alt="CivicPulse Logo" fill className="object-cover" />
             </div>
            <span className="text-sm font-semibold">CivicPulse</span>
            <span className="text-xs text-muted-foreground">Atlas Edition</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ at World Wide Vibes Hackathon · Montgomery, AL
          </p>
        </div>
      </footer>
    </div>
  )
}
