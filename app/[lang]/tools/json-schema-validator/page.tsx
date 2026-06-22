'use client'
import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
const tool = getToolBySlug('json-schema-validator')!
type SchemaType='string'|'number'|'integer'|'boolean'|'array'|'object'|'null'
function validateValue(value:unknown,schema:Record<string,unknown>,path='root'):{valid:boolean;errors:string[]}{
  const errors:string[]=[]
  const type=schema.type as SchemaType|undefined
  if(type){
    const actualType=Array.isArray(value)?'array':value===null?'null':typeof value
    const expected=Array.isArray(type)?type:[type]
    const match=expected.some(t=>t===actualType||(t==='integer'&&typeof value==='number'&&Number.isInteger(value)))
    if(!match)errors.push(path+': expected type "'+JSON.stringify(type)+'", got "'+actualType+'"')
  }
  if(schema.required&&typeof value==='object'&&value!==null&&!Array.isArray(value)){
    for(const req of schema.required as string[]){
      if(!(req in (value as Record<string,unknown>)))errors.push(path+': missing required property "'+req+'"')
    }
  }
  if(schema.properties&&typeof value==='object'&&value!==null&&!Array.isArray(value)){
    for(const [k,subSchema] of Object.entries(schema.properties as Record<string,unknown>)){
      const v=(value as Record<string,unknown>)[k]
      if(v!==undefined){const sub=validateValue(v,subSchema as Record<string,unknown>,path+'.'+k);errors.push(...sub.errors)}
    }
  }
  if(schema.minimum!==undefined&&typeof value==='number'&&value<(schema.minimum as number))errors.push(path+': '+value+' < minimum '+schema.minimum)
  if(schema.maximum!==undefined&&typeof value==='number'&&value>(schema.maximum as number))errors.push(path+': '+value+' > maximum '+schema.maximum)
  if(schema.minLength!==undefined&&typeof value==='string'&&value.length<(schema.minLength as number))errors.push(path+': length '+value.length+' < minLength '+schema.minLength)
  if(schema.maxLength!==undefined&&typeof value==='string'&&value.length>(schema.maxLength as number))errors.push(path+': length '+value.length+' > maxLength '+schema.maxLength)
  if(schema.enum!==undefined&&!(schema.enum as unknown[]).includes(value))errors.push(path+': not in enum '+JSON.stringify(schema.enum))
  return{valid:errors.length===0,errors}
}
const SAMPLE_SCHEMA=JSON.stringify({type:'object',required:['name','age','email'],properties:{name:{type:'string',minLength:2},age:{type:'integer',minimum:0,maximum:120},email:{type:'string'},active:{type:'boolean'}}},null,2)
const SAMPLE_DATA=JSON.stringify({name:'Alice',age:30,email:'alice@example.com',active:true},null,2)
export default function JsonSchemaValidatorPage() {
  const [schema,setSchema]=useState(SAMPLE_SCHEMA)
  const [data,setData]=useState(SAMPLE_DATA)
  const [tried,setTried]=useState(false)
  const validate=()=>{
    try{const s=JSON.parse(schema);const d=JSON.parse(data);return validateValue(d,s)}
    catch(e){return{valid:false,errors:['Parse error: '+String(e)]}}
  }
  const result=validate()
  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto px-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">JSON Schema</label>
            <textarea value={schema} onChange={e=>setSchema(e.target.value)} rows={12}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">JSON Data</label>
            <textarea value={data} onChange={e=>setData(e.target.value)} rows={12}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-xs resize-none focus:outline-none focus:border-blue-400"/></div>
        </div>
        <div className={'rounded-xl p-4 border '+(result.valid?'bg-green-50 border-green-200':'bg-red-50 border-red-200')}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{result.valid?'✅':'❌'}</span>
            <p className={'font-bold text-lg '+(result.valid?'text-green-700':'text-red-700')}>{result.valid?'Valid!':'Invalid'}</p>
          </div>
          {result.errors.length>0&&(
            <ul className="space-y-1">
              {result.errors.map((e,i)=><li key={i} className="text-xs text-red-600 font-mono">{e}</li>)}
            </ul>
          )}
        </div>
        <p className="text-xs text-gray-400 text-center">Supports: type, required, properties, minimum, maximum, minLength, maxLength, enum</p>
      </div>
    </ToolLayout>
  )
}