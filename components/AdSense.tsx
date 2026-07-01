import Script from 'next/script'

// Google AdSense loader. Rendered once in RootHtml so it lands on every page's <head> (both root
// layouts share RootHtml). Also serves as the site-ownership verification snippet.
const ADSENSE_CLIENT = 'ca-pub-6332671384474684'

export default function AdSense() {
  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  )
}
