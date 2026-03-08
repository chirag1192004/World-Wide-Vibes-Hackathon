'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, BarChart3, Sparkles, ArrowRight, X } from 'lucide-react'

const STEPS = [
    {
        target: 'mode-nav',
        icon: BarChart3,
        title: 'Switch Modes',
        description: 'Toggle between Entrepreneur, Contractor, and Resident views. Press 1, 2, or 3 on your keyboard.',
        position: 'bottom' as const,
    },
    {
        target: 'map-area',
        icon: MapPin,
        title: 'Click the Map',
        description: 'Click anywhere on the Montgomery map to select a location. All panels will update with data for that area.',
        position: 'center' as const,
    },
    {
        target: 'side-panel',
        icon: Sparkles,
        title: 'Explore & Generate',
        description: 'View survival scores, contracts, and civic equity. Use AI to generate reports, bids, and advocacy letters.',
        position: 'left' as const,
    },
]

const STORAGE_KEY = 'civicpulse-onboarding-seen'

export default function OnboardingTour() {
    const [step, setStep] = useState(0)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const seen = localStorage.getItem(STORAGE_KEY)
        if (!seen) {
            // Delay to let the dashboard load
            const timer = setTimeout(() => setVisible(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    function next() {
        if (step < STEPS.length - 1) {
            setStep(step + 1)
        } else {
            dismiss()
        }
    }

    function dismiss() {
        setVisible(false)
        localStorage.setItem(STORAGE_KEY, 'true')
    }

    if (!visible) return null

    const current = STEPS[step]
    const Icon = current.icon

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                        onClick={dismiss}
                    />

                    {/* Tour Card */}
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="fixed left-1/2 top-1/2 z-[61] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-card p-6 shadow-2xl"
                    >
                        {/* Close */}
                        <button
                            onClick={dismiss}
                            className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Step indicator */}
                        <div className="mb-4 flex items-center gap-2">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className="h-1.5 flex-1 rounded-full transition-all"
                                    style={{
                                        backgroundColor: i <= step ? '#14b8a6' : 'var(--border)',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Icon */}
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/15">
                            <Icon className="h-6 w-6 text-teal-400" />
                        </div>

                        {/* Content */}
                        <h3 className="mb-2 text-lg font-semibold text-foreground">{current.title}</h3>
                        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{current.description}</p>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={dismiss}
                                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Skip tour
                            </button>
                            <button
                                onClick={next}
                                className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-600"
                            >
                                {step < STEPS.length - 1 ? (
                                    <>
                                        Next
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </>
                                ) : (
                                    <>
                                        Get Started
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
