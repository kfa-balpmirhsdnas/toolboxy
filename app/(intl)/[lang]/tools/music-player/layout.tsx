import { buildToolMetadata } from '@/lib/tools/metadata'

export function generateMetadata({ params }: { params: { lang: string } }) {
  return buildToolMetadata('music-player', params.lang)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Pre-paint dark-mode hint: the player's dark setting lives in localStorage, which the
          client component only reads AFTER hydration — so dark-mode users saw the blue SSR
          card flash before it turned black. This runs before the page paints and flags <html>,
          letting globals.css paint the themed cards dark from the very first frame. */}
      <script dangerouslySetInnerHTML={{ __html: "try{var h=document.documentElement;localStorage.getItem('mp_dark_v1')==='1'?h.setAttribute('data-mpdark','1'):h.removeAttribute('data-mpdark')}catch(e){}" }} />
      {children}
    </>
  )
}
