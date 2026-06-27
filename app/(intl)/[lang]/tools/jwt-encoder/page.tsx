'use client'
import {useState} from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import {TOOLS} from '@/lib/tools/registry'

function b64url(s:string):string{
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}

export default function Page(){
  const t = useTranslations('toolui')
  const tool=TOOLS.find(x=>x.slug==='jwt-encoder')
  const [header,setHeader]=useState('{"alg":"HS256","typ":"JWT"}')
  const [payload,setPayload]=useState('{"sub":"1234567890","name":"John Doe","iat":1516239022}')
  const [secret,setSecret]=useState('your-secret-key')
  const [error,setError]=useState('')

  function encode(){
    try{
      const h=b64url(header)
      const p=b64url(payload)
      const msg=h+'.'+p
      return msg+'.'+b64url(secret+'|'+msg)
    }catch(e){
      setError(t('jm_invalid'))
      return ''
    }
  }
  const token=encode()

  return (
    <ToolLayout tool={tool}>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>{t('jwt_header')}</label>
          <textarea value={header} onChange={e=>{setHeader(e.target.value);setError('')}}
            className='w-full h-20 p-3 border rounded font-mono text-sm resize-y'/>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>{t('jwt_payload')}</label>
          <textarea value={payload} onChange={e=>{setPayload(e.target.value);setError('')}}
            className='w-full h-24 p-3 border rounded font-mono text-sm resize-y'/>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>{t('jwt_secret')}</label>
          <input value={secret} onChange={e=>setSecret(e.target.value)}
            className='w-full border rounded px-3 py-2 font-mono text-sm'/>
        </div>
        {error&&<p className='text-red-500 text-sm'>{error}</p>}
        {token&&(
          <div>
            <label className='block text-sm font-medium mb-1'>{t('jwt_token')}</label>
            <textarea readOnly value={token}
              className='w-full h-24 p-3 border rounded font-mono text-xs bg-gray-50 break-all resize-y'/>
            <button onClick={()=>navigator.clipboard.writeText(token)}
              className='mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'>{t('jwt_copytoken')}</button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}