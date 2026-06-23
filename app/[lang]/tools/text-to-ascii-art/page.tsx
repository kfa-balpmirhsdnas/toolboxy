'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

const BLOCK:Record<string,string[]>={
  A:['  A  ',' A A ',' AAA ',' A A ',' A A '],
  B:['BBB  ',' B B ','BBB  ',' B B ','BBB  '],
  C:[' CCC ','C    ','C    ','C    ',' CCC '],
  D:['DDD  ',' D D ',' D D ',' D D ','DDD  '],
  E:['EEEE ','E    ','EEE  ','E    ','EEEE '],
  F:['FFFF ','F    ','FFF  ','F    ','F    '],
  G:[' GGG ','G    ','G GG ','G  G ',' GGG '],
  H:['H  H ','H  H ','HHHH ','H  H ','H  H '],
  I:[' III ',' I   ',' I   ',' I   ',' III '],
  J:[' JJJ ','  J  ','  J  ','J J  ',' J   '],
  K:['K  K ','K K  ','KK   ','K K  ','K  K '],
  L:['L    ','L    ','L    ','L    ','LLLL '],
  M:['M   M','MM MM','M M M','M   M','M   M'],
  N:['N   N','NN  N','N N N','N  NN','N   N'],
  O:[' OOO ','O   O','O   O','O   O',' OOO '],
  P:['PPP  ','P  P ','PPP  ','P    ','P    '],
  Q:[' QQQ ','Q   Q','Q Q Q','Q  QQ',' QQQQ'],
  R:['RRR  ','R  R ','RRR  ','R R  ','R  R '],
  S:[' SSS ','S    ',' SS  ','   S ',' SSS '],
  T:['TTTTT','  T  ','  T  ','  T  ','  T  '],
  U:['U   U','U   U','U   U','U   U',' UUU '],
  V:['V   V','V   V',' V V ','  V  ','  V  '],
  W:['W   W','W   W','W W W','WW WW','W   W'],
  X:['X   X',' X X ','  X  ',' X X ','X   X'],
  Y:['Y   Y',' Y Y ','  Y  ','  Y  ','  Y  '],
  Z:['ZZZZZ','   Z ','  Z  ',' Z   ','ZZZZZ'],
  ' ':['     ','     ','     ','     ','     '],
}

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='text-to-ascii-art')
  const [input,setInput]=useState('HELLO')
  const chars=input.toUpperCase().split('').filter(c=>c in BLOCK)
  const rows=Array.from({length:5},(_,r)=>chars.map(c=>BLOCK[c][r]).join(' ')).join('\n')
  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <input value={input} onChange={e=>setInput(e.target.value.slice(0,20))}
          className='w-full border rounded px-3 py-2 text-lg font-mono uppercase'
          placeholder='Type text (A-Z, max 20 chars)'/>
        <pre className='bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto whitespace-pre'>
          {rows||'Enter text above'}
        </pre>
        <button onClick={()=>navigator.clipboard.writeText(rows)}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'>Copy ASCII Art</button>
      </div>
    </ToolLayout>
  )
}