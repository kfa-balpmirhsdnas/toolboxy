'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('html-color-codes')!
const COLORS:{name:string;hex:string;group:string}[]=[
  {name:'AliceBlue',hex:'#F0F8FF',group:'blue'},{name:'AntiqueWhite',hex:'#FAEBD7',group:'white'},
  {name:'Aqua',hex:'#00FFFF',group:'blue'},{name:'Aquamarine',hex:'#7FFFD4',group:'green'},
  {name:'Azure',hex:'#F0FFFF',group:'blue'},{name:'Beige',hex:'#F5F5DC',group:'yellow'},
  {name:'Black',hex:'#000000',group:'gray'},{name:'Blue',hex:'#0000FF',group:'blue'},
  {name:'BlueViolet',hex:'#8A2BE2',group:'purple'},{name:'Brown',hex:'#A52A2A',group:'red'},
  {name:'Coral',hex:'#FF7F50',group:'red'},{name:'CornflowerBlue',hex:'#6495ED',group:'blue'},
  {name:'Crimson',hex:'#DC143C',group:'red'},{name:'Cyan',hex:'#00FFFF',group:'blue'},
  {name:'DarkBlue',hex:'#00008B',group:'blue'},{name:'DarkGoldenRod',hex:'#B8860B',group:'yellow'},
  {name:'DarkGreen',hex:'#006400',group:'green'},{name:'DarkGray',hex:'#A9A9A9',group:'gray'},
  {name:'DarkOrange',hex:'#FF8C00',group:'orange'},{name:'DarkOrchid',hex:'#9932CC',group:'purple'},
  {name:'DarkRed',hex:'#8B0000',group:'red'},{name:'DarkSalmon',hex:'#E9967A',group:'red'},
  {name:'DarkSeaGreen',hex:'#8FBC8F',group:'green'},{name:'DarkTurquoise',hex:'#00CED1',group:'blue'},
  {name:'DarkViolet',hex:'#9400D3',group:'purple'},{name:'DeepPink',hex:'#FF1493',group:'pink'},
  {name:'DeepSkyBlue',hex:'#00BFFF',group:'blue'},{name:'DimGray',hex:'#696969',group:'gray'},
  {name:'DodgerBlue',hex:'#1E90FF',group:'blue'},{name:'FireBrick',hex:'#B22222',group:'red'},
  {name:'ForestGreen',hex:'#228B22',group:'green'},{name:'Fuchsia',hex:'#FF00FF',group:'pink'},
  {name:'Gold',hex:'#FFD700',group:'yellow'},{name:'Gray',hex:'#808080',group:'gray'},
  {name:'Green',hex:'#008000',group:'green'},{name:'HotPink',hex:'#FF69B4',group:'pink'},
  {name:'IndianRed',hex:'#CD5C5C',group:'red'},{name:'Indigo',hex:'#4B0082',group:'purple'},
  {name:'Ivory',hex:'#FFFFF0',group:'white'},{name:'Khaki',hex:'#F0E68C',group:'yellow'},
  {name:'LavenderBlush',hex:'#FFF0F5',group:'purple'},{name:'LawnGreen',hex:'#7CFC00',group:'green'},
  {name:'LightBlue',hex:'#ADD8E6',group:'blue'},{name:'LightCoral',hex:'#F08080',group:'red'},
  {name:'LightGray',hex:'#D3D3D3',group:'gray'},{name:'LightGreen',hex:'#90EE90',group:'green'},
  {name:'LightPink',hex:'#FFB6C1',group:'pink'},{name:'LightYellow',hex:'#FFFFE0',group:'yellow'},
  {name:'Lime',hex:'#00FF00',group:'green'},{name:'Magenta',hex:'#FF00FF',group:'pink'},
  {name:'Maroon',hex:'#800000',group:'red'},{name:'MediumBlue',hex:'#0000CD',group:'blue'},
  {name:'MediumOrchid',hex:'#BA55D3',group:'purple'},{name:'MediumPurple',hex:'#9370DB',group:'purple'},
  {name:'MediumSeaGreen',hex:'#3CB371',group:'green'},{name:'MidnightBlue',hex:'#191970',group:'blue'},
  {name:'MintCream',hex:'#F5FFFA',group:'green'},{name:'MistyRose',hex:'#FFE4E1',group:'pink'},
  {name:'Navy',hex:'#000080',group:'blue'},{name:'OldLace',hex:'#FDF5E6',group:'white'},
  {name:'Olive',hex:'#808000',group:'yellow'},{name:'OliveDrab',hex:'#6B8E23',group:'green'},
  {name:'Orange',hex:'#FFA500',group:'orange'},{name:'OrangeRed',hex:'#FF4500',group:'orange'},
  {name:'Orchid',hex:'#DA70D6',group:'purple'},{name:'PaleGoldenRod',hex:'#EEE8AA',group:'yellow'},
  {name:'PaleGreen',hex:'#98FB98',group:'green'},{name:'PaleTurquoise',hex:'#AFEEEE',group:'blue'},
  {name:'PaleVioletRed',hex:'#DB7093',group:'pink'},{name:'PeachPuff',hex:'#FFDAB9',group:'orange'},
  {name:'Peru',hex:'#CD853F',group:'orange'},{name:'Pink',hex:'#FFC0CB',group:'pink'},
  {name:'Plum',hex:'#DDA0DD',group:'purple'},{name:'PowderBlue',hex:'#B0E0E6',group:'blue'},
  {name:'Purple',hex:'#800080',group:'purple'},{name:'RebeccaPurple',hex:'#663399',group:'purple'},
  {name:'Red',hex:'#FF0000',group:'red'},{name:'RosyBrown',hex:'#BC8F8F',group:'red'},
  {name:'RoyalBlue',hex:'#4169E1',group:'blue'},{name:'SaddleBrown',hex:'#8B4513',group:'orange'},
  {name:'Salmon',hex:'#FA8072',group:'red'},{name:'SandyBrown',hex:'#F4A460',group:'orange'},
  {name:'SeaGreen',hex:'#2E8B57',group:'green'},{name:'Sienna',hex:'#A0522D',group:'orange'},
  {name:'Silver',hex:'#C0C0C0',group:'gray'},{name:'SkyBlue',hex:'#87CEEB',group:'blue'},
  {name:'SlateBlue',hex:'#6A5ACD',group:'purple'},{name:'SlateGray',hex:'#708090',group:'gray'},
  {name:'Snow',hex:'#FFFAFA',group:'white'},{name:'SpringGreen',hex:'#00FF7F',group:'green'},
  {name:'SteelBlue',hex:'#4682B4',group:'blue'},{name:'Tan',hex:'#D2B48C',group:'orange'},
  {name:'Teal',hex:'#008080',group:'blue'},{name:'Thistle',hex:'#D8BFD8',group:'purple'},
  {name:'Tomato',hex:'#FF6347',group:'red'},{name:'Turquoise',hex:'#40E0D0',group:'blue'},
  {name:'Violet',hex:'#EE82EE',group:'purple'},{name:'Wheat',hex:'#F5DEB3',group:'yellow'},
  {name:'White',hex:'#FFFFFF',group:'white'},{name:'WhiteSmoke',hex:'#F5F5F5',group:'white'},
  {name:'Yellow',hex:'#FFFF00',group:'yellow'},{name:'YellowGreen',hex:'#9ACD32',group:'green'},
]
const GROUPS=['all','red','pink','orange','yellow','green','blue','purple','gray','white']
function isLight(hex:string):boolean{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return(0.299*r+0.587*g+0.114*b)>160}
export default function HtmlColorCodesPage() {
  const [search,setSearch]=useState('')
  const [group,setGroup]=useState('all')
  const [copied,setCopied]=useState('')
  const filtered=COLORS.filter(c=>(group==='all'||c.group===group)&&(c.name.toLowerCase().includes(search.toLowerCase())||c.hex.toLowerCase().includes(search.toLowerCase())))
  const copy=(h:string)=>{navigator.clipboard.writeText(h);setCopied(h);setTimeout(()=>setCopied(''),1200)}
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search color name or hex..." className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"/>
        <div className="flex flex-wrap gap-1.5">
          {GROUPS.map(g=>(
            <button key={g} onClick={()=>setGroup(g)}
              className={'px-3 py-1 rounded-full text-xs font-medium capitalize transition border '+(group===g?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:bg-gray-50 text-gray-600')}>
              {g}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {filtered.map(c=>(
            <button key={c.name+c.hex} onClick={()=>copy(c.hex)}
              className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition text-left">
              <div className="h-12" style={{background:c.hex}}/>
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-gray-800 truncate">{c.name}</p>
                <p className="text-xs font-mono text-gray-500">{copied===c.hex?'Copied!':c.hex}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">{filtered.length} colors shown</p>
      </div>
    </ToolLayout>
  )
}