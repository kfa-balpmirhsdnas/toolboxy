import type {Metadata} from 'next'

export const metadata:Metadata={
  title:{template:'%s | ToolBoxy',default:'ToolBoxy – Free Online Tools'},
  description:'ToolBoxy: 100+ free online tools for developers, designers, and everyday users.',
  metadataBase:new URL('https://toolboxy.net'),
  openGraph:{
    type:'website',
    siteName:'ToolBoxy',
    images:[{url:'/og-image.png',width:1200,height:630}]
  }
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <>{children}</>
}
