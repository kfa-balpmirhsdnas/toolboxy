'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

/**
 * "Install app" button shown only when the browser actually offers a PWA install
 * for this page (Chrome/Edge/Android fire `beforeinstallprompt`). Installing from
 * a tool page captures that tool as its own app (see the per-page manifest), and
 * online use stays network-first, so there's no downside to offering it here.
 * Hidden when already installed or where install isn't available (e.g. iOS).
 */
export default function InstallButton() {
  const t = useTranslations('nav')
  const [prompt, setPrompt] = useState<BIPEvent | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) { setHidden(true); return }
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as BIPEvent) }
    const onInstalled = () => { setHidden(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (hidden || !prompt) return null

  const install = async () => {
    await prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  return (
    <button onClick={install}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors">
      <span>📲</span> {t('install')}
    </button>
  )
}
