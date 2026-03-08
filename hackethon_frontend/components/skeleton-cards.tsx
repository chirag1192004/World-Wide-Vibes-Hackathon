'use client'

export function PanelSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-secondary" />
                <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded bg-secondary" />
                    <div className="h-3 w-40 rounded bg-secondary/70" />
                </div>
            </div>

            {/* Input skeleton */}
            <div className="h-12 w-full rounded-xl bg-secondary" />
            <div className="flex gap-2">
                <div className="h-12 flex-1 rounded-xl bg-secondary" />
                <div className="h-12 w-24 rounded-xl bg-secondary" />
            </div>

            {/* Card skeletons */}
            <div className="h-32 rounded-xl bg-secondary/80" />
            <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-xl bg-secondary" />
                <div className="h-20 rounded-xl bg-secondary" />
                <div className="h-20 rounded-xl bg-secondary" />
            </div>
            <div className="h-40 rounded-xl bg-secondary/60" />
        </div>
    )
}

export function ContractSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-secondary" />
                <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-secondary" />
                    <div className="h-3 w-44 rounded bg-secondary/70" />
                </div>
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-3">
                    <div className="flex justify-between">
                        <div className="space-y-2">
                            <div className="h-4 w-32 rounded bg-secondary" />
                            <div className="h-3 w-24 rounded bg-secondary/70" />
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="h-3 w-20 rounded bg-secondary ml-auto" />
                            <div className="h-3 w-16 rounded bg-secondary ml-auto" />
                        </div>
                    </div>
                    <div className="border-t border-border/30 pt-3 flex justify-between">
                        <div className="h-6 w-28 rounded bg-secondary" />
                        <div className="h-7 w-24 rounded-lg bg-secondary" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function ResidentSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-secondary" />
                <div className="space-y-1.5">
                    <div className="h-4 w-24 rounded bg-secondary" />
                    <div className="h-3 w-44 rounded bg-secondary/70" />
                </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-5 space-y-4">
                <div className="h-4 w-32 rounded bg-secondary" />
                <div className="h-14 w-20 rounded bg-secondary" />
                <div className="h-3 w-40 rounded bg-secondary/70" />
            </div>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 w-24 rounded bg-secondary" />
                        <div className="h-3 w-12 rounded bg-secondary" />
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary" />
                </div>
            ))}
        </div>
    )
}
