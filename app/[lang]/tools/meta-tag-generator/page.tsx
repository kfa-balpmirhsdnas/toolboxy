'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('meta-tag-generator')!
export default function MetaTagGeneratorPage() {
  const [title,setTitle]=useState('My Awesome Website')
  const [desc,setDesc]=useState('A comprehensive website with useful tools and resources for everyone.')
  const [keywords,setKeywords]=useState('tools, utilities, online, free')
  const [author,setAuthor]=useState('')
  const [url,setUrl]=useState('https://example.com')
  const [image,setImage]=useState('https://example.com/og-image.png')
  const [siteName,setSiteName]=useState('My Website')
  const [twitter,setTwitter]=useState('@mywebsite')
  const [copied,setCopied]=useState(false)
  const tags=[
    '<!-- Primary Meta Tags -->',
    '<meta name="title" content="'+title+'">',
    '<meta name="description" content="'+desc+'">',
    keywords?'<meta name="keywords" content="'+keywords+'">':'',
    author?'<meta name="author" content="'+author+'">':'',
    '',
    '<!-- Open Graph / Facebook -->',
    '<meta property="og:type" content="website">',
    url?'<meta property="og:url" content="'+url+'">':'',
    '<meta property="og:title" content="'+title+'">',
    '<meta property="og:description" content="'+desc+'">',
    image?'<meta property="og:image" content="'+image+'">':'',
    siteName?'<meta property="og:site_name" content="'+siteName+'">':'',
    '',
    '<!-- Twitter -->',
    '<meta property="twitter:card" content="summary_large_image">',
    url?'<meta property="twitter:url" content="'+url+'">':'',
    '<meta property="twitter:title" content="'+title+'">',
    '<meta property="twitter:description" content="'+desc+'">',
    image?'<meta property="twitter:image" content="'+image+'">':'',
    twitter?'<meta property="twitter:creator" content="'+twitter+'">':'',
  ].filter(l=>l!==undefined&&l!==null).join('\n')\n  const copy=()=>{navigator.clipboard.writeText(tags);setCopied(true);setTimeout(()=>setCopied(false),1500)}\n  const Field=({label,value,onChange,placeholder}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string})=>(\n    <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>\n      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}\n        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"/></div>\n  )\n  return (\n    <ToolLayout tool={tool}>\n      <div className="max-w-xl mx-auto px-4 space-y-3">\n        <div className="space-y-2">\n          <div><label className="block text-xs font-medium text-gray-600 mb-1">Title <span className={'text-xs ml-1 '+(title.length>60?'text-red-500':'text-gray-400')}>{title.length}/60</span></label>\n            <input value={title} onChange={e=>setTitle(e.target.value)}\n              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"/></div>\n          <div><label className="block text-xs font-medium text-gray-600 mb-1">Description <span className={'text-xs ml-1 '+(desc.length>160?'text-red-500':'text-gray-400')}>{desc.length}/160</span></label>\n            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2}\n              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"/></div>\n          <Field label="Keywords (comma separated)" value={keywords} onChange={setKeywords}/>\n          <Field label="Author" value={author} onChange={setAuthor} placeholder="John Doe"/>\n          <Field label="Page URL" value={url} onChange={setUrl} placeholder="https://example.com"/>\n          <Field label="OG Image URL" value={image} onChange={setImage} placeholder="https://example.com/image.png"/>\n          <Field label="Site Name" value={siteName} onChange={setSiteName}/>\n          <Field label="Twitter Handle" value={twitter} onChange={setTwitter} placeholder="@username"/>\n        </div>\n        <div className="bg-gray-900 rounded-xl overflow-hidden">\n          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">\n            <span className="text-xs text-gray-400">Generated meta tags</span>\n            <button onClick={copy} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">{copied?'Copied!':'Copy all'}</button>\n          </div>\n          <pre className="px-4 py-3 text-green-400 font-mono text-xs overflow-x-auto max-h-64 whitespace-pre">{tags}</pre>\n        </div>\n      </div>\n    </ToolLayout>\n  )\n}