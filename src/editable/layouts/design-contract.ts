import type { CSSProperties } from 'react'

export const editableRootStyle = {
  // Site palette: #F7CFD8 pink, #FFF7FA blush-white, #A6D6D6 aqua,
  // #8E7DBE lavender. Text/border tones are lavender derivatives so the UI
  // stays readable while keeping the whole site in the requested palette.
  '--slot4-page-bg': '#FFF7FA',
  '--slot4-page-text': '#3F365F',
  '--slot4-panel-bg': '#A6D6D6',
  '--slot4-surface-bg': '#F7CFD8',
  '--slot4-muted-text': '#665A87',
  '--slot4-soft-muted-text': '#75689A',
  '--slot4-accent': '#8E7DBE',
  '--slot4-accent-fill': '#8E7DBE',
  '--slot4-accent-soft': '#F7CFD8',
  '--slot4-accent-strong': '#6F609B',
  '--slot4-on-accent': '#F4F8D3',
  '--slot4-dark-bg': '#8E7DBE',
  '--slot4-dark-text': '#F4F8D3',
  '--slot4-media-bg': '#A6D6D6',
  '--slot4-cream': '#FFF7FA',
  '--slot4-warm': '#F7CFD8',
  '--slot4-lavender': '#8E7DBE',
  '--slot4-gray': '#A6D6D6',
  '--slot4-body-gradient': 'linear-gradient(135deg, #FFF7FA 0%, #F7CFD8 48%, #A6D6D6 100%)',
  '--editable-page-bg': '#FFF7FA',
  '--editable-page-text': '#3F365F',
  '--editable-container': '1440px',
  '--editable-border': 'rgba(142,125,190,0.38)',
  '--editable-border-strong': 'rgba(142,125,190,0.68)',
  '--editable-dark-border': 'rgba(244,248,211,0.35)',
  '--editable-nav-bg': '#FFF7FA',
  '--editable-nav-text': '#3F365F',
  '--editable-nav-active': '#8E7DBE',
  '--editable-nav-active-text': '#3F365F',
  '--editable-cta-bg': '#8E7DBE',
  '--editable-cta-text': '#F4F8D3',
  '--editable-search-bg': '#F7CFD8',
  '--editable-footer-bg': '#8E7DBE',
  '--editable-footer-text': '#F4F8D3',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-strong)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-[var(--editable-dark-border)]',
  shadow: 'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
  shadowStrong: 'shadow-[0_28px_60px_-30px_rgba(15,23,42,0.35)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(5,11,26,0.05),rgba(5,11,26,0.78))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-6 sm:px-10 lg:px-16',
    sectionY: 'py-20 sm:py-24 lg:py-[7.5rem]',
    sectionYtight: 'py-14 sm:py-16 lg:py-20',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[168px] shrink-0 snap-start sm:w-[192px]',
  },
  type: {
    eyebrow: 'editable-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--slot4-accent)]',
    heroTitle:
      'editable-hero text-[3rem] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[4rem] lg:text-[5.125rem] lg:leading-[1.02] lg:tracking-[-0.035em]',
    sectionTitle: 'editable-display text-[2.25rem] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[2.75rem] lg:text-[3rem]',
    body: 'text-[1.0625rem] leading-[1.6]',
    emphasis: 'text-[var(--slot4-accent)]',
  },
  badge: {
    pill: 'inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-3.5 py-1.5 editable-mono text-[0.68rem] uppercase tracking-[0.1em] text-[var(--slot4-muted-text)]',
    accentPill:
      'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-3.5 py-1.5 editable-mono text-[0.68rem] uppercase tracking-[0.1em] text-[var(--slot4-accent-strong)]',
  },
  surface: {
    card: `rounded-[20px] border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `rounded-[20px] border ${editablePalette.border} ${editablePalette.panelBg}`,
    dark: `rounded-[20px] ${editablePalette.darkBg} ${editablePalette.darkText}`,
  },
  button: {
    primary: `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-7 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--slot4-dark-text)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-14px_rgba(5,11,26,0.55)] active:translate-y-0`,
    secondary: `inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-7 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--slot4-page-text)] transition duration-200 hover:border-[var(--editable-border-strong)] hover:-translate-y-0.5 active:translate-y-0`,
    accent: `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-7 py-3.5 text-sm font-semibold text-[var(--slot4-on-accent)] transition duration-200 hover:bg-[var(--slot4-accent-strong)] active:scale-[0.98]`,
    ghost: `inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-accent)] transition duration-200 hover:gap-3`,
  },
  media: {
    frame: `relative overflow-hidden rounded-[20px] ${editablePalette.mediaBg}`,
    frameFull: `relative overflow-hidden ${editablePalette.mediaBg}`,
    ratio: 'aspect-[16/10]',
  },
  motion: {
    lift: 'transition duration-200 hover:-translate-y-1 hover:border-[var(--editable-border-strong)] hover:shadow-[0_28px_60px_-32px_rgba(15,23,42,0.35)]',
    fade: 'transition duration-200 hover:opacity-80',
    zoom: 'transition duration-[600ms] group-hover:scale-[1.04]',
  },
} as const

export const aiLayoutRules = [
  'Change the full site color palette in editableRootStyle first; all homepage sections consume those CSS variables.',
  'Keep page structure in src/editable/sections/HomeSections.tsx so AI can redesign the whole home experience in one file.',
  'Use wide readable grids; never create skinny columns for paragraphs or cards.',
  'Use horizontal rails for dense post browsing.',
  'Keep dynamic post fetching intact; do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
