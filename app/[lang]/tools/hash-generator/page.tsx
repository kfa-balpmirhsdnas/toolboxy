'use client'
import { useState, useCallback } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('hash-generator')!
async function hashText(text: string, algo: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}
const ALGOS = [
  { label: 'MD5', value: 'md5' },
  { label: 'SHA-1', value: 'SHA-1' },
  { label: 'SHA-256', value: 'SHA-256' },
  { label: 'SHA-384', value: 'SHA-384' },
  { label: 'SHA-512', value: 'SHA-512' },
]
function md5(str: string): string {
  function safeAdd(x: number, y: number) { return (x + y) & 0xffffffff }
  function bitRotateLeft(num: number, cnt: number) { return (num << cnt) | (num >>> (32 - cnt)) }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b) }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t) }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t) }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t) }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t) }
  const su = unescape(encodeURIComponent(str))
  const bytes: number[] = []
  for (let i = 0; i < su.length; i++) bytes.push(su.charCodeAt(i))
  bytes.push(0x80)
  while (bytes.length % 64 !== 56) bytes.push(0)
  const bL = su.length * 8
  for (let i = 0; i < 8; i++) bytes.push((bL >>> (i * 8)) & 0xff)
  const words: number[] = []
  for (let i = 0; i < bytes.length; i += 4) words.push(bytes[i] | (bytes[i+1] << 8) | (bytes[i+2] << 16) | (bytes[i+3] << 24))
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476
  for (let i = 0; i < words.length; i += 16) {
    const M = words.slice(i, i + 16); let aa=a,bb=b,cc=c,dd=d
    a=md5ff(a,b,c,d,M[0],7,-680876936);d=md5ff(d,a,b,c,M[1],12,-389564586);c=md5ff(c,d,a,b,M[2],17,606105819);b=md5ff(b,c,d,a,M[3],22,-1044525330)
    a=md5ff(a,b,c,d,M[4],7,-176418897);d=md5ff(d,a,b,c,M[5],12,1200080426);c=md5ff(c,d,a,b,M[6],17,-1473231341);b=md5ff(b,c,d,a,M[7],22,-45705983)
    a=md5ff(a,b,c,d,M[8],7,1770035416);d=md5ff(d,a,b,c,M[9],12,-1958414417);c=md5ff(c,d,a,b,M[10],17,-42063);b=md5ff(b,c,d,a,M[11],22,-1990404162)
    a=md5ff(a,b,c,d,M[12],7,1804603682);d=md5ff(d,a,b,c,M[13],12,-40341101);c=md5ff(c,d,a,b,M[14],17,-1502002290);b=md5ff(b,c,d,a,M[15],22,1236535329)
    a=md5gg(a,b,c,d,M[1],5,-165796510);d=md5gg(d,a,b,c,M[6],9,-1069501632);c=md5gg(c,d,a,b,M[11],14,643717713);b=md5gg(b,c,d,a,M[0],20,-373897302)
    a=md5gg(a,b,c,d,M[5],5,-701558691);d=md5gg(d,a,b,c,M[10],9,38016083);c=md5gg(c,d,a,b,M[15],14,-660478335);b=md5gg(b,c,d,a,M[4],20,-405537848)
    a=md5gg(a,b,c,d,M[9],5,568446438);d=md5gg(d,a,b,c,M[14],9,-1019803690);c=md5gg(c,d,a,b,M[3],14,-187363961);b=md5gg(b,c,d,a,M[8],20,1163531501)
    a=md5gg(a,b,c,d,M[13],5,-1444681467);d=md5gg(d,a,b,c,M[2],9,-51403784);c=md5gg(c,d,a,b,M[7],14,1735328473);b=md5gg(b,c,d,a,M[12],20,-1926607734)
    a=md5hh(a,b,c,d,M[5],4,-378558);d=md5hh(d,a,b,c,M[8],11,-2022574463);c=md5hh(c,d,a,b,M[11],16,1839030562);b=md5hh(b,c,d,a,M[14],23,-35309556)
    a=md5hh(a,b,c,d,M[1],4,-1530992060);d=md5hh(d,a,b,c,M[4],11,1272893353);c=md5hh(c,d,a,b,M[7],16,-155497632);b=md5hh(b,c,d,a,M[10],23,-1094730640)
    a=md5hh(a,b,c,d,M[13],4,681279174);d=md5hh(d,a,b,c,M[0],11,-358537222);c=md5hh(c,d,a,b,M[3],16,-722521979);b=md5hh(b,c,d,a,M[6],23,76029189)
    a=md5hh(a,b,c,d,M[9],4,-640364487);d=md5hh(d,a,b,c,M[12],11,-421815835);c=md5hh(c,d,a,b,M[15],16,530742520);b=md5hh(b,c,d,a,M[2],23,-995338651)
    a=md5ii(a,b,c,d,M[0],6,-198630844);d=md5ii(d,a,b,c,M[7],10,1126891415);c=md5ii(c,d,a,b,M[14],15,-1416354905);b=md5ii(b,c,d,a,M[5],21,-57434055)
    a=md5ii(a,b,c,d,M[12],6,1700485571);d=md5ii(d,a,b,c,M[3],10,-1894986606);c=md5ii(c,d,a,b,M[10],15,-1051523);b=md5ii(b,c,d,a,M[1],21,-2054922799)
    a=md5ii(a,b,c,d,M[8],6,1873313359);d=md5ii(d,a,b,c,M[15],10,-30611744);c=md5ii(c,d,a,b,M[6],15,-1560198380);b=md5ii(b,c,d,a,M[13],21,1309151649)
    a=md5ii(a,b,c,d,M[4],6,-145523070);d=md5ii(d,a,b,c,M[11],10,-1120210379);c=md5ii(c,d,a,b,M[2],15,718787259);b=md5ii(b,c,d,a,M[9],21,-343485551)
    a=safeAdd(a,aa);b=safeAdd(b,bb);c=safeAdd(c,cc);d=safeAdd(d,dd)
  }
  const toHex=(n: number)=>[n&0xff,(n>>>8)&0xff,(n>>>16)&0xff,(n>>>24)&0xff].map(b=>b.toString(16).padStart(2,'0')).join('')
  return toHex(a)+toHex(b)+toHex(c)+toHex(d)
}
export default function HashGeneratorPage({ params }: { params: { lang: string } }) {
  const [input, setInput] = useState('')
  const [algo, setAlgo] = useState('SHA-256')
  const [result, setResult] = useState('')
  const [uppercase, setUppercase] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const generate = useCallback(async () => {
    if (!input) { setResult(''); return }
    setLoading(true)
    try {
      const hash = algo === 'md5' ? md5(input) : await hashText(input, algo)
      setResult(uppercase ? hash.toUpperCase() : hash)
    } catch (e) { setResult('Error computing hash') }
    setLoading(false)
  }, [input, algo, uppercase])
  async function copy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          {ALGOS.map(a => (<button key={a.value} onClick={() => setAlgo(a.value)} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${algo === a.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{a.label}</button>))}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 ml-auto"><input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="accent-brand-600" />Uppercase</label>
        </div>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to hash..." rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-400" />
        <button onClick={generate} disabled={!input || loading} className="bg-brand-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors">{loading ? 'Computing…' : 'Generate Hash'}</button>
        {result && (<div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"><code className="flex-1 text-sm font-mono text-gray-800 break-all">{result}</code><button onClick={copy} className="shrink-0 text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors">{copied ? '✓' : 'Copy'}</button></div>)}
        <p className="text-xs text-gray-400">All hashing is done locally in your browser.</p>
      </div>
    </ToolLayout>
  )
}