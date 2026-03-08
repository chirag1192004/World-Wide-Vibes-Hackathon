'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import CivicMap from '@/components/civic-map'
import EntrepreneurPanel from '@/components/entrepreneur-panel'
import ContractorPanel from '@/components/contractor-panel'
import ResidentPanel from '@/components/resident-panel'
import AiChat from '@/components/ai-chat'
import OnboardingTour from '@/components/onboarding-tour'
import { Toaster, toast } from 'sonner'
import {
    Menu,
    X,
    ChevronUp,
    Briefcase,
    FileText,
    Users,
    Sparkles,
    Sun,
    Moon,
    Box,
    Map as MapIcon,
    ArrowLeft,
} from 'lucide-react'
import { type BusinessCategory, BUSINESS_CATEGORIES } from '@/lib/mock-data'

type Mode = 'entrepreneur' | 'contractor' | 'resident'
type MapViewType = '3d' | 'street'

const modes: { id: Mode; label: string; icon: React.ReactNode; description: string }[] = [
    {
        id: 'entrepreneur',
        label: 'Entrepreneur',
        icon: <Briefcase className="h-4 w-4" />,
        description: 'Site selection AI',
    },
    {
        id: 'contractor',
        label: 'Contractor',
        icon: <FileText className="h-4 w-4" />,
        description: 'B2G procurement',
    },
    {
        id: 'resident',
        label: 'Resident',
        icon: <Users className="h-4 w-4" />,
        description: 'Civic equity',
    },
]

const modeColors = {
    entrepreneur: '#f97316',
    contractor: '#a855f7',
    resident: '#22c55e',
}

export default function DashboardPage() {
    const router = useRouter()
    const [activeMode, setActiveMode] = useState<Mode>('entrepreneur')
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<BusinessCategory>('restaurant')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobilePanelOpen, setMobilePanelOpen] = useState(false)
    const [mapView, setMapView] = useState<MapViewType>('3d')
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
            switch (e.key) {
                case '1': setActiveMode('entrepreneur'); toast.success('Switched to Entrepreneur mode', { duration: 1500 }); break
                case '2': setActiveMode('contractor'); toast.success('Switched to Contractor mode', { duration: 1500 }); break
                case '3': setActiveMode('resident'); toast.success('Switched to Resident mode', { duration: 1500 }); break
                case 'Escape': setMobilePanelOpen(false); setMobileMenuOpen(false); break
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [])

    const currentMode = modes.find((m) => m.id === activeMode)!
    const currentColor = modeColors[activeMode]

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    const toggleMapView = () => {
        setMapView((prev) => (prev === '3d' ? 'street' : '3d'))
    }

    return (
        <div className="gradient-mesh flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
            {/* Navigation Header */}
            <header className="z-20 flex items-center justify-between border-b border-border/50 bg-card/80 px-4 py-3 backdrop-blur-xl lg:px-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-secondary/50 transition-colors hover:bg-secondary"
                        title="Back to Home"
                    >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <div className="relative flex h-10 w-10 items-center justify-center">
                        <div
                            className="absolute inset-0 rounded-xl opacity-20 blur-lg"
                            style={{ backgroundColor: currentColor }}
                        />
                        <div
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-card"
                        >
                            <Sparkles className="h-5 w-5" style={{ color: currentColor }} />
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-bold tracking-tight">CivicPulse</h1>
                        <p className="text-xs text-muted-foreground">Atlas Edition</p>
                    </div>
                </div>

                {/* Desktop Mode Toggle */}
                <nav className="hidden rounded-xl border border-border/50 bg-secondary/50 p-1 md:flex">
                    {modes.map((mode) => {
                        const isActive = activeMode === mode.id
                        const color = modeColors[mode.id]
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setActiveMode(mode.id)}
                                className="relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                                style={{
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: isActive ? color : 'var(--muted-foreground)',
                                }}
                            >
                                {isActive && (
                                    <span
                                        className="absolute inset-0 rounded-lg opacity-10"
                                        style={{ backgroundColor: color }}
                                    />
                                )}
                                <span className="relative flex items-center gap-2">
                                    {mode.icon}
                                    {mode.label}
                                    <kbd className="hidden rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
                                        {modes.indexOf(mode) + 1}
                                    </kbd>
                                </span>
                            </button>
                        )
                    })}
                </nav>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                    {/* Category Filter (visible in Entrepreneur mode) */}
                    {activeMode === 'entrepreneur' && (
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as BusinessCategory)}
                            className="hidden rounded-xl border border-border/50 bg-secondary/50 px-3 py-2 text-xs font-medium text-foreground outline-none sm:block"
                            title="Filter map by business type"
                        >
                            {BUSINESS_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Map View Toggle */}
                    <button
                        onClick={toggleMapView}
                        className="hidden items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:flex"
                        title={mapView === '3d' ? 'Switch to Street View' : 'Switch to 3D View'}
                    >
                        {mapView === '3d' ? (
                            <>
                                <Box className="h-4 w-4 text-primary" />
                                <span className="hidden lg:inline">3D</span>
                            </>
                        ) : (
                            <>
                                <MapIcon className="h-4 w-4 text-primary" />
                                <span className="hidden lg:inline">Street</span>
                            </>
                        )}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center rounded-xl border border-border/50 bg-secondary/50 p-2.5 transition-colors hover:bg-secondary"
                        title={mounted && resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {mounted && resolvedTheme === 'dark' ? (
                            <Sun className="h-4 w-4 text-yellow-500" />
                        ) : (
                            <Moon className="h-4 w-4 text-slate-700" />
                        )}
                    </button>

                    {/* Location Badge - Desktop */}
                    <div className="hidden items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-4 py-2 lg:flex">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                        <span className="text-sm text-muted-foreground">Montgomery, AL</span>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg border border-border/50 bg-secondary/50 p-2 md:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <Menu className="h-5 w-5 text-muted-foreground" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="absolute left-0 right-0 top-16 z-30 border-b border-border/50 bg-card/95 p-4 backdrop-blur-xl md:hidden">
                    <div className="space-y-2">
                        {/* Category Filter - Mobile */}
                        {activeMode === 'entrepreneur' && (
                            <div className="mb-4 rounded-xl border border-border/50 bg-secondary/30 p-3">
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Business Type</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value as BusinessCategory)}
                                    className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none"
                                >
                                    {BUSINESS_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c.charAt(0).toUpperCase() + c.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Map View Toggle - Mobile */}
                        <div className="mb-4 flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3">
                            <span className="text-sm font-medium text-foreground">Map View</span>
                            <div className="flex rounded-lg border border-border/50 bg-secondary/50 p-0.5">
                                <button
                                    onClick={() => setMapView('3d')}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mapView === '3d' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                                        }`}
                                >
                                    <Box className="h-3.5 w-3.5" />
                                    3D
                                </button>
                                <button
                                    onClick={() => setMapView('street')}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mapView === 'street' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                                        }`}
                                >
                                    <MapIcon className="h-3.5 w-3.5" />
                                    Street
                                </button>
                            </div>
                        </div>

                        {modes.map((mode) => {
                            const isActive = activeMode === mode.id
                            const color = modeColors[mode.id]
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setActiveMode(mode.id)
                                        setMobileMenuOpen(false)
                                    }}
                                    className="flex w-full items-center justify-between rounded-xl p-3 transition-colors"
                                    style={{
                                        backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        border: `1px solid ${isActive ? color : 'var(--border)'}`,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: `${color}20`, color }}
                                        >
                                            {mode.icon}
                                        </span>
                                        <div className="text-left">
                                            <p className="font-medium" style={{ color: isActive ? color : 'var(--foreground)' }}>
                                                {mode.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{mode.description}</p>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Map Section */}
                <div className="relative flex-1">
                    <CivicMap
                        onLocationSelect={(lat: number, lng: number) => {
                            setSelectedLocation({ lat, lng })
                            if (activeMode === 'resident') {
                                setMobilePanelOpen(true)
                            }
                        }}
                        activeMode={activeMode}
                        mapView={mapView}
                        selectedCategory={selectedCategory}
                    />

                    {/* Active Mode Indicator */}
                    <div className="absolute right-4 top-4 z-10 rounded-xl border border-border/50 bg-card/80 px-4 py-2 backdrop-blur-lg">
                        <p className="text-xs text-muted-foreground">Active Mode</p>
                        <p className="font-semibold" style={{ color: currentColor }}>
                            {currentMode.label}
                        </p>
                    </div>

                    {/* Selected Location indicator */}
                    {selectedLocation && (
                        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-border/50 bg-card/80 px-3 py-2 backdrop-blur-lg">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
                            <p className="text-xs text-muted-foreground">
                                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                            </p>
                        </div>
                    )}

                    {/* Mobile Panel Toggle */}
                    <button
                        onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
                        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/50 bg-card/90 px-5 py-2.5 text-sm font-medium shadow-lg backdrop-blur-xl transition-all lg:hidden"
                        style={{
                            boxShadow: `0 4px 24px -4px ${currentColor}33`,
                        }}
                    >
                        <span style={{ color: currentColor }}>{currentMode.icon}</span>
                        <span>{mobilePanelOpen ? 'Hide Panel' : `${currentMode.label} Panel`}</span>
                        <ChevronUp
                            className="h-4 w-4 transition-transform"
                            style={{
                                color: currentColor,
                                transform: mobilePanelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                        />
                    </button>
                </div>

                {/* Side Panel - Desktop */}
                <aside className="scrollbar-thin hidden w-[420px] flex-shrink-0 overflow-y-auto border-l border-border/50 bg-card/50 p-6 backdrop-blur-sm lg:block">
                    <div className="animate-fade-in-up">
                        {activeMode === 'entrepreneur' && (
                            <EntrepreneurPanel
                                selectedLocation={selectedLocation}
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                            />
                        )}
                        {activeMode === 'contractor' && (
                            <ContractorPanel
                                selectedLocation={selectedLocation}
                            />
                        )}
                        {activeMode === 'resident' && <ResidentPanel selectedLocation={selectedLocation} />}
                    </div>
                </aside>

                {/* Side Panel - Mobile */}
                <div
                    className={`fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-300 lg:hidden ${mobilePanelOpen ? 'translate-y-0' : 'translate-y-full'
                        }`}
                    style={{ maxHeight: '75vh' }}
                >
                    <div className="rounded-t-3xl border-t border-border/50 bg-card/95 backdrop-blur-xl">
                        {/* Handle */}
                        <div className="flex justify-center py-3" onClick={() => setMobilePanelOpen(false)}>
                            <div className="h-1.5 w-12 rounded-full bg-border" />
                        </div>
                        {/* Content */}
                        <div className="scrollbar-thin max-h-[calc(75vh-40px)] overflow-y-auto px-5 pb-8">
                            {activeMode === 'entrepreneur' && (
                                <EntrepreneurPanel
                                    selectedLocation={selectedLocation}
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={setSelectedCategory}
                                />
                            )}
                            {activeMode === 'contractor' && (
                                <ContractorPanel
                                    selectedLocation={selectedLocation}
                                />
                            )}
                            {activeMode === 'resident' && <ResidentPanel selectedLocation={selectedLocation} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Panel Overlay */}
            {mobilePanelOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobilePanelOpen(false)}
                />
            )}

            {/* AI Chat Assistant */}
            <AiChat />

            {/* Onboarding Tour */}
            <OnboardingTour />

            {/* Toaster */}
            <Toaster
                theme={mounted && resolvedTheme === 'dark' ? 'dark' : 'light'}
                position="top-right"
                richColors
                closeButton
            />
        </div>
    )
}
