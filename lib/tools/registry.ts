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
  // ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ PDF ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
  { slug: 'pdf-merge',          category: 'pdf',       isPro: false, isNew: true,  phase: 1, tags: ['pdf','merge','combine'],           acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-split',          category: 'pdf',       isPro: false, isNew: true,  phase: 1, tags: ['pdf','split','extract'],           acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-compress',       category: 'pdf',       isPro: false, isNew: true,  phase: 1, tags: ['pdf','compress','reduce'],         acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-to-word',        category: 'pdf',       isPro: false, isNew: true,  phase: 1, tags: ['pdf','word','docx','convert'],     acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-to-jpg',         category: 'pdf',       isPro: false, isNew: true,  phase: 1, tags: ['pdf','jpg','image','convert'],     acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'word-to-pdf',        category: 'pdf',       isPro: false, isNew: true,  phase: 1, tags: ['word','docx','pdf','convert'],     acceptedFileTypes: ['.doc','.docx'],            maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'jpg-to-pdf',         category: 'pdf',       isPro: false, isNew: true,  phase: 1, tags: ['jpg','image','pdf','convert'],     acceptedFileTypes: ['.jpg','.jpeg','.png'],     maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-to-text',        category: 'pdf',       isPro: false, isNew: true,  phase: 3, tags: ['pdf','text','extract','convert'],  acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-rotate',         category: 'pdf',       isPro: false, isNew: false, phase: 2, tags: ['pdf','rotate'],                   acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-unlock',         category: 'pdf',       isPro: false, isNew: false, phase: 2, tags: ['pdf','unlock','password'],        acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-protect',        category: 'pdf',       isPro: false, isNew: false, phase: 2, tags: ['pdf','protect','password'],       acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-watermark',      category: 'pdf',       isPro: false, isNew: false, phase: 2, tags: ['pdf','watermark'],                acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'pdf-ocr',            category: 'pdf',       isPro: true,  isNew: false, phase: 2, tags: ['pdf','ocr','extract','text'],     acceptedFileTypes: ['.pdf'],                    maxFileSizeMB: { free: 0,  pro: 100 } },
  // ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ IMAGE ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
  { slug: 'image-resizer',      category: 'image',     isPro: false, isNew: true,  phase: 1, tags: ['image','resize','dimension'],     acceptedFileTypes: ['.jpg','.jpeg','.png','.webp','.gif'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'image-compress',     category: 'image',     isPro: false, isNew: true,  phase: 1, tags: ['image','compress','reduce'],      acceptedFileTypes: ['.jpg','.jpeg','.png','.webp'],        maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'jpg-to-png',         category: 'image',     isPro: false, isNew: true,  phase: 1, tags: ['jpg','png','convert'],            acceptedFileTypes: ['.jpg','.jpeg'],            maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'png-to-jpg',         category: 'image',     isPro: false, isNew: true,  phase: 1, tags: ['png','jpg','convert'],            acceptedFileTypes: ['.png'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'webp-converter',     category: 'image',     isPro: false, isNew: true,  phase: 1, tags: ['webp','convert','image'],         acceptedFileTypes: ['.jpg','.jpeg','.png'],     maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'heic-to-jpg',        category: 'image',     isPro: false, isNew: false, phase: 2, tags: ['heic','jpg','iphone','convert'],  acceptedFileTypes: ['.heic'],                   maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'svg-to-png',         category: 'image',     isPro: false, isNew: false, phase: 2, tags: ['svg','png','convert'],            acceptedFileTypes: ['.svg'],                    maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'image-crop',         category: 'image',     isPro: false, isNew: false, phase: 2, tags: ['image','crop','cut'],             acceptedFileTypes: ['.jpg','.jpeg','.png','.webp'], maxFileSizeMB: { free: 10, pro: 100 } },
  { slug: 'ocr-extractor',      category: 'image',     isPro: true,  isNew: false, phase: 2, tags: ['ocr','text','extract','image'],   acceptedFileTypes: ['.jpg','.jpeg','.png','.pdf'], maxFileSizeMB: { free: 0,  pro: 50  } },
  { slug: 'background-remover', category: 'image',     isPro: true,  isNew: false, phase: 3, tags: ['background','remove','ai'],       acceptedFileTypes: ['.jpg','.jpeg','.png'],     maxFileSizeMB: { free: 0,  pro: 50  } },
  // ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ VIDEO ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
  { slug: 'video-to-mp3',       category: 'video',     isPro: false, isNew: true,  phase: 1, tags: ['video','mp3','audio','extract'],  acceptedFileTypes: ['.mp4','.mov','.avi','.mkv'], maxFileSizeMB: { free: 50, pro: 500 } },
  { slug: 'video-trimmer',      category: 'video',     isPro: false, isNew: false, phase: 2, tags: ['video','trim','cut'],             acceptedFileTypes: ['.mp4','.mov'],             maxFileSizeMB: { free: 50, pro: 500 } },
  { slug: 'video-compressor',   category: 'video',     isPro: false, isNew: false, phase: 2, tags: ['video','compress','reduce'],      acceptedFileTypes: ['.mp4','.mov'],             maxFileSizeMB: { free: 50, pro: 500 } },
  { slug: 'mp4-to-gif',         category: 'video',     isPro: false, isNew: false, phase: 2, tags: ['mp4','gif','convert'],            acceptedFileTypes: ['.mp4'],                    maxFileSizeMB: { free: 20, pro: 200 } },
  // ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ TEXT ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
  { slug: 'text-compare',       category: 'text',      isPro: false, isNew: true,  phase: 1, tags: ['text','compare','diff'],          maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'word-counter',       category: 'text',      isPro: false, isNew: true,  phase: 1, tags: ['word','count','text'],            maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'text-case-converter',category: 'text',      isPro: false, isNew: true,  phase: 1, tags: ['text','case','upper','lower'],    maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'lorem-ipsum-generator', category: 'text',   isPro: false, isNew: true,  phase: 1, tags: ['lorem','ipsum','placeholder'],    maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'markdown-editor',    category: 'text',      isPro: false, isNew: false, phase: 2, tags: ['markdown','editor','preview'],    maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'regex-tester',       category: 'text',      isPro: false, isNew: false, phase: 2, tags: ['regex','regexp','test'],          maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'ai-text-summarizer', category: 'text',      isPro: true,  isNew: false, phase: 3, tags: ['ai','summarize','text'],          maxFileSizeMB: { free: 0, pro: 10 } },
  { slug: 'ai-translator',      category: 'text',      isPro: true,  isNew: false, phase: 3, tags: ['ai','translate','language'],      maxFileSizeMB: { free: 0, pro: 10 } },
  // ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ DEVELOPER ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
  { slug: 'json-formatter',     category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['json','format','beautify'],       maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'json-validator',     category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['json','validate','check'],        maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'base64-encoder',     category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['base64','encode'],                maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'base64-decoder',     category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['base64','decode'],                maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'url-encoder',        category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['url','encode','percent'],         maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'url-decoder',        category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['url','decode'],                   maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'hash-generator',     category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['hash','md5','sha','crypto'],      maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'uuid-generator',     category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['uuid','guid','generate'],         maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'color-converter',    category: 'developer', isPro: false, isNew: true,  phase: 1, tags: ['color','hex','rgb','hsl'],        maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'jwt-decoder',        category: 'developer', isPro: false, isNew: false, phase: 2, tags: ['jwt','token','decode'],           maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'yaml-to-json',       category: 'developer', isPro: false, isNew: false, phase: 2, tags: ['yaml','json','convert'],          maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'css-minifier',       category: 'developer', isPro: false, isNew: false, phase: 2, tags: ['css','minify','compress'],        maxFileSizeMB: { free: 1, pro: 10 } },
  { slug: 'cron-expression-parser', category: 'developer', isPro: false, isNew: true, phase: 1, tags: ['cron','schedule','parse'],   maxFileSizeMB: { free: 0, pro: 0  } },
  // ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ FILE ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
  { slug: 'csv-to-json',        category: 'file',      isPro: false, isNew: true,  phase: 1, tags: ['csv','json','convert','data'],    acceptedFileTypes: ['.csv'],                    maxFileSizeMB: { free: 5,  pro: 50  } },
  { slug: 'json-to-csv',        category: 'file',      isPro: false, isNew: true,  phase: 1, tags: ['json','csv','convert','data'],    maxFileSizeMB: { free: 5,  pro: 50  } },
  { slug: 'zip-extractor',      category: 'file',      isPro: false, isNew: false, phase: 2, tags: ['zip','extract','decompress'],     acceptedFileTypes: ['.zip'],                    maxFileSizeMB: { free: 20, pro: 200 } },
  { slug: 'zip-creator',        category: 'file',      isPro: false, isNew: false, phase: 2, tags: ['zip','compress','archive'],       maxFileSizeMB: { free: 20, pro: 200 } },
  { slug: 'checksum-generator', category: 'file',      isPro: false, isNew: false, phase: 2, tags: ['checksum','md5','sha','verify'],  maxFileSizeMB: { free: 50, pro: 500 } },
  // ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ UTILITY ÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂ
  { slug: 'qr-generator',       category: 'utility',   isPro: false, isNew: true,  phase: 1, tags: ['qr','qrcode','generate'],         maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'password-generator', category: 'utility',   isPro: false, isNew: true,  phase: 1, tags: ['password','generate','secure'],   maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'unit-converter',     category: 'utility',   isPro: false, isNew: true,  phase: 1, tags: ['unit','convert','measurement'],   maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'qr-reader',          category: 'utility',   isPro: false, isNew: false, phase: 2, tags: ['qr','scan','read','decode'],      acceptedFileTypes: ['.jpg','.jpeg','.png'],     maxFileSizeMB: { free: 5,  pro: 20  } },
  { slug: 'barcode-generator',  category: 'utility',   isPro: false, isNew: false, phase: 2, tags: ['barcode','generate','ean'],       maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'timezone-converter', category: 'utility',   isPro: false, isNew: false, phase: 2, tags: ['timezone','convert','time'],      maxFileSizeMB: { free: 0, pro: 0  } },
  { slug: 'color-palette-generator', category: 'utility', isPro: false, isNew: true, phase: 1, tags: ['color','palette','design'],   maxFileSizeMB: { free: 0, pro: 0  } },
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

export function getAllTools(): ToolMeta[,
  {
    slug: 'html-entity-encoder',
    category: 'developer',
    isPro: false,
    isNew: true,
    phase: 1,
    tags: ['html', 'entity', 'encode', 'decode'],
    maxFileSizeMB: { free: 0, pro: 0 },
  },
  {
    slug: 'number-base-converter',
    category: 'developer',
    isPro: false,
    isNew: true,
    phase: 1,
    tags: ['binary', 'hex', 'octal', 'decimal', 'base'],
    maxFileSizeMB: { free: 0, pro: 0 },
  },
  {
    slug: 'unix-timestamp',
    category: 'developer',
    isPro: false,
    isNew: true,
    phase: 1,
    tags: ['unix', 'timestamp', 'epoch', 'date', 'time'],
    maxFileSizeMB: { free: 0, pro: 0 },
  },
] {
  return TOOLS
}

export const CATEGORY_META: Record<ToolCategory, { label: string; icon: string; color: string }> = {
  pdf:       { label: 'PDF',            icon: 'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ', color: 'red'    },
  image:     { label: 'Image',          icon: 'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¼',  color: 'purple' },
  video:     { label: 'Video',          icon: 'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ¬', color: 'pink'   },
  audio:     { label: 'Audio',          icon: 'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ', color: 'yellow' },
  text:      { label: 'Text',           icon: 'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ', color: 'green'  },
  developer: { label: 'Developer',      icon: 'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ»', color: 'blue'   },
  file:      { label: 'File',           icon: 'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ', color: 'orange' },
  utility:   { label: 'Utility',        icon: 'ÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂ§', color: 'teal'   },
}
