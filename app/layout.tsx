import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'

const inter = Inter({subsets:['latin']})

export const metadata:Metadata={
  title:{template:'%s | ToolBoxy',default:'ToolBoxy – Free Online Tools'},
  description:'ToolBoxy: 100+ free online tools for developers, designers, and everyday users.',
  metadataBase:new URL('https://www.toolboxy.net'),
  openGraph:{
    type:'website',
    siteName:'ToolBoxy',
    images:[{url:'/og-image.png',width:1200,height:630}]
  }
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html suppressHydrationWarning className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
