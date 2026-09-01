import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google';

/**
 * Three faces, three jobs, no exceptions.
 *
 * - Space Grotesk carries display and headings. Its slightly mechanical
 *   terminals suit an instrument panel without tipping into novelty.
 * - JetBrains Mono carries every numeral, label, coordinate and code
 *   fragment. Tabular figures are the point.
 * - Inter carries body prose.
 *
 * All three are self-hosted through next/font, so there is no external
 * font request, no layout shift from a late swap, and no third-party
 * connection on the critical path.
 */

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const fontVariables = [
  spaceGrotesk.variable,
  jetbrainsMono.variable,
  inter.variable,
].join(' ');
