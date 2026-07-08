import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  ovo-protocol-inspired task surfaces.

  Every task (archive + detail) shares one cohesive premium identity: a pastel
  base, lavender contrast, hairline borders, bordered flat 20px cards, a
  soft lavender accent, Space Grotesk display + IBM Plex Sans body.
  Per-task copy (kicker / note) still varies so each surface keeps a little
  voice, but the visual language is unified. Tokens are delivered via CSS
  variables (`--tk-*`).
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Space Grotesk', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const BODY_FONT = "'IBM Plex Sans', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

// Shared pastel palette — every task inherits this; only kicker/note differ.
const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#FFF7FA',
  surface: '#F7CFD8',
  raised: '#A6D6D6',
  text: '#3F365F',
  muted: '#665A87',
  line: 'rgba(142,125,190,0.38)',
  accent: '#8E7DBE',
  accentSoft: '#F7CFD8',
  onAccent: '#F4F8D3',
  glow: 'rgba(142,125,190,0.24)',
  radius: '1.25rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Reading', note: 'In-depth reads, guides and stories worth your time.' },
  listing: { ...base, kicker: 'Directory', note: 'Find, compare and connect with local businesses.' },
  classified: { ...base, kicker: 'Notices', note: 'Fresh offers and listings, ready to act on.' },
  image: { ...base, kicker: 'Gallery', note: 'A visual feed of standout images and galleries.' },
  sbm: { ...base, kicker: 'Collections', note: 'Curated resources and links worth saving.' },
  pdf: { ...base, kicker: 'Reference Library', note: 'References, collections and resources ready to open.' },
  profile: { ...base, kicker: 'Contributor', note: 'The people behind the reference library.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    // Re-point the shared article-body accent vars so post HTML (headings,
    // links) inherits this task's blue accent.
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
