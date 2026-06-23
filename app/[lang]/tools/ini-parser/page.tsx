'use client'
import {useState} from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function parseIni(text:string):Record<string,Record<string,string>>{
  const result:Record<string,Record<string,string>>={}
  let section='default'
  result[section]={}
  for(const rawLine of text.split('\n')){
    const line=rawLine.trim()
    if(!line||line.startsWith(';')||line.startsWith('#')) continue
    if(line.startsWith('[')&&line.endsWith(']')){
      section=line.slice(1,-1).trim()
      if(!result[section]) result[section]={}
    } else {
      const eq=line.indexOf('=')
      if(eq<0) continue
      const key=line.slice(0,eq).trim()
      const val=line.slice(eq+1).trim().replace(/^["']|["']$/g,'')
      result[section][key]=val
    }
  }
  return result
}

const DEMO='[database]\nhost=localhost\nport=5432\nname=mydb\n\n[server]\nhost=0.0.0.0\nport=8080\ndebug=true'

export default function Page(){
  const tool=TOOLS.find(t=>t.slug==='ini-parser')
  const [input,setInput]=useState(DEMO)
  const [parsed,setParsed]=useState<Record<string,Record<string,string>>|null>(null)
  const [error,setError]=useState('')

  function parse(){
    try{
      setParsed(parseIni(input))
      setError('')
    }catch(e){
      setError('Error: '+(e as Error).message)
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>INI Content</label>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            className='w-full h-40 p-3 border rounded font-mono text-sm resize-y'
            placeholder='Paste INI file content...'/>
        </div>
        <button onClick={parse} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Parse</button>
        {error&&<p className='text-red-500 text-sm'>{error}</p>}
        {parsed&&(
          <div className='space-y-3'>
            {Object.entries(parsed).map(([sec,vals])=>(
              <div key={sec} className='border rounded overflow-hidden'>
                <div className='bg-gray-100 px-3 py-1 font-mono text-sm font-medium'>[{sec}]</div>
                <table className='w-full text-sm'>
                  <tbody>
                    {Object.entries(vals).map(([k,v])=>(
                      <tr key={k} className='border-t'>
                        <td className='px-3 py-1 font-mono text-blue-700 w-1/3'>{k}</td>
                        <td className='px-3 py-1 text-gray-500'>=</td>
                        <td className='px-3 py-1 font-mono'>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(parsed,null,2))}
              className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm'>Copy as JSON</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}