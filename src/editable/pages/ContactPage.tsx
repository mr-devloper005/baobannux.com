'use client'

import { Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles, Bookmark } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const tone = {
  shell: 'bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]',
  panel: 'rounded-[20px] border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]',
  soft: 'rounded-[20px] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]',
  muted: 'text-[var(--slot4-muted-text)]',
  action: 'bg-[var(--slot4-accent-fill)] text-[var(--slot4-on-accent)] hover:opacity-90',
}

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Business onboarding', body: 'Add listings, verify operational details, and bring your business surface live quickly.' },
      { icon: Phone, title: 'Partnership support', body: 'Talk through bulk publishing, local growth, and operational setup questions.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Need a new geography or category lane? We can shape the directory around it.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Editorial submissions', body: 'Pitch essays, columns, and long-form ideas that fit the publication.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate sponsorships, collaborations, and issue-level campaigns.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with voice, formatting, and publication workflow questions.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Discuss gallery launches, creator features, and visual campaigns.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about usage rights, commercial requests, and visual partnerships.' },
      { icon: Mail, title: 'Media kits', body: 'Request creator decks, editorial support, or visual feature placement.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Reference submissions', body: 'Suggest references, collections, and resources that deserve a place in the library.' },
    { icon: Mail, title: 'Collection partnerships', body: 'Coordinate curation projects, reference collections, and resource programs.' },
    { icon: Sparkles, title: 'Curator support', body: 'Need help organizing shelves, collections, or connecting related references?' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell className={tone.shell}>
      <main className="mx-auto w-full max-w-[var(--editable-container)] px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="editable-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--slot4-accent)]">{pagesContent.contact.eyebrow}</p>
            <h1 className="editable-display mt-5 text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[3.4rem]">{pagesContent.contact.title}</h1>
            <p className={`mt-6 max-w-2xl text-lg leading-[1.6] ${tone.muted}`}>{pagesContent.contact.description}</p>
            <div className="mt-10 space-y-4">
              {lanes.map((lane) => (
                <div key={lane.title} className={`p-6 ${tone.soft}`}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent-strong)]"><lane.icon className="h-5 w-5" /></span>
                  <h2 className="editable-display mt-4 text-xl font-bold tracking-[-0.02em]">{lane.title}</h2>
                  <p className={`mt-2 text-[0.98rem] leading-7 ${tone.muted}`}>{lane.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-8 ${tone.panel}`}>
            <h2 className="editable-display text-2xl font-bold tracking-[-0.02em]">{pagesContent.contact.formTitle}</h2>
            <EditableContactLeadForm />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
