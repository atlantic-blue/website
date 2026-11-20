"use client"

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: unknown[]) => void
    }
}

export interface AnalyticsProps {
    readonly measurementId?: string
}

export const expiredGoogleCookies = (_cookies: string, _hostname: string): string[] => []

export const Analytics = (_props: AnalyticsProps) => null
