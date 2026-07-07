'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

/**
 * "Install app" button. When the browser offers a native PWA install it fires `beforeinstallprompt`
 * and the button triggers it directly. When it doesn't (iOS, or Chrome/Samsung right AFTER an
 * uninstall — the event isn't re-fired for a while), we fall back to a button that explains the
 * manual install path, unless the app is detected as already installed. Hidden while running
 * standalone (already the installed app).
 */
export default function InstallButton() {
  const t = useTranslations('nav')
  const [mode, setMode] = useState<'checking' | 'hidden' | 'ready' | 'manual'>('checking')
  const promptRef = useRef<BIPEvent | null>(null)

  useEffect(() => {
    const nav = navigator as unknown as { standalone?: boolean; getInstalledRelatedApps?: () => Promise<unknown[]> }
    if (window.matchMedia('(display-mode: standalone)').matches || nav.standalone) { setMode('hidden'); return }
    const onPrompt = (e: Event) => { e.preventDefault(); promptRef.current = e as BIPEvent; setMode('ready') }
    const onInstalled = () => { promptRef.current = null; setMode('hidden') }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    // No native prompt shortly after load → offer manual instructions (unless already installed).
    const timer = setTimeout(async () => {
      if (promptRef.current) return
      let installed = false
      try { if (nav.getInstalledRelatedApps) { const apps = await nav.getInstalledRelatedApps(); installed = Array.isArray(apps) && apps.length > 0 } } catch { /* ignore */ }
      if (!promptRef.current) setMode(installed ? 'hidden' : 'manual')
    }, 2500)
    return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled) }
  }, [])

  if (mode === 'checking' || mode === 'hidden') return null

  const onClick = async () => {
    const p = promptRef.current
    if (p) { await p.prompt(); await p.userChoice; promptRef.current = null; setMode('hidden'); return }
    alert(t('install_manual')) // eslint-disable-line no-alert
  }

  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors">
      <span>📲</span> {t('install')}
    </button>
  )
}
