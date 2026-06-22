'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function numberToWords(num: number): string {
  if (num === 0) return 'zero'
  if (num < 0) return 'negative ' + numberToWords(-num)
  const ones = ['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen']
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
  function conv(n: number): string {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? '-'+ones[n%10] : '')
    if (n < 1000) return ones[Math.floor(n/100)] + ' hundred' + (n%100 ? ' '+conv(n%100) : '')
    if (n < 1e6) return conv(Math.floor(n/1000)) + ' thousand' + (n%1000 ? ' '+conv(n%1000) : '')
    if (n < 1e9) return conv(Math.floor(n/1e6)) + ' million' + (n%1e6 ? ' '+conv(n%1e6) : '')
    return conv(Math.floor(n/1e9)) + ' billion' + (n%1e9 ? ' '+conv(n%1e9) : '')
  }
  return conv(num)
}

export default function NumberToWordsPage({ params }: { params: { lang: string } }) {
  const [inputNum, setInputNum] = useState('1234567')
  const tool = getToolBySlug('number-to-words')!
  const num = parseInt(inputNum.replace(/,/g,''), 10)
  const result = isNaN(num) || num < -2147483647 || num > 2147483647
    ? 'Please enter a valid integer'
    : numberToWords(num)
  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter a number</label>
          <input type="text" value={inputNum} onChange={e => setInputNum(e.target.value)}
            placeholder="e.g. 1234567"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">In words:</p>
          <p className="text-xl text-gray-900 leading-relaxed capitalize">{result}</p>
        </div>
        <button onClick={() => navigator.clipboard.writeText(result)}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm font-medium">
          Copy to Clipboard
        </button>
      </div>
    </ToolLayout>
  )
}