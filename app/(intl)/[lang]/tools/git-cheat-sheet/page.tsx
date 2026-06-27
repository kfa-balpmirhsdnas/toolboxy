'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import ToolLayout from '@/components/tools/ToolLayout'
import { getToolBySlug } from '@/lib/tools/registry'
import { trackToolUsed, trackToolCopy } from '@/lib/gtag'

const tool = getToolBySlug('git-cheat-sheet')!
const TKEY: Record<string,string> = { 'Setup':'gcs_s_setup', 'Initialize':'gcs_s_init', 'Stage & Snapshot':'gcs_s_stage', 'Branch & Merge':'gcs_s_branch', 'Remote':'gcs_s_remote', 'Undo & Reset':'gcs_s_undo', 'Stash':'gcs_s_stash', 'Log & Inspect':'gcs_s_log' }

const SECTIONS = [
  { title:'Setup', commands:[
    { cmd:'git config --global user.name "Name"', desc:'Set your global username' },
    { cmd:'git config --global user.email "email"', desc:'Set your global email' },
    { cmd:'git config --global core.editor "code --wait"', desc:'Set VS Code as default editor' },
    { cmd:'git config --list', desc:'List all configuration settings' },
  ]},
  { title:'Initialize', commands:[
    { cmd:'git init', desc:'Initialize a new local repository' },
    { cmd:'git clone <url>', desc:'Clone a remote repository' },
    { cmd:'git clone <url> <dir>', desc:'Clone into a specific directory' },
  ]},
  { title:'Stage & Snapshot', commands:[
    { cmd:'git status', desc:'Show working tree status' },
    { cmd:'git add <file>', desc:'Stage a specific file' },
    { cmd:'git add .', desc:'Stage all changes' },
    { cmd:'git add -p', desc:'Interactively stage hunks' },
    { cmd:'git diff', desc:'Show unstaged changes' },
    { cmd:'git diff --staged', desc:'Show staged changes' },
    { cmd:'git commit -m "message"', desc:'Commit staged changes' },
    { cmd:'git commit -am "message"', desc:'Stage tracked files and commit' },
    { cmd:'git commit --amend', desc:'Amend the last commit' },
  ]},
  { title:'Branch & Merge', commands:[
    { cmd:'git branch', desc:'List local branches' },
    { cmd:'git branch <name>', desc:'Create a new branch' },
    { cmd:'git checkout <branch>', desc:'Switch to a branch' },
    { cmd:'git checkout -b <branch>', desc:'Create and switch to new branch' },
    { cmd:'git switch <branch>', desc:'Switch branches (modern syntax)' },
    { cmd:'git switch -c <branch>', desc:'Create and switch (modern)' },
    { cmd:'git merge <branch>', desc:'Merge branch into current' },
    { cmd:'git branch -d <branch>', desc:'Delete a branch' },
    { cmd:'git branch -D <branch>', desc:'Force delete a branch' },
  ]},
  { title:'Remote', commands:[
    { cmd:'git remote -v', desc:'List remotes' },
    { cmd:'git remote add origin <url>', desc:'Add a remote' },
    { cmd:'git fetch', desc:'Fetch all remotes' },
    { cmd:'git pull', desc:'Fetch and merge from remote' },
    { cmd:'git pull --rebase', desc:'Fetch and rebase from remote' },
    { cmd:'git push origin <branch>', desc:'Push branch to remote' },
    { cmd:'git push -u origin <branch>', desc:'Push and set upstream' },
    { cmd:'git push --force-with-lease', desc:'Safe force push' },
  ]},
  { title:'Undo & Reset', commands:[
    { cmd:'git revert <commit>', desc:'Create revert commit' },
    { cmd:'git reset HEAD <file>', desc:'Unstage a file' },
    { cmd:'git reset --soft HEAD~1', desc:'Undo last commit, keep staged' },
    { cmd:'git reset --hard HEAD~1', desc:'Undo last commit, discard changes' },
    { cmd:'git checkout -- <file>', desc:'Discard file changes' },
    { cmd:'git clean -fd', desc:'Remove untracked files/dirs' },
  ]},
  { title:'Stash', commands:[
    { cmd:'git stash', desc:'Stash working directory changes' },
    { cmd:'git stash list', desc:'List all stashes' },
    { cmd:'git stash pop', desc:'Apply latest stash and remove' },
    { cmd:'git stash apply stash@{n}', desc:'Apply specific stash' },
    { cmd:'git stash drop stash@{n}', desc:'Delete a stash' },
  ]},
  { title:'Log & Inspect', commands:[
    { cmd:'git log --oneline', desc:'Compact commit history' },
    { cmd:'git log --oneline --graph --all', desc:'Visual branch graph' },
    { cmd:'git log --author="Name"', desc:'Filter commits by author' },
    { cmd:'git show <commit>', desc:'Show commit details' },
    { cmd:'git blame <file>', desc:'Show who changed each line' },
    { cmd:'git diff <branch1>..<branch2>', desc:'Diff between branches' },
  ]},
]

export default function GitCheatSheetPage({ params }: { params: { lang: string } }) {
  const t = useTranslations('toolui')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string|null>(null)
  const tracked = useRef(false)

  function track() { if (!tracked.current) { trackToolUsed('git-cheat-sheet'); tracked.current = true } }

  const q = search.toLowerCase()
  const filtered = SECTIONS.map(sec=>({
    ...sec,
    commands: sec.commands.filter(c=>!q||(c.cmd.toLowerCase().includes(q)||c.desc.toLowerCase().includes(q)))
  })).filter(sec=>!q||sec.commands.length>0)

  async function copy(cmd: string) {
    await navigator.clipboard.writeText(cmd)
    trackToolCopy('git-cheat-sheet')
    setCopied(cmd); setTimeout(()=>setCopied(null),1500)
  }

  return (
    <ToolLayout tool={tool} lang={params.lang}>
      <div className="space-y-4">
        <input value={search} onChange={e=>{setSearch(e.target.value);track()}} placeholder={t('gcs_search')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        {filtered.map(sec=>(
          <div key={sec.title}>
            <h3 className="text-xs font-semibold text-brand-600 mb-2">{t(TKEY[sec.title])}</h3>
            <div className="space-y-1">
              {sec.commands.map(c=>(
                <div key={c.cmd} onClick={()=>copy(c.cmd)}
                  className="flex items-start justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-brand-300 cursor-pointer transition-colors group">
                  <div>
                    <code className="text-xs font-mono text-gray-800">{c.cmd}</code>
                    <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                  </div>
                  <span className="text-xs text-brand-400 ml-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">{copied===c.cmd?'\u2713':t('ui_copy')}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ToolLayout>
  )
}
