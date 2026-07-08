import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => (typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : '')
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const summaryOf = (post: SitePost) => {
  const raw = post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''
  return stripHtml(raw).replace(/\s+/g, ' ').trim()
}
const categoryOf = (post: SitePost) => compactRaw(getContent(post).category) || post.tags?.[0] || 'Reference'

// Profiles are never surfaced in the public search UI — only Reference Library
// resources (and any other non-profile content) appear as results.
const isPublicResult = (post: SitePost) => {
  const content = getContent(post)
  if (compactText(content.type) === 'comment') return false
  return getPostTaskKey(post) !== 'profile'
}

const matches = (post: SitePost, query: string, category: string) => {
  const content = getContent(post)
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post }: { post: SitePost }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'pdf'}`}/${post.slug}`
  const summary = summaryOf(post)
  const category = categoryOf(post)

  return (
    <Link href={href} className={`group flex flex-col overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className="relative flex aspect-[16/10] items-center justify-center bg-[var(--slot4-accent-soft)]">
        <FileText className="h-10 w-10 text-[var(--slot4-accent-strong)]" strokeWidth={1.5} />
        <span className="absolute left-4 top-4 rounded-full bg-[var(--slot4-dark-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-dark-text)]">Reference</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">{category}</p>
        <h2 className="editable-display mt-2 line-clamp-2 text-xl font-bold leading-snug tracking-[-0.02em] text-[var(--slot4-page-text)]">{post.title}</h2>
        {summary ? <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{stripHtml(summary)}</p> : null}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-page-text)] underline decoration-[var(--slot4-accent-fill)] decoration-2 underline-offset-[6px] transition group-hover:gap-3">Open reference <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
      ? []
      : SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'profile').flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => isPublicResult(post) && matches(post, normalized, category)).slice(0, normalized ? 80 : 36)

  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className={dc.type.eyebrow}>{pagesContent.search.hero.badge}</p>
              <h1 className={`mt-6 ${dc.type.sectionTitle}`}>{pagesContent.search.hero.title}</h1>
              <p className="mt-6 max-w-xl text-lg leading-[1.6] text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>
            </div>
            <form action="/search" className={`${dc.surface.soft} p-6`}>
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-5 py-3.5">
                <Search className="h-5 w-5 text-[var(--slot4-muted-text)]" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-[var(--slot4-soft-muted-text)]" />
              </label>
              <label className="mt-3 flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-5 py-3.5">
                <Filter className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                <input name="category" defaultValue={category} placeholder="Filter by collection" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-soft-muted-text)]" />
              </label>
              <button className={`mt-4 w-full ${dc.button.primary}`} type="submit">Search the library <Search className="h-4 w-4" /></button>
            </form>
          </div>

          <div className="mt-14 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--editable-border)] pt-8">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">{results.length} results</p>
              <h2 className="editable-display mt-2 text-[2rem] font-bold tracking-[-0.03em]">{query ? `Results for “${query}”` : pagesContent.search.resultsTitle}</h2>
            </div>
            <Link href="/pdf" className={dc.button.ghost}>Browse the library <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {results.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post) => <SearchResultCard key={post.id || post.slug} post={post} />)}
            </div>
          ) : (
            <div className="mt-8 rounded-[14px] border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-[var(--slot4-muted-text)]" />
              <p className="editable-display mt-5 text-2xl font-bold tracking-[-0.02em]">No matching references found.</p>
              <p className="mt-3 text-sm text-[var(--slot4-muted-text)]">Try a different keyword or collection.</p>
            </div>
          )}

          {/* Search page → footer ad (exactly one) */}
          <div className="mt-16">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel className="mx-auto w-full" />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
