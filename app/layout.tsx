import type {Metadata, Viewport} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import DynamicManifest from '@/components/DynamicManifest'
import {Analytics} from '@vercel/analytics/react'

const inter = Inter({subsets:['latin']})

export const metadata:Metadata={
  title:{template:'%s | ToolBoxy',default:'ToolBoxy – Free Online Tools'},
  description:'ToolBoxy: 100+ free online tools for developers, designers, and everyday users.',
  metadataBase:new URL('https://www.toolboxy.net'),
  manifest:'/api/manifest?start=/en',
  appleWebApp:{capable:true,title:'ToolBoxy',statusBarStyle:'default'},
  icons:{icon:'/icon.svg',apple:'/icon.svg'},
  openGraph:{
    type:'website',
    siteName:'ToolBoxy',
    images:[{url:'/og-image.png',width:1200,height:630}]
  }
}

export const viewport:Viewport={
  themeColor:'#0284c7'
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html suppressHydrationWarning className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        {children}
        <DynamicManifest/>
        <ServiceWorkerRegister/>
        <Analytics/>
      </body>
    </html>
  )
}
