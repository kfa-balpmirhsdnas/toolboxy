'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('open-graph-preview')!

export default function OpenGraphPreviewPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [title, setTitle] = useState(t('og_def_title'))
  const [description, setDescription] = useState(t('og_def_desc'))
  const [imageUrl, setImageUrl] = useState('https://placehold.co/1200x630/6366f1/ffffff?text=OG+Image')
  const [siteUrl, setSiteUrl] = useState('https://example.com')
  const [siteName, setSiteName] = useState(t('og_def_site'))
  const [twitterCard, setTwitterCard] = useState<'summary'|'summary_large_image'>('summary_large_image')
  const [tab, setTab] = useState<'facebook'|'twitter'|'linkedin'>('facebook')
  const [copied, setCopied] = useState(false)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('open-graph-preview'); tracked.current = true } }

  const metaTags = `<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${siteUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:site_name" content="${siteName}" />

<!-- Twitter -->
<meta name="twitter:card" content="${twitterCard}" />
<meta name="twitter:url" content="${siteUrl}" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${imageUrl}" />`

  async function copy() { await navigator.clipboard.writeText(metaTags); trackToolCopy('open-graph-preview'); setCopied(true); setTimeout(()=>setCopied(false),1500) }

  const FIELDS = [
    { id:'title', label:t('og_title_label'), value:title, set:setTitle, placeholder:t('og_ph_title') },
    { id:'desc', label:t('og_desc_label'), value:description, set:setDescription, placeholder:t('og_ph_desc') },
    { id:'image', label:t('og_image_label'), value:imageUrl, set:setImageUrl, placeholder:'https://...' },
    { id:'url', label:t('og_url_label'), value:siteUrl, set:setSiteUrl, placeholder:t('og_ph_url') },
    { id:'site', label:t('og_site_label'), value:siteName, set:setSiteName, placeholder:t('og_ph_site') },
  ]

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="space-y-2">
          {FIELDS.map(f=>(
            <div key={f.id} className="flex gap-2 items-start">
              <label className="text-xs font-medium text-gray-600 w-24 pt-2 shrink-0">{f.label}</label>
              {f.id==='desc' ? (
                <textarea value={f.value} onChange={e=>{f.set(e.target.value);track()}} rows={2} placeholder={f.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
              ) : (
                <input value={f.value} onChange={e=>{f.set(e.target.value);track()}} placeholder={f.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              )}
            </div>
          ))}
          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium text-gray-600 w-24 shrink-0">{t('og_twcard')}</label>
            <div className="flex gap-1">
              {(['summary','summary_large_image'] as const).map(v=>(
                <button key={v} onClick={()=>{setTwitterCard(v);track()}}
                  className={'px-2.5 py-1.5 rounded-lg text-xs transition-colors ' + (twitterCard===v?'bg-brand-600 text-white':'bg-gray-100 text-gray-600')}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-1 mb-3">
            {(['facebook','twitter','linkedin'] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={'px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ' + (tab===t?'bg-gray-800 text-white':'bg-gray-100 text-gray-600')}>
                {t}
              </button>
            ))}
          </div>
          {tab==='facebook' && (
            <div className="border border-gray-200 rounded-xl overflow-hidden max-w-md">
              {imageUrl && <img src={imageUrl} alt="og" className="w-full h-40 object-cover" onError={e=>(e.currentTarget.style.display='none')} />}
              <div className="p-3 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase">{new URL(siteUrl.startsWith('http')?siteUrl:'https://'+siteUrl).hostname}</p>
                <p className="font-bold text-sm text-gray-900 mt-0.5 line-clamp-1">{title}</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{description}</p>
              </div>
            </div>
          )}
          {tab==='twitter' && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden max-w-md">
              {twitterCard==='summary_large_image' && imageUrl && <img src={imageUrl} alt="og" className="w-full h-40 object-cover" onError={e=>(e.currentTarget.style.display='none')} />}
              <div className="p-3 flex gap-2">
                {twitterCard==='summary' && imageUrl && <img src={imageUrl} alt="og" className="w-16 h-16 object-cover rounded-xl shrink-0" onError={e=>(e.currentTarget.style.display='none')} />}
                <div>
                  <p className="font-bold text-sm text-gray-900 line-clamp-1">{title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{description}</p>
                  <p className="text-xs text-gray-400 mt-1">🔗 {siteUrl}</p>
                </div>
              </div>
            </div>
          )}
          {tab==='linkedin' && (
            <div className="border border-gray-200 rounded-xl overflow-hidden max-w-md">
              {imageUrl && <img src={imageUrl} alt="og" className="w-full h-40 object-cover" onError={e=>(e.currentTarget.style.display='none')} />}
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-900 line-clamp-1">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{siteName} · {new URL(siteUrl.startsWith('http')?siteUrl:'https://'+siteUrl).hostname}</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">{t('og_meta')}</label>
            <button onClick={copy} className="text-xs text-brand-600 hover:underline">{copied?t('og_copied'):t('og_copy')}</button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-xl font-mono overflow-x-auto">{metaTags}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
