'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

// Public label for the pdf task — the Reference Library is the ONLY task
// surface exposed publicly and the only task link this footer renders.
const LIBRARY = { label: 'Reference Library', href: '/pdf' }

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      {/* CTA strip */}
      <div className="mx-auto w-full max-w-[var(--editable-container)] px-6 pt-20 sm:px-10 lg:px-14 lg:pt-28">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-[var(--editable-dark-border)] pb-16 lg:flex-row lg:items-end">
          <h2 className="editable-display max-w-2xl text-[2.4rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[3.4rem]">
            Open the library. Find your next reference.
          </h2>
          <Link
            href={LIBRARY.href}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-7 py-3.5 text-sm font-semibold text-[var(--slot4-on-accent)] transition hover:brightness-[0.96]"
          >
            Browse the {LIBRARY.label} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[var(--editable-container)] gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-14">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--slot4-accent-fill)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-11 w-11 object-contain" />
            </span>
            <span className="editable-display text-xl font-bold tracking-[-0.02em]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--editable-footer-text)]/70">
            {globalContent.footer?.description || SITE_CONFIG.description}
          </p>
          
        </div>

        <FooterColumn title="Discover" links={[LIBRARY, { label: 'Search', href: '/search' }]} />
        <FooterColumn title="Resources" links={[{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }]} />

        <div>
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--editable-footer-text)]/50">Account</h3>
          <div className="mt-5 grid gap-3">
            {(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }]).map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[var(--editable-footer-text)]/70 transition hover:text-[var(--editable-footer-text)]"
                >
                  {item.label}
                </Link>
              )
            )}
            {session ? (
              <button
                type="button"
                onClick={logout}
                className="text-left text-sm font-medium text-[var(--editable-footer-text)]/70 transition hover:text-[var(--editable-footer-text)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--editable-dark-border)]">
        <div className="mx-auto flex w-full max-w-[var(--editable-container)] flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-[var(--editable-footer-text)]/55 sm:flex-row sm:px-10 lg:px-14">
          <span>© {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <span>{globalContent.footer?.bottomNote || 'Built for clean discovery.'}</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--editable-footer-text)]/50">{title}</h3>
      <div className="mt-5 grid gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--editable-footer-text)]/70 transition hover:text-[var(--editable-footer-text)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
