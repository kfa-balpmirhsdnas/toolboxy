export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-NTSTYK1Q1Z'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Fire a GA4 custom event */
export function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean> = {}
) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', eventName, params)
}

/** tool_view — fired when user lands on a tool page */
export function trackToolView(slug: string) {
  trackEvent('tool_view', { tool_slug: slug })
}

/** tool_used — fired when user gets a real result (conversion / decode / extract) */
export function trackToolUsed(slug: string, action = 'convert') {
  trackEvent('tool_used', { tool_slug: slug, action })
}

/** tool_copy — fired when user clicks Copy button */
export function trackToolCopy(slug: string) {
  trackEvent('tool_copy', { tool_slug: slug })
}

/** tool_download — fired when user downloads output */
export function trackToolDownload(slug: string, format: string) {
  trackEvent('tool_download', { tool_slug: slug, format })
}
