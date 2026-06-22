'use client'
import { useState, useRef } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed } from '@/lib/gtag'

const tool = getToolBySlug('json-schema-validator')!

type JsonVal = string | number | boolean | null | JsonVal[] | { [k: string]: JsonVal }

function validateAgainstSchema(data: JsonVal, schema: Record<string,JsonVal>, path = ''): string[] {
  const errors: string[] = []
  const p = path || 'root'
  
  if (schema.type) {
    const expected = schema.type as string
    const actual = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data
    if (expected === 'integer') {
      if (typeof data !== 'number' || !Number.isInteger(data)) errors.push(p + ': expected integer, got ' + actual)
    } else if (actual !== expected) {
      errors.push(p + ': expected ' + expected + ', got ' + actual)
    }
  }
  
  if (schema.required && Array.isArray(schema.required) && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const obj = data as Record<string,JsonVal>
    for (const req of schema.required as string[]) {
      if (!(req in obj)) errors.push(p + '.' + req + ': required field missing')
    }
  }
  
  if (schema.properties && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const props = schema.properties as Record<string,JsonVal>
    const obj = data as Record<string,JsonVal>
    for (const [k,v] of Object.entries(props)) {
      if (k in obj) errors.push(...validateAgainstSchema(obj[k], v as Record<string,JsonVal>, p+'.'+k))
    }
  }
  
  if (schema.minimum !== undefined && typeof data === 'number') {
    if (data < (schema.minimum as number)) errors.push(p + ': ' + data + ' < minimum ' + schema.minimum)
  }
  if (schema.maximum !== undefined && typeof data === 'number') {
    if (data > (schema.maximum as number)) errors.push(p + ': ' + data + ' > maximum ' + schema.maximum)
  }
  if (schema.minLength !== undefined && typeof data === 'string') {
    if (data.length < (schema.minLength as number)) errors.push(p + ': string length ' + data.length + ' < minLength ' + schema.minLength)
  }
  if (schema.maxLength !== undefined && typeof data === 'string') {
    if (data.length > (schema.maxLength as number)) errors.push(p + ': string length ' + data.length + ' > maxLength ' + schema.maxLength)
  }
  if (schema.enum && Array.isArray(schema.enum)) {
    if (!(schema.enum as JsonVal[]).some(e=>JSON.stringify(e)===JSON.stringify(data))) {
      errors.push(p + ': value not in enum ' + JSON.stringify(schema.enum))
    }
  }
  
  return errors
}

const SAMPLE_SCHEMA = JSON.stringify({
  type: 'object',
  required: ['name','age','email'],
  properties: {
    name: { type: 'string', minLength: 2 },
    age: { type: 'integer', minimum: 0, maximum: 150 },
    email: { type: 'string' },
    role: { type: 'string', enum: ['admin','user','guest'] }
  }
}, null, 2)

const SAMPLE_DATA = JSON.stringify({
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
  role: 'admin'
}, null, 2)

export default function JsonSchemaValidatorPage({ params }: { params: { lang: string } }) {
  const [schema, setSchema] = useState(SAMPLE_SCHEMA)
  const [data, setData] = useState(SAMPLE_DATA)
  const [errors, setErrors] = useState<string[]|null>(null)
  const [parseErr, setParseErr] = useState<{schema?:string,data?:string}>({})
  const tracked = useRef(false)

  function validate() {
    if (!tracked.current) { trackToolUsed('json-schema-validator'); tracked.current = true }
    const errs: {schema?:string,data?:string} = {}
    let parsedSchema: Record<string,JsonVal>, parsedData: JsonVal
    try { parsedSchema = JSON.parse(schema) } catch(e:unknown) { errs.schema = e instanceof Error ? e.message : 'Invalid JSON'; setParseErr(errs); return }
    try { parsedData = JSON.parse(data) } catch(e:unknown) { errs.data = e instanceof Error ? e.message : 'Invalid JSON'; setParseErr(errs); return }
    setParseErr({})
    setErrors(validateAgainstSchema(parsedData, parsedSchema))
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">JSON Schema</label>
            <textarea value={schema} onChange={e=>setSchema(e.target.value)} rows={10}
              className={'w-full px-3 py-3 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (parseErr.schema?'border-red-300':'border-gray-200')} />
            {parseErr.schema && <p className="text-xs text-red-600 mt-0.5">{parseErr.schema}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">JSON Data</label>
            <textarea value={data} onChange={e=>setData(e.target.value)} rows={10}
              className={'w-full px-3 py-3 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none ' + (parseErr.data?'border-red-300':'border-gray-200')} />
            {parseErr.data && <p className="text-xs text-red-600 mt-0.5">{parseErr.data}</p>}
          </div>
        </div>
        <button onClick={validate} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors">Validate</button>
        {errors !== null && (
          errors.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium">\u2713 Data is valid against the schema.</div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-600">{errors.length} validation error{errors.length>1?'s':''}:</p>
              {errors.map((e,i)=>(
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-mono">{e}</div>
              ))}
            </div>
          )
        )}
      </div>
    </ToolLayout>
  )
}
