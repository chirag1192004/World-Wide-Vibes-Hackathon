'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

const MAPTILER_API_KEY = 'cqSLxCfaZH1NYfFh5044'

interface AddressResult {
    place_name: string
    center: [number, number] // [lng, lat]
}

interface AddressAutocompleteProps {
    value: string
    onChange: (val: string) => void
    onSelect: (address: string, lat: number, lng: number) => void
    placeholder?: string
}

export default function AddressAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = 'Search address in Montgomery, AL',
}: AddressAutocompleteProps) {
    const [results, setResults] = useState<AddressResult[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function handleInput(text: string) {
        onChange(text)
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (text.length < 3) {
            setResults([])
            setShowDropdown(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await fetch(
                    `https://api.maptiler.com/geocoding/${encodeURIComponent(text)}.json?key=${MAPTILER_API_KEY}&proximity=-86.2999,32.3668&bbox=-86.5,-86.1,32.2,32.5&limit=5`
                )
                const json = await res.json()
                const features = json.features || []
                setResults(
                    features.map((f: any) => ({
                        place_name: f.place_name,
                        center: f.center,
                    }))
                )
                setShowDropdown(features.length > 0)
            } catch {
                setResults([])
            }
            setLoading(false)
        }, 300)
    }

    function handleSelect(result: AddressResult) {
        onChange(result.place_name)
        onSelect(result.place_name, result.center[1], result.center[0])
        setShowDropdown(false)
    }

    return (
        <div ref={containerRef} className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {loading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => handleInput(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-border bg-secondary/50 py-3 pl-10 pr-10 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
            />

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                    {results.map((result, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(result)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-secondary/50"
                        >
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-orange-400" />
                            <span className="truncate text-foreground">{result.place_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
