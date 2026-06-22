export type ToolCategory = 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'developer' | 'file' | 'utility'
export type Phase = 1 | 2 | 3

export interface ToolMeta {
  slug: string
  category: ToolCategory
  isPro: boolean
  isNew: boolean
  phase: Phase
  tags: string[]
  acceptedFileTypes?: string[]
  maxFileSizeMB: { free: number; pro: number }
}

export const TOOLS: ToolMeta[] = [
  // PDF
  { slug: 'pdf-merge', category: 'pdf', isPro: false, isNew: true, phase: 1, tags: ['pdf','merge','combine'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-split', category: 'pdf', isPro: false, isNew: true, phase: 1, tags: ['pdf','split','extract'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-compress', category: 'pdf', isPro: false, isNew: true, phase: 1, tags: ['pdf','compress','reduce'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-to-word', category: 'pdf', isPro: false, isNew: true, phase: 1, tags: ['pdf','word','docx','convert'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-to-jpg', category: 'pdf', isPro: false, isNew: true, phase: 1, tags: ['pdf','jpg','image','convert'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'word-to-pdf', category: 'pdf', isPro: false, isNew: true, phase: 1, tags: ['word','docx','pdf','convert'], acceptedFileTypes: ['.doc','.docx'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'jpg-to-pdf', category: 'pdf', isPro: false, isNew: true, phase: 1, tags: ['jpg','image','pdf','convert'], acceptedFileTypes: ['.jpg','.jpeg','.png'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-to-text', category: 'pdf', isPro: false, isNew: true, phase: 1, tags: ['pdf','text','extract','ocr'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-rotate', category: 'pdf', isPro: false, isNew: false, phase: 2, tags: ['pdf','rotate'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-unlock', category: 'pdf', isPro: false, isNew: false, phase: 2, tags: ['pdf','unlock'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-protect', category: 'pdf', isPro: false, isNew: false, phase: 2, tags: ['pdf','protect'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-watermark', category: 'pdf', isPro: false, isNew: false, phase: 2, tags: ['pdf','watermark'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-ocr', category: 'pdf', isPro: true, isNew: false, phase: 2, tags: ['pdf','ocr','text'], acceptedFileTypes: ['.pdf'], maxFileSizeMB: { free: 0, pro: 100 } },
  // IMAGE
  { slug: 'image-resizer', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['image','resize','dimension'], acceptedFileTypes: ['.jpg','.jpeg','.png','.webp','.gif'], maxFileSizeMB: { free: 10, pro: 100 }
  { slug: 'image-color-picker', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['image','color','picker','hex','rgb'], acceptedFileTypes: ['.jpg','.jpeg','.png','.webp','.gif'], maxFileSizeMB: { free: 10, pro: 100 } }, },
  { slug: 'image-compress', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['image','compress','reduce'], acceptedFileTypes: ['.jpg','.jpeg','.png','.webp'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'jpg-to-png', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['jpg','png','convert'], acceptedFileTypes: ['.jpg','.jpeg'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'png-to-jpg', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['png','jpg','convert'], acceptedFileTypes: ['.png'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'webp-converter', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['webp','convert','image'], acceptedFileTypes: ['.jpg','.jpeg','.png'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'svg-to-png', category: 'image', isPro: false, isNew: false, phase: 1, tags: ['svg','png','convert'], acceptedFileTypes: ['.svg'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'image-crop', category: 'image', isPro: false, isNew: false, phase: 1, tags: ['image','crop','cut'], acceptedFileTypes: ['.jpg','.jpeg','.png','.webp'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'image-base64-converter', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['image','base64','encode'], acceptedFileTypes: ['.jpg','.jpeg','.png','.gif','.webp'], maxFileSizeMB: { free: 5, pro: 20 } },
  { slug: 'color-blindness-simulator', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['color','blindness','simulate','accessibility'], acceptedFileTypes: ['.jpg','.jpeg','.png'], maxFileSizeMB: { free: 5, pro: 20 } },
  { slug: 'color-palette-extractor', category: 'image', isPro: false, isNew: true, phase: 1, tags: ['color','palette','extract','image'], acceptedFileTypes: ['.jpg','.jpeg','.png'], maxFileSizeMB: { free: 5, pro: 20 } },
  { slug: 'heic-to-jpg', category: 'image', isPro: false, isNew: false, phase: 2, tags: ['heic','jpg','iphone','convert'], acceptedFileTypes: ['.heic'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'ocr-extractor', category: 'image', isPro: true, isNew: false, phase: 2, tags: ['ocr','text','extract'], acceptedFileTypes: ['.jpg','.jpeg','.png','.pdf'], maxFileSizeMB: { free: 0, pro: 50 } },
  { slug: 'background-remover', category: 'image', isPro: true, isNew: false, phase: 3, tags: ['background','remove','ai'], acceptedFileTypes: ['.jpg','.jpeg','.png'], maxFileSizeMB: { free: 0, pro: 50 } },
  // VIDEO
  { slug: 'video-to-mp3', category: 'video', isPro: false, isNew: true, phase: 1, tags: ['video','mp3','audio','extract'], acceptedFileTypes: ['.mp4','.mov','.avi','.mkv'], maxFileSizeMB: { free: 50, pro: 500 } },
  { slug: 'video-trimmer', category: 'video', isPro: false, isNew: false, phase: 2, tags: ['video','trim','cut'], acceptedFileTypes: ['.mp4','.mov'], maxFileSizeMB: { free: 50, pro: 500 } },
  { slug: 'video-compressor', category: 'video', isPro: false, isNew: false, phase: 2, tags: ['video','compress','reduce'], acceptedFileTypes: ['.mp4','.mov'], maxFileSizeMB: { free: 50, pro: 500 } },
  { slug: 'mp4-to-gif', category: 'video', isPro: false, isNew: false, phase: 2, tags: ['mp4','gif','convert'], acceptedFileTypes: ['.mp4'], maxFileSizeMB: { free: 20, pro: 200 } },
  // TEXT
  { slug: 'text-compare', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','compare','diff'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'word-counter', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['word','count','text'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'text-case-converter', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','case','upper','lower'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'lorem-ipsum-generator', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['lorem','ipsum','placeholder'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'ascii-art-generator', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['ascii','art','text','generate'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'speech-to-text', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['speech','voice','text','transcribe'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'text-counter-advanced', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','counter','words','chars','stats'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'markdown-table-generator', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['markdown','table','generate'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'text-rotate', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','rotate','flip','mirror'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'text-reverser', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','reverse','flip'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'text-repeater', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','repeat','duplicate'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'text-truncator', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','truncate','shorten'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'text-padder', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','pad','align','format'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'text-to-slug', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','slug','url','convert'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'slug-to-title', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['slug','title','text','convert'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'camel-case-converter', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['camel','case','text','convert'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'character-counter', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['character','count','text'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'string-length-counter', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['string','length','count','text'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'whitespace-remover', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['whitespace','trim','clean','text'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'line-sort', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['line','sort','alphabetical','text'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'list-deduplicator', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['list','deduplicate','unique','remove'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'column-extractor', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['column','extract','text','csv'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'text-line-numberer', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','line','number','format'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'text-sort-by-length', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','sort','length','line'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'text-diff-inline', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','diff','compare','inline'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'text-statistics', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['text','statistics','analyze','count'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'word-frequency', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['word','frequency','count','analyze'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'word-wrap', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['word','wrap','format','text'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'reading-level-analyzer', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['reading','level','analyze','text'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'html-to-markdown', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['html','markdown','convert'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'morse-code-converter', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['morse','code','convert','text'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'morse-code-translator', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['morse','code','translate','audio'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'diff-checker', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['diff','check','compare','text'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'roman-numeral-converter', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['roman','numeral','convert'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'markdown-preview', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['markdown','preview','render'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'markdown-to-html', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['markdown','html','convert','render'], maxFileSizeMB: { free: 1, pro: 10 }
  { slug: 'word-cloud-generator', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['word','cloud','frequency','visualize'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'html-tag-stripper', category: 'text', isPro: false, isNew: true, phase: 1, tags: ['html','strip','text','extract'], maxFileSizeMB: { free: 1, pro: 10 } }, },
  { slug: 'markdown-editor', category: 'text', isPro: false, isNew: false, phase: 2, tags: ['markdown','editor','preview'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'regex-tester', category: 'text', isPro: false, isNew: false, phase: 1, tags: ['regex','regexp','test'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'ai-text-summarizer', category: 'text', isPro: true, isNew: false, phase: 3, tags: ['ai','summarize','text'], maxFileSizeMB: { free: 0, pro: 10 } },
  { slug: 'ai-translator', category: 'text', isPro: true, isNew: false, phase: 3, tags: ['ai','translate','language'], maxFileSizeMB: { free: 0, pro: 10 } },
  // DEVELOPER
  { slug: 'json-formatter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','format','beautify'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'json-validator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','validate','check'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'base64-encoder', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['base64','encode'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'base64-decoder', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['base64','decode'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'url-encoder', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['url','encode','percent'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'url-decoder', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['url','decode'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'hash-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['hash','md5','sha','crypto'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'uuid-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['uuid','guid','generate'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'color-converter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['color','hex','rgb','hsl'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'base64-url-encoder', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['base64','url','encode','safe'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'number-converter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['number','binary','hex','octal','convert'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'number-base-converter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['number','base','convert','radix'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'binary-text-converter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['binary','text','convert','encode'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'uuid-bulk-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['uuid','bulk','generate','v4'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'json-to-yaml', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','yaml','convert'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'json-beautifier', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','beautify','format','pretty'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'json-minifier', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','minify','compress'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'json-diff', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','diff','compare'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'json-to-typescript', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','typescript','interface','generate'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'json-path-tester', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','path','jsonpath','query'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'json-schema-validator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','schema','validate'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'xml-formatter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['xml','format','beautify'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'yaml-validator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['yaml','validate','check'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'html-previewer', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['html','preview','render','sandbox'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'html-minifier', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['html','minify','compress'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'html-formatter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['html','format','beautify'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'html-entity-encoder', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['html','entity','encode','escape'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'html-entity-converter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['html','entity','convert','decode'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'html-color-picker', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['html','color','picker','hex','rgb'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'css-flexbox-playground', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['css','flexbox','playground','layout'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'css-animation-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['css','animation','generate','keyframe'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'css-box-model-visualizer', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['css','box','model','visualize','margin'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'css-box-shadow-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['css','box','shadow','generate'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'css-gradient-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['css','gradient','generate','color'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'css-unit-converter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['css','unit','convert','px','rem','em'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'open-graph-preview', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['opengraph','og','preview','meta','social'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'keyboard-shortcut-tester', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['keyboard','shortcut','test','key'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'regex-library', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['regex','library','pattern','reference'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'color-codes-converter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['color','codes','hex','rgb','hsl','convert'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'color-gradient-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['color','gradient','generate','css'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'color-mixer', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['color','mix','blend','combine'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'color-scheme-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['color','scheme','palette','design'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'url-parser', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['url','parse','analyze','query'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'ip-address-info', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['ip','address','info','lookup'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'epoch-converter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['epoch','timestamp','unix','convert'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'unix-timestamp', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['unix','timestamp','epoch','convert'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'cron-expression-builder', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['cron','expression','build','schedule'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'curl-builder', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['curl','http','request','build'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'git-cheat-sheet', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['git','cheat','sheet','reference'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'chmod-calculator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['chmod','permission','unix','linux'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'bracket-matcher', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['bracket','match','check','balance'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'hex-dump-viewer', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['hex','dump','view','binary'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'ini-parser', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['ini','parse','config','format'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'mime-type-checker', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['mime','type','check','file'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'svg-viewer', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['svg','view','preview'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'table-generator', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['table','generate','html','markdown'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'sql-formatter', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['sql','format','beautify','query'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'text-encryptor', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['text','encrypt','decrypt','cipher'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'pixel-ruler', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['pixel','ruler','measure','screen'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'color-contrast-checker', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['color','contrast','wcag','accessibility'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'json-to-xml', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['json','xml','convert'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'text-to-binary', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['text','binary','hex','octal','convert'], maxFileSizeMB: { free: 0, pro: 0 }
  { slug: 'caesar-cipher', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['caesar','cipher','encrypt','decrypt','rot13'], maxFileSizeMB: { free: 0, pro: 0 } }, },
  { slug: 'jwt-decoder', category: 'developer', isPro: false, isNew: false, phase: 1, tags: ['jwt','token','decode'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'yaml-to-json', category: 'developer', isPro: false, isNew: false, phase: 1, tags: ['yaml','json','convert'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'css-minifier', category: 'developer', isPro: false, isNew: false, phase: 1, tags: ['css','minify','compress'], maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'cron-expression-parser', category: 'developer', isPro: false, isNew: false, phase: 1, tags: ['cron','schedule','parse'], maxFileSizeMB: { free: 0, pro: 0 } },
  // FILE
  { slug: 'csv-to-json', category: 'file', isPro: false, isNew: true, phase: 1, tags: ['csv','json','convert','data'], acceptedFileTypes: ['.csv'], maxFileSizeMB: { free: 5, pro: 50 } },
  { slug: 'json-to-csv', category: 'file', isPro: false, isNew: true, phase: 1, tags: ['json','csv','convert','data'], maxFileSizeMB: { free: 5, pro: 50 } },
  { slug: 'csv-viewer', category: 'file', isPro: false, isNew: true, phase: 1, tags: ['csv','view','table','data'], acceptedFileTypes: ['.csv'], maxFileSizeMB: { free: 5, pro: 50 } },
  { slug: 'hwp-converter', category: 'file', isPro: false, isNew: true, phase: 1, tags: ['hwp','odt','txt','convert'], acceptedFileTypes: ['.hwp'], maxFileSizeMB: { free: 20, pro: 50 } },
  { slug: 'checksum-generator', category: 'file', isPro: false, isNew: false, phase: 1, tags: ['checksum','md5','sha','verify'], maxFileSizeMB: { free: 50, pro: 500 } },
  { slug: 'zip-extractor', category: 'file', isPro: false, isNew: false, phase: 2, tags: ['zip','extract','decompress'], acceptedFileTypes: ['.zip'], maxFileSizeMB: { free: 20, pro: 200 } },
  { slug: 'zip-creator', category: 'file', isPro: false, isNew: false, phase: 2, tags: ['zip','compress','archive'], maxFileSizeMB: { free: 20, pro: 200 } },
  // UTILITY
  { slug: 'qr-generator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['qr','qrcode','generate'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'password-generator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['password','generate','secure'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'unit-converter', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['unit','convert','measurement'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'bmi-calculator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['bmi','calculator','health','weight'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'tip-calculator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['tip','calculator','split','bill'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'age-calculator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['age','calculator','birthday','date'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'loan-calculator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['loan','calculator','interest','mortgage'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'currency-converter', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['currency','convert','exchange','rate'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'percentage-calculator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['percentage','calculator','percent','math'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'pomodoro-timer', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['pomodoro','timer','focus','productivity'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'stopwatch-timer', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['stopwatch','timer','lap','time'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'stopwatch', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['stopwatch','timer','time','measure'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'countdown-timer', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['countdown','timer','deadline','event'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'habit-tracker', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['habit','tracker','streak','daily'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'typing-speed-test', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['typing','speed','wpm','test'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'random-quote-generator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['random','quote','generate','inspire'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'random-number-generator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['random','number','generate','dice'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'font-pairing-tool', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['font','pairing','google','design'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'aspect-ratio-calculator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['aspect','ratio','calculator','resize'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'date-calculator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['date','calculator','difference','days'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'temperature-converter', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['temperature','convert','celsius','fahrenheit'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'number-formatter', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['number','format','thousand','separator'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'number-to-words', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['number','words','convert','spell'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'number-sequence-generator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['number','sequence','generate','list'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'timezone-converter', category: 'utility', isPro: false, isNew: false, phase: 1, tags: ['timezone','convert','time'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'color-palette-generator', category: 'utility', isPro: false, isNew: false, phase: 1, tags: ['color','palette','design'], maxFileSizeMB: { free: 0, pro: 0 } },
  { slug: 'prime-number-checker', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['prime','number','check','math'], maxFileSizeMB: { free: 0, pro: 0 }
  { slug: 'number-palindrome', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['palindrome','number','math','reverse'], maxFileSizeMB: { free: 0, pro: 0 } }, },
  { slug: 'qr-reader', category: 'utility', isPro: false, isNew: false, phase: 2, tags: ['qr','scan','read','decode'], acceptedFileTypes: ['.jpg','.jpeg','.png'], maxFileSizeMB: { free: 5, pro: 20 } },
  { slug: 'barcode-generator', category: 'utility', isPro: false, isNew: false, phase: 2, tags: ['barcode','generate','ean'], maxFileSizeMB: { free: 0, pro: 0 } },
]

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function getToolsByCategory(category: ToolCategory): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category)
}

export function getToolsByPhase(phase: Phase): ToolMeta[] {
  return TOOLS.filter((t) => t.phase === phase)
}

export function getAllTools(): ToolMeta[] {
  return TOOLS
}

export const CATEGORY_META: Record<ToolCategory, { label: string; icon: string; color: string }> = {
  pdf:       { label: 'PDF',       icon: '📄', color: 'red'    },
  image:     { label: 'Image',     icon: '🖼', color: 'purple' },
  video:     { label: 'Video',     icon: '🎬', color: 'pink'   },
  audio:     { label: 'Audio',     icon: '🔊', color: 'yellow' },
  text:      { label: 'Text',      icon: '📝', color: 'green'  },
  developer: { label: 'Developer', icon: '💻', color: 'blue'   },
  file:      { label: 'File',      icon: '📁', color: 'orange' },
  utility:   { label: 'Utility',   icon: '🔧', color: 'teal'   },
}