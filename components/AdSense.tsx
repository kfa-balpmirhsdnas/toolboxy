// Google AdSense loader — the exact async snippet AdSense expects. Rendered once in RootHtml so it
// loads on every page (both root layouts share RootHtml) and serves as the site-verification tag.
// A plain <script> (not next/script) avoids the data-nscript attribute and the mismatched preload
// warnings that next/script produces for this cross-origin async tag.
const ADSENSE_CLIENT = 'ca-pub-6332671384474684'

export default function AdSense() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  )
}
