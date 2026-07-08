'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, Lock, Send } from 'lucide-react'
import { type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

// The public submission workspace centers entirely on the Reference Library.
const SUBMIT_TASK: TaskKey = 'pdf'

const fieldClass =
  'rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-soft-muted-text)] focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task: SUBMIT_TASK,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className={dc.shell.page}>
          <section className="mx-auto grid max-w-5xl gap-8 px-6 py-20 sm:px-10 md:grid-cols-[0.9fr_1.1fr] lg:py-28">
            <div className={`flex min-h-72 items-center justify-center ${dc.surface.dark}`}>
              <Lock className="h-20 w-20 opacity-80" />
            </div>
            <div className="self-center">
              <p className={dc.type.eyebrow}>{pagesContent.create.locked.badge}</p>
              <h1 className={`mt-5 ${dc.type.sectionTitle}`}>{pagesContent.create.locked.title}</h1>
              <p className="mt-6 max-w-xl text-lg leading-[1.6] text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className={dc.button.primary}>Sign in <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/signup" className={dc.button.secondary}>Get started</Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <aside>
              <p className={dc.type.eyebrow}>{pagesContent.create.hero.badge}</p>
              <h1 className={`mt-5 ${dc.type.sectionTitle}`}>{pagesContent.create.hero.title}</h1>
              <p className="mt-6 max-w-xl text-lg leading-[1.6] text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>
              <div className={`mt-8 flex items-center gap-4 ${dc.surface.soft} p-6`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent-strong)]">
                  <FileText className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="editable-display text-base font-bold tracking-[-0.02em]">Reference Library</p>
                  <p className="mt-0.5 text-sm text-[var(--slot4-muted-text)]">References, collections, and resources.</p>
                </div>
              </div>
            </aside>

            <form onSubmit={submit} className={`${dc.surface.card} p-7 sm:p-9`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="editable-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--slot4-accent)]">New reference</p>
                  <h2 className="editable-display mt-1 text-2xl font-bold tracking-[-0.02em]">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="rounded-full border border-[var(--editable-border)] px-4 py-2 editable-mono text-[0.68rem] uppercase tracking-[0.1em] text-[var(--slot4-muted-text)]">{session.name}</span>
              </div>

              <div className="mt-7 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Reference title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Collection / category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Reference / source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Cover image URL (optional)" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Description, contents, notes, or context" required />
              </div>

              {created ? (
                <div className="mt-5 rounded-xl border border-[var(--slot4-accent)]/25 bg-[var(--slot4-accent-soft)] p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent-strong)]"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className={`mt-6 w-full ${dc.button.primary}`}>
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
