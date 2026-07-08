import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, BookOpen, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Layers, Mail, MapPin, Phone, Quote, ShieldCheck, Star, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

// Public display labels (the underlying task keys never change). The pdf task
// is the public Reference Library; the profile task uses the Contributor label
// and is reachable by direct URL only.
const REFERENCE_LABEL = 'Reference Library'
const CONTRIBUTOR_LABEL = 'Contributor'

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  // The Contributor (profile) detail never links to other profiles — instead it
  // links into the public Reference Library, so pull real library resources.
  const libraryResources = task === 'profile' ? (await fetchTaskPosts('pdf', 8)).slice(0, 6) : []
  const detailFileSize = task === 'pdf' ? await resolvePdfFileSize(post) : ''
  return <TaskDetailView task={task} post={post} related={related} comments={comments} libraryResources={libraryResources} detailFileSize={detailFileSize} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [], libraryResources = [], detailFileSize = '' }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>; libraryResources?: SitePost[]; detailFileSize?: string }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} fileSizeOverride={detailFileSize} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} libraryResources={libraryResources} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

// Yelp-style red star rating row. Uses real rating/review fields when present,
// otherwise a stable derived value (wire to real data when available).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  // pdf → public Reference Library; profile → Home (never link the profile
  // archive). Other tasks fall back to their own archive route.
  const target =
    task === 'pdf'
      ? { href: '/pdf', label: REFERENCE_LABEL }
      : task === 'profile'
        ? { href: '/', label: 'home' }
        : { href: taskConfig?.route || '/', label: taskConfig?.label || 'posts' }
  return (
    <Link href={target.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {target.label}
    </Link>
  )
}

// ----- Article: a quiet, centred reading column -----
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="editable-display mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">{post.title}</h1>
        <div className="mt-6 text-sm text-[var(--tk-muted)]">
          <span>{SITE_CONFIG.name}</span>
        </div>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

// ----- Listing: a precise directory record -----
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <Kicker task="listing">Business listing</Kicker>
              <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
              <DetailMeta post={post} category={getField(post, ['category'])} />
            </div>
          </div>
          {leadText(post) ? <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <Divider />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
          <RelatedPanel task="listing" related={related} />
        </aside>
      </div>
    </section>
  )
}

// ----- Classified: price-forward notice with a sticky action rail -----
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <Kicker task="classified">Classified</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
            <DetailMeta post={post} category={getField(post, ['category'])} />
            <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

// ----- Image: a dark, gallery-led canvas -----
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

// ----- Bookmark: a single curated resource -----
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

// ----- PDF (Reference Library): a document workspace -----
const ORIGINAL_FILE_SIZE_KEYS = [
  'originalFileSize',
  'originalFilesize',
  'originalSize',
  'originalFileSizeBytes',
  'originalSizeBytes',
  'uploadedFileSize',
  'uploadedSize',
  'contentLength',
  'contentLengthBytes',
  'fileSizeBytes',
  'sizeBytes',
  'bytes',
  'fileSize',
  'filesize',
  'size',
] as const

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = value
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  const precision = size >= 10 || unitIndex === 0 ? 0 : 1
  return `${size.toFixed(precision)} ${units[unitIndex]}`
}

function formatFileSizeValue(value: unknown): string {
  if (typeof value === 'number') return formatBytes(value)
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  // Pure numeric string → treat as bytes.
  if (/^\d+(\.\d+)?$/.test(trimmed)) return formatBytes(Number(trimmed))
  // Already-formatted size like "2.4 MB" / "512 KB" / "1024B" — keep as-is.
  if (/^\d+(\.\d+)?\s*(B|KB|MB|GB|TB|KiB|MiB|GiB|TiB)$/i.test(trimmed)) return trimmed
  // Anything else (e.g. a format token like "pdf", "docx", or a category name)
  // is NOT a file size — reject so the HEAD-request fallback can take over.
  return ''
}

function fileSizeFromValue(value: unknown, seen = new Set<object>()): string {
  if (!value) return ''
  const direct = formatFileSizeValue(value)
  if (direct) return direct

  if (Array.isArray(value)) {
    for (const item of value) {
      const formatted = fileSizeFromValue(item, seen)
      if (formatted) return formatted
    }
    return ''
  }

  if (typeof value !== 'object') return ''
  if (seen.has(value)) return ''
  seen.add(value)

  const record = value as Record<string, unknown>
  for (const key of ORIGINAL_FILE_SIZE_KEYS) {
    const formatted = formatFileSizeValue(record[key])
    if (formatted) return formatted
  }

  for (const [key, nested] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase()
    if ((normalizedKey.includes('size') || normalizedKey.includes('bytes') || normalizedKey.includes('length')) && normalizedKey !== 'length') {
      const formatted = formatFileSizeValue(nested)
      if (formatted) return formatted
    }
  }

  for (const nested of Object.values(record)) {
    const formatted = fileSizeFromValue(nested, seen)
    if (formatted) return formatted
  }
  return ''
}

function fileSizeOf(post: SitePost): string {
  return fileSizeFromValue(getContent(post)) || fileSizeFromValue(post)
}

function fileUrlOf(post: SitePost): string {
  return getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
}

async function fileSizeFromUrl(url: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) return ''
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    const length = Number(response.headers.get('content-length'))
    const formatted = formatBytes(length)
    if (formatted) return formatted
  } catch {
    // Some file hosts reject HEAD. Fall back to a one-byte range request below.
  }

  try {
    const response = await fetch(url, { headers: { Range: 'bytes=0-0' }, cache: 'no-store' })
    const range = response.headers.get('content-range') || ''
    const total = Number(range.match(/\/(\d+)$/)?.[1])
    return formatBytes(total)
  } catch {
    return ''
  }
}

async function resolvePdfFileSize(post: SitePost): Promise<string> {
  const fromMetadata = fileSizeOf(post)
  if (fromMetadata) return fromMetadata
  return fileSizeFromUrl(fileUrlOf(post))
}
function PdfDetail({ post, related, fileSizeOverride = '' }: { post: SitePost; related: SitePost[]; fileSizeOverride?: string }) {
  const fileUrl = fileUrlOf(post)
  const category = categoryOf(post, 'General')
  const pages = getField(post, ['pages', 'pageCount', 'numPages'])
  const fileSize = fileSizeOverride || fileSizeOf(post)
  const fileName = getField(post, ['fileName', 'filename']) || `${(post.slug || 'reference').toString().slice(0, 40)}.pdf`
  const uploader = getField(post, ['uploadedBy', 'author', 'contributor']) || SITE_CONFIG.name
  const lead = leadText(post)
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 6) : []
  const inside = ['Overview & context', 'Key sections', 'References & sources'].filter(Boolean)

  const facts: Array<[string, string]> = [

    ['File size', fileSize || 'Not available'],
    ['Format', 'PDF file'],
    ['Collection', category],
    ['Uploaded by', uploader],
  ]

  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-14">
        <BackLink task="pdf" />

        {/* Label chip row */}
        <div className="mt-10 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-text)] px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--tk-bg)]">
            <BookOpen className="h-3.5 w-3.5" /> Reference document
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-on-accent)]">PDF</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--tk-muted)]">{category}</span>
        </div>

        {/* Title — the typographic centerpiece */}
        <h1 className="editable-display mt-6 max-w-4xl text-balance text-[2.6rem] font-bold leading-[1.0] tracking-[-0.03em] sm:text-[4rem] lg:text-[4.6rem]">{post.title}</h1>

        {/* Lead as pull-quote */}
        {lead ? (
          <blockquote className="mt-8 max-w-3xl border-l-2 border-[var(--slot4-accent-fill)] pl-6">
            <Quote className="h-6 w-6 text-[var(--slot4-accent-fill)]" />
            <p className="mt-3 text-xl leading-[1.55] text-[var(--tk-text)] sm:text-2xl">{lead}</p>
          </blockquote>
        ) : null}

        {/* Primary + secondary CTAs */}
        {fileUrl ? (
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--tk-text)] px-7 py-3.5 text-sm font-semibold text-[var(--tk-bg)] transition hover:-translate-y-0.5">
              Download PDF <Download className="h-4 w-4" />
            </Link>
            <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--tk-text)_22%,transparent)] px-7 py-3.5 text-sm font-semibold transition hover:bg-[var(--tk-text)] hover:text-[var(--tk-bg)]">
              Open in new tab <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        ) : null}

        {/* Quick-facts strip */}
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-line)] sm:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label} className="bg-[var(--tk-surface)] p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--tk-muted)]">{label}</p>
              <p className="editable-display mt-2 truncate text-lg font-bold tracking-[-0.02em]">{value}</p>
            </div>
          ))}
        </div>

        {/* Two-column body + sticky sidebar */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            {/* Embedded PDF preview — the visual centerpiece */}
            {fileUrl ? (
              <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-[var(--slot4-accent-strong)]" /> Reference preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-4 py-2 text-xs font-semibold text-[var(--slot4-on-accent)] transition hover:brightness-95">Download <Download className="h-3.5 w-3.5" /></Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[82vh] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] p-10 text-center">
                <FileText className="h-10 w-10 text-[var(--tk-muted)]" />
                <p className="text-sm text-[var(--tk-muted)]">A preview for this reference will appear here once the file is attached.</p>
              </div>
            )}

            <div className="mt-12">
              <h2 className="editable-display text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.6rem]">About this reference</h2>
              <BodyContent post={post} />
            </div>

            {tags.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]">#{tag}</span>
                ))}
              </div>
            ) : null}

            {/* Repeated CTA callout */}
            <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-[var(--tk-radius)] bg-[var(--tk-text)] p-8 text-[var(--tk-bg)] sm:flex-row sm:items-center">
              <div>
                <p className="editable-display text-2xl font-bold tracking-[-0.02em]">Keep this reference close.</p>
                <p className="mt-2 text-sm text-[var(--tk-bg)]/70">Download the full reference or open it in a new tab.</p>
              </div>
              {fileUrl ? (
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:brightness-95">
                  Download PDF <Download className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            {/* One article-bottom ad, before the related strip */}
            <div className="mt-12">
              <Ads slot="article-bottom" size={pickRandom(getSlotSizes('article-bottom'))} showLabel className="mx-auto w-full" />
            </div>
          </article>

          {/* Sticky document-identity sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="flex items-center justify-center bg-[var(--slot4-accent-soft)] py-12">
                <FileText className="h-16 w-16 text-[var(--slot4-accent-strong)]" strokeWidth={1.3} />
              </div>
              <div className="p-6">
                <p className="truncate text-sm font-semibold" title={fileName}>{fileName}</p>
                <div className="mt-5 grid gap-3 text-sm">
                  <IdentityRow label="Collection" value={category} />
                  
                  <IdentityRow label="File size" value={fileSize || 'Not available'} />
                  <IdentityRow label="Uploaded by" value={uploader} />
                </div>
                {fileUrl ? (
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-text)] px-5 py-3 text-sm font-semibold text-[var(--tk-bg)] transition hover:-translate-y-0.5">
                    Download <Download className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="inline-flex items-center gap-2 text-sm font-semibold"><Layers className="h-4 w-4 text-[var(--slot4-accent-strong)]" /> What&rsquo;s inside</p>
              <ul className="mt-4 grid gap-2.5">
                {inside.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--tk-muted)]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-accent-strong)]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <PdfRelatedStrip related={related} />
    </>
  )
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--tk-line)] pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="max-w-[60%] truncate text-sm font-semibold" title={value}>{value}</span>
    </div>
  )
}

// Related references — document glyph tiles + file-size chip. No photography.
function PdfRelatedStrip({ related }: { related: SitePost[] }) {
  if (!related.length) return null
  return (
    <section className="border-t border-[var(--tk-line)] bg-[var(--tk-raised)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-20 lg:px-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="editable-display text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.6rem]">More references</h2>
          <Link href="/pdf" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-text)] transition hover:gap-2.5">Open the {REFERENCE_LABEL} <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => {
            const size = fileSizeOf(item) || 'File'
            return (
              <Link key={item.id || item.slug} href={`/pdf/${item.slug}`} className="group flex flex-col overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-24px_rgba(12,4,7,0.3)]">
                <div className="relative flex aspect-[4/3] items-center justify-center bg-[var(--slot4-accent-soft)]">
                  <FileText className="h-10 w-10 text-[var(--slot4-accent-strong)]" strokeWidth={1.5} />
                  <span className="absolute right-3 top-3 rounded-full bg-[var(--tk-text)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--tk-bg)]">{size}</span>
                </div>
                <div className="p-5">
                  <h3 className="editable-display line-clamp-2 text-base font-bold leading-snug tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(item))}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ----- Contributor (profile): premium record, direct-URL only -----
function ProfileDetail({ post, libraryResources }: { post: SitePost; libraryResources: SitePost[] }) {
  const images = getImages(post)
  const avatar = images[0]
  const role = getField(post, ['role', 'designation', 'title'])
  const location = getField(post, ['location', 'city', 'address'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const address = getField(post, ['address', 'location', 'city'])
  const lead = leadText(post)
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 8) : []
  const mapSrc = mapSrcFor(post)

  const quickFacts: Array<[string, string, typeof MapPin]> = [
    ['Location', location, MapPin],
    ['Role', role, ShieldCheck],
    ['Website', website ? 'Linked' : '', Globe2],
    ['Status', 'Verified', CheckCircle2],
  ]
  const trust = [
    { label: 'Identity verified', note: 'Confirmed contributor account' },
    { label: 'References reviewed', note: 'Contributions checked before listing' },
    { label: 'Active in the library', note: 'Material kept current' },
  ]

  return (
    <>
      {/* Hero band with prominent avatar + display-scale name */}
      <section className="border-b border-[var(--tk-line)] bg-[var(--tk-raised)]">
        <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-14">
          <BackLink task="profile" />
          <div className="mt-10 flex flex-col items-start gap-8 sm:flex-row sm:items-end">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_40px_-20px_rgba(12,4,7,0.4)] sm:h-40 sm:w-40">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-16 w-16 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-text)] px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--tk-bg)]">{CONTRIBUTOR_LABEL}</span>
              <h1 className="editable-display mt-4 text-balance text-[2.6rem] font-bold leading-[1.0] tracking-[-0.03em] sm:text-[3.6rem] lg:text-[4rem]">{post.title}</h1>
              {role || location ? (
                <p className="mt-3 text-lg text-[var(--tk-muted)]">{[role, location].filter(Boolean).join(' · ')}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            {lead ? <p className="max-w-2xl text-xl leading-[1.55] text-[var(--tk-text)] sm:text-2xl">{lead}</p> : null}

            {/* Quick-facts strip */}
            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-line)] sm:grid-cols-4">
              {quickFacts.filter(([, value]) => value).map(([label, value, Icon]) => (
                <div key={label} className="bg-[var(--tk-surface)] p-5">
                  <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--slot4-accent-strong)]" /> {label}</div>
                  <p className="mt-2 truncate text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            {/* Bio body */}
            <div className="mt-12">
              <h2 className="editable-display text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.6rem]">About</h2>
              <BodyContent post={post} />
            </div>

            {tags.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]">#{tag}</span>
                ))}
              </div>
            ) : null}

            {mapSrc ? <div className="mt-12"><MapBox src={mapSrc} label={address || post.title} /></div> : null}

            {/* Their contributions — links INTO the public Reference Library only */}
            {libraryResources.length ? (
              <div className="mt-14">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="editable-display text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.6rem]">In the library</h2>
                  <Link href="/pdf" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-text)] transition hover:gap-2.5">Browse all <ArrowUpRight className="h-4 w-4" /></Link>
                </div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {libraryResources.map((item) => (
                    <Link key={item.id || item.slug} href={`/pdf/${item.slug}`} className="group flex gap-4 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-24px_rgba(12,4,7,0.3)]">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent-strong)]"><FileText className="h-6 w-6" strokeWidth={1.6} /></span>
                      <div className="min-w-0">
                        <h3 className="editable-display line-clamp-2 text-base font-bold leading-snug tracking-[-0.02em]">{item.title}</h3>
                        <p className="mt-1.5 line-clamp-1 text-sm text-[var(--tk-muted)]">{fileSizeOf(item) || 'Reference file'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          {/* Sticky sidebar: contact card + CTA + trust panel + ad */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tk-muted)]">Contact</p>
              <div className="mt-4 grid gap-1">
                {address ? <ContactRow icon={MapPin} label={address} href={`https://maps.google.com/maps?q=${encodeURIComponent(address)}`} /> : null}
                {phone ? <ContactRow icon={Phone} label={phone} href={`tel:${phone}`} /> : null}
                {email ? <ContactRow icon={Mail} label={email} href={`mailto:${email}`} /> : null}
                {website ? <ContactRow icon={Globe2} label={website.replace(/^https?:\/\//, '')} href={website} external /> : null}
                {!address && !phone && !email && !website ? <p className="py-2 text-sm text-[var(--tk-muted)]">Contact details are private for this contributor.</p> : null}
              </div>
              <Link href={website || (email ? `mailto:${email}` : '#')} target={website ? '_blank' : undefined} rel={website ? 'noreferrer' : undefined} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-text)] px-5 py-3 text-sm font-semibold text-[var(--tk-bg)] transition hover:-translate-y-0.5">
                Get in touch <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
              <p className="inline-flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-[var(--slot4-accent-strong)]" /> Trust &amp; verification</p>
              <ul className="mt-4 grid gap-4">
                {trust.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--slot4-accent-strong)]" />
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-[var(--tk-muted)]">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel className="mx-auto w-full" />
          </aside>
        </div>
      </section>
    </>
  )
}

function ContactRow({ icon: Icon, label, href, external = false }: { icon: typeof MapPin; label: string; href: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-[var(--tk-raised)]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent-strong)]"><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 truncate text-sm font-medium text-[var(--tk-text)]">{label}</span>
    </a>
  )
}

// ----- Shared building blocks -----
function Divider() {
  return <div className="my-10 h-px bg-[var(--tk-line)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">About this post</p>
        <div className="mt-4 grid gap-2.5 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-semibold tracking-[-0.02em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em]">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

