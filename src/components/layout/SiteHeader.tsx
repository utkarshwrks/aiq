'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/site';
import { cn } from '@/lib/cn';
import { Wordmark } from './Wordmark';

/**
 * The console's title bar. It is deliberately shallow - 56px - and holds
 * three registers: the faceplate mark, the route manifest as numbered
 * plates, and a right-hand status gutter. It gains a hairline and a
 * backdrop blur only once the page has been scrolled past the hero, so
 * the landing canvas opens without a bar drawn across it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer on navigation and lock the page behind it while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[var(--z-nav)]',
        'transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-base)] ease-[var(--ease-instrument)]',
        scrolled
          ? 'border-b border-hairline bg-deep/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[104rem] items-center justify-between px-[var(--shell-gutter)]">
        <Wordmark compact />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-1.5 px-3 py-2',
                      'font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.12em]',
                      'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-instrument)]',
                      active ? 'text-teal' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'text-[0.625rem] transition-colors duration-[var(--dur-fast)]',
                        active ? 'text-teal/70' : 'text-ink-faint',
                      )}
                    >
                      {item.coordinate}
                    </span>
                    {item.label}
                    {/* Active plate is underscored by a hairline, not a pill. */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-x-2 bottom-0 h-px origin-left transition-transform duration-[var(--dur-base)] ease-[var(--ease-instrument)]',
                        active
                          ? 'scale-x-100 bg-teal'
                          : 'scale-x-0 bg-hairline-strong group-hover:scale-x-100',
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* The accessible name contains the visible word, because a
            voice-control user says what they see: "click Index". */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-drawer"
          aria-label={open ? 'Close index' : 'Open index'}
          className="flex items-center gap-2 border border-hairline px-3 py-2 font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-muted transition-colors duration-[var(--dur-fast)] hover:border-teal hover:text-teal lg:hidden"
        >
          {open ? <X aria-hidden className="size-3.5" /> : <Menu aria-hidden className="size-3.5" />}
          Index
        </button>
      </div>

      {/* Drawer. A full-height index sheet, not a dropdown. */}
      <div
        id="nav-drawer"
        hidden={!open}
        className="cg-grid cg-grid-fine h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-hairline bg-deep lg:hidden"
      >
        <ul>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="border-b border-hairline">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="flex items-baseline gap-4 px-[var(--shell-gutter)] py-5 transition-colors duration-[var(--dur-fast)] hover:bg-surface"
                >
                  <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                    {item.coordinate}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span
                      className={cn(
                        'font-[family-name:var(--font-display)] text-[length:var(--text-xl)]',
                        active ? 'text-teal' : 'text-ink',
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="text-[length:var(--text-xs)] text-ink-muted">
                      {item.descriptor}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
