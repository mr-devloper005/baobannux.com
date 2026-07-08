import Link from 'next/link'
import { ArrowRight, ArrowUpRight, FileText, FolderOpen, Layers, Library, Search, Sparkles } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

// Public library label — the ONLY user-visible task name on the home page.
const LIBRARY_LABEL = 'Reference Library'

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function hasRealImage(post?: SitePost | null) {
  const img = getEditablePostImage(post)
  return Boolean(img) && !img.includes('placeholder')
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function collectCategories(posts: SitePost[], max = 6) {
  const counts = new Map<string, number>()
  for (const post of posts) {
    const cat = categoryOf(post)
    if (!cat) continue
    counts.set(cat, (counts.get(cat) || 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([label, count]) => ({ label, count }))
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-6 sm:px-10 lg:px-14'

/* --------------------------- Document tile media -------------------------- */
// Resources may not carry photography — fall back to a document glyph panel so
// the grid stays visual without inventing imagery.
function ResourceMedia({ post, className = '' }: { post: SitePost; className?: string }) {
  const category = categoryOf(post)
  if (hasRealImage(post)) {
    return (
      <div className={`${dc.media.frame} ${className}`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" loading="lazy" />
      </div>
    )
  }
  return (
    <div className={`${dc.media.frameFull} rounded-[14px] bg-[var(--slot4-accent-soft)] ${className}`}>
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <FileText className="h-8 w-8 text-[var(--slot4-accent-strong)]" strokeWidth={1.6} />
        <div className="flex items-end justify-between gap-3">
          <span className="editable-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--slot4-accent-strong)]">{category || 'Reference'}</span>
          <span className="rounded-full bg-[var(--slot4-dark-bg)] px-2.5 py-1 editable-mono text-[10px] uppercase tracking-[0.12em] text-[var(--slot4-dark-text)]">File</span>
        </div>
      </div>
    </div>
  )
}

function ResourceCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  return (
    <Link href={href} className={`group flex flex-col overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <ResourceMedia post={post} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-6">
        {category ? <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">{category}</p> : null}
        <h3 className="editable-display mt-2 line-clamp-2 text-xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 130)}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-page-text)] underline decoration-[var(--slot4-accent-fill)] decoration-2 underline-offset-[6px] transition group-hover:gap-3">
          Open reference <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

/* -------------------------------- Hero ---------------------------------- */
export function EditableHomeHero({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `The ${SITE_CONFIG.name} reference library`
  const featured = pool[0]
  const categoryCount = collectCategories(pool, 99).length
  const stats = [
    { value: `${pool.length || 0}+`, label: 'References' },
    { value: `${categoryCount || 0}`, label: 'Collections' },
    { value: 'Open', label: 'Ready to read' },
  ]

  return (
    <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
      <div className={`grid gap-14 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28 ${container}`}>
        <EditableReveal index={0}>
          <p className={dc.type.eyebrow}>{pagesContent.home.hero.badge || `An open ${LIBRARY_LABEL.toLowerCase()}`}</p>
          <h1 className={`mt-6 text-balance ${dc.type.heroTitle}`}>{heroTitle}</h1>
          <p className="mt-7 max-w-xl text-lg leading-[1.6] text-[var(--slot4-muted-text)]">{pagesContent.home.hero.description}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/pdf" className={dc.button.primary}>
              Open the {LIBRARY_LABEL} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/search" className={dc.button.secondary}>
              <Search className="h-4 w-4" /> Search references
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-[var(--editable-border)] pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="editable-display text-3xl font-bold tracking-[-0.03em] text-[var(--slot4-page-text)]">{stat.value}</p>
                <p className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </EditableReveal>

        {featured ? (
          <EditableReveal index={2} className="min-w-0">
            <div className="min-h-[420px]">
              <Link href={postHref('pdf', featured, '/pdf')} className={`group flex h-full flex-col overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
                <ResourceMedia post={featured} className="aspect-[5/4]" />
                <div className="flex flex-1 flex-col p-7">
                  <span className={dc.badge.accentPill}>Latest in the library</span>
                  <h3 className="editable-display mt-4 line-clamp-3 text-2xl font-bold leading-[1.08] tracking-[-0.02em]">{featured.title}</h3>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(featured, 150)}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline decoration-[var(--slot4-accent-fill)] decoration-2 underline-offset-[6px] transition group-hover:gap-3">
                    Open reference <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
          </EditableReveal>
        ) : null}
      </div>
    </section>
  )
}

/* ---------------------------- Collections grid --------------------------- */
export function EditableStoryRail({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const categories = collectCategories(pool, 6)
  if (!categories.length) return null
  const glyphs = [Library, FolderOpen, Layers, FileText, Sparkles, FolderOpen]
  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`${dc.shell.sectionYtight} ${container}`}>
        <EditableReveal index={0} className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className={dc.type.eyebrow}>Browse by collection</p>
            <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Jump into the right shelf.</h2>
          </div>
          <Link href="/pdf" className={dc.button.ghost}>
            View the whole library <ArrowUpRight className="h-4 w-4" />
          </Link>
        </EditableReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const Glyph = glyphs[i % glyphs.length]
            return (
              <EditableReveal key={cat.label} index={i} as="div">
                <Link href="/pdf" className={`group flex items-center gap-5 ${dc.surface.card} p-6 ${dc.motion.lift}`}>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent-strong)] transition group-hover:scale-105">
                    <Glyph className="h-6 w-6" strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="editable-display truncate text-lg font-bold tracking-[-0.02em]">{cat.label}</h3>
                    <p className="mt-1 text-sm text-[var(--slot4-muted-text)]">{cat.count} {cat.count === 1 ? 'reference' : 'references'}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-[var(--slot4-muted-text)] transition group-hover:text-[var(--slot4-page-text)]" />
                </Link>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* --------------------------- Latest references --------------------------- */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const items = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 6)
  if (!items.length) return null
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${dc.shell.sectionY} ${container}`}>
        <EditableReveal index={0} className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className={dc.type.eyebrow}>Fresh in the library</p>
            <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Latest references, ready to open.</h2>
          </div>
          <Link href={primaryRoute} className={dc.button.ghost}>
            All references <ArrowUpRight className="h-4 w-4" />
          </Link>
        </EditableReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post, i) => (
            <EditableReveal key={post.id || post.slug} index={i} as="div">
              <ResourceCard post={post} href={postHref(primaryTask, post, primaryRoute)} />
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------- Time-based discovery sections -------------------- */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'Added in the last 7 days' },
  browse: { eyebrow: 'Most opened', title: 'Popular this month' },
  index: { eyebrow: 'Evergreen', title: 'From the archive' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className="border-t border-[var(--editable-border)] bg-[var(--slot4-warm)]">
            <div className={`${dc.shell.sectionYtight} ${container}`}>
              <EditableReveal index={0} className="flex items-end justify-between gap-4">
                <div>
                  <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
                  <h2 className="editable-display mt-3 text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.5rem]">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:gap-2.5">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </EditableReveal>
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {section.posts.slice(0, 4).map((post, i) => (
                  <EditableReveal key={post.id || post.slug} index={i} as="div">
                    <ResourceCard post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ------------------------------ Trust / FAQ ----------------------------- */
export function EditableHomeFaq() {
  const faqs = [
    {
      q: 'What lives in the library?',
      a: 'References, collections, and source material — organized by topic so you can find what you need and open it straight away.',
    },
    {
      q: 'How do I open a reference?',
      a: 'Every entry has a clean preview and a direct download. Open it in the browser or save the file — no account required to read.',
    },
    {
      q: 'Is it kept up to date?',
      a: 'New references are added continuously and grouped into collections, with the freshest material surfaced first on the home page.',
    },
    {
      q: 'Can I contribute?',
      a: 'Sign in and submit through the workspace. Your references are reviewed and added to the relevant collection.',
    },
  ]
  return (
    <section className="border-t border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
      <div className={`grid gap-14 ${dc.shell.sectionY} lg:grid-cols-[0.9fr_1.1fr] ${container}`}>
        <EditableReveal index={0}>
          <p className={dc.type.eyebrow}>Good to know</p>
          <h2 className={`mt-4 ${dc.type.sectionTitle}`}>Questions, answered.</h2>
          <p className="mt-5 max-w-md text-lg leading-[1.6] text-[var(--slot4-muted-text)]">
            A quick primer on how the {LIBRARY_LABEL} works and how to get the most from it.
          </p>
          <Link href="/contact" className={`mt-8 ${dc.button.secondary}`}>
            Ask a question <ArrowUpRight className="h-4 w-4" />
          </Link>
        </EditableReveal>

        <div className="grid gap-4">
          {faqs.map((faq, i) => (
            <EditableReveal key={faq.q} index={i} as="div">
              <details className={`group ${dc.surface.card} p-6 [&_summary::-webkit-details-marker]:hidden`}>
                <summary className="flex cursor-pointer items-center justify-between gap-4">
                  <span className="editable-display text-lg font-bold tracking-[-0.02em]">{faq.q}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-muted-text)] transition group-open:rotate-45 group-open:border-[var(--slot4-accent-fill)] group-open:text-[var(--slot4-page-text)]">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[0.98rem] leading-7 text-[var(--slot4-muted-text)]">{faq.a}</p>
              </details>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- CTA band ------------------------------ */
export function EditableHomeCta() {
  return (
    <section id="get-app" className="scroll-mt-24 bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
      <div className={`flex flex-col items-center gap-8 py-24 text-center sm:py-32 ${container}`}>
        <EditableReveal index={0} className="flex flex-col items-center gap-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-dark-border)] px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-dark-text)]/70">
            {pagesContent.home.cta.badge || 'Start exploring'}
          </span>
          <h2 className="editable-display max-w-3xl text-[2.6rem] font-bold leading-[1.0] tracking-[-0.03em] sm:text-[4rem]">
            {pagesContent.home.cta.title}
          </h2>
          <p className="max-w-xl text-lg leading-[1.6] text-[var(--slot4-dark-text)]/70">{pagesContent.home.cta.description}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pdf" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-7 py-3.5 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:brightness-[0.96]">
              Open the {LIBRARY_LABEL} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/create" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-dark-border)] px-7 py-3.5 text-sm font-semibold text-[var(--slot4-dark-text)] transition hover:bg-[var(--slot4-dark-text)]/10">
              Submit a reference
            </Link>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
