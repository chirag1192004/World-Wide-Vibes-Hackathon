import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'CivicPulse | Atlas Dashboard',
    description: 'Interactive civic intelligence dashboard for Montgomery, AL',
}

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
