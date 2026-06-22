'use client';
import { useState, useRef, useCallback } from 'react';
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'

function hexToRgb(hex: string){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return {r,g,b};
}
function rgbToHsl(r:number,g:number,b:number){
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h=0,s=0,l=(max+min)/2;
  if(max!==min){
    const d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}
    h/=6;
  }
  return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
}

interface ColorEntry { hex:string; x:number; y:number; label:string; }


const tool = getToolBySlug('image-color-picker')!

export default function ImageColorPickerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [hoverColor, setHoverColor] = useState<string|null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState<string|null>(null);

  const loadImage = useCallback((file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current!;
      const maxW = 600, maxH = 400;
      const ratio = Math.min(maxW/img.width, maxH/img.height, 1);
      canvas.width = Math.round(img.width*ratio);
      canvas.height = Math.round(img.height*ratio);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageLoaded(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const getColorAt = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width/rect.width, scaleY = canvas.height/rect.height;
    const x = Math.round((e.clientX-rect.left)*scaleX);
    const y = Math.round((e.clientY-rect.top)*scaleY);
    const ctx = canvas.getContext('2d')!;
    const [r,g,b] = ctx.getImageData(x,y,1,1).data;
    const hex = '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
    return {hex,x,y};
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(()=>setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Color Picker</h1>
          <p className="text-gray-600">Upload an image and click anywhere to pick colors</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              {!imageLoaded && (
                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-gray-600 font-medium">Click to upload an image</p>
                  <p className="text-gray-400 text-sm mt-1">PNG, JPG, WebP supported</p>
                  <input type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0]&&loadImage(e.target.files[0])} />
                </label>
              )}
              <canvas
                ref={canvasRef}
                className={imageLoaded?'w-full rounded-lg cursor-crosshair':'hidden'}
                onMouseMove={e=>{if(imageLoaded){const {hex}=getColorAt(e);setHoverColor(hex);}}}
                onMouseLeave={()=>setHoverColor(null)}
                onClick={e=>{
                  if(!imageLoaded) return;
                  const {hex,x,y}=getColorAt(e);
                  const label='Color '+(colors.length+1);
                  setColors(c=>[...c,{hex,x,y,label}].slice(-12));
                }}
              />
              {imageLoaded && (
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {hoverColor && <><div className="w-5 h-5 rounded border border-gray-300" style={{background:hoverColor}}/><span className="font-mono">{hoverColor}</span></>}
                  </div>
                  <button onClick={()=>{setImageLoaded(false);setColors([]);const canvas=canvasRef.current!;canvas.getContext('2d')!.clearRect(0,0,canvas.width,canvas.height);}}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors">Change Image</button>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Picked Colors</h3>
              {colors.length>0&&<button onClick={()=>setColors([])} className="text-xs text-gray-400 hover:text-red-400">Clear all</button>}
            </div>
            {colors.length===0?(
              <div className="text-center py-8 text-gray-400 text-sm">Click on the image to pick colors</div>
            ):(
              <div className="space-y-2 overflow-y-auto max-h-96">
                {[...colors].reverse().map((c,i)=>{
                  const {r,g,b}=hexToRgb(c.hex);
                  const {h,s,l}=rgbToHsl(r,g,b);
                  return (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="w-10 h-10 rounded flex-shrink-0 border border-gray-200" style={{background:c.hex}}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-1 flex-wrap">
                          {[c.hex,`rgb(${r},${g},${b})`,`hsl(${h},${s}%,${l}%)`].map(v=>(
                            <button key={v} onClick={()=>copyToClipboard(v)}
                              className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors ${copied===v?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                              {copied===v?'Copied!':v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <strong>Tip:</strong> Click anywhere on the image to add colors to your palette. Copy as HEX, RGB, or HSL with one click.
        </div>
      </div>
    </div>
  );
}