import Link from 'next/link'
import { ArrowRight, Library, Search, ShieldCheck } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

const valueIcons = [Library, Search, ShieldCheck]

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-20 lg:py-28`}>
          <p className={dc.type.eyebrow}>{pagesContent.about.badge}</p>
          <h1 className={`mt-6 max-w-4xl ${dc.type.heroTitle}`}>About {SITE_CONFIG.name}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-[1.6] text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5 text-[1.05rem] leading-[1.7] text-[var(--slot4-muted-text)]">
              {pagesContent.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="pt-4">
                <Link href="/pdf" className={dc.button.primary}>
                  Open the Reference Library <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid gap-5">
              {pagesContent.about.values.map((value, i) => {
                const Icon = valueIcons[i % valueIcons.length]
                return (
                  <div key={value.title} className={`${dc.surface.soft} p-7`}>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent-strong)]">
                      <Icon className="h-6 w-6" strokeWidth={1.7} />
                    </span>
                    <h2 className="editable-display mt-5 text-xl font-bold tracking-[-0.02em]">{value.title}</h2>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
