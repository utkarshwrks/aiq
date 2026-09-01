/**
 * Prints the specific colour pairs axe is failing on, which is what a
 * violation count alone does not tell you.
 */
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const [, , url] = process.argv;
// axe-core/playwright requires an explicit context rather than the
// implicit one browser.newPage creates.
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

const seen = new Set();
for (const violation of results.violations) {
  for (const node of violation.nodes) {
    const message = node.any[0]?.message ?? node.failureSummary ?? '';
    const key = `${violation.id}|${message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`\n[${violation.id}] ${node.target.join(' ')}`);
    console.log(`  ${message.replace(/\n/g, ' ')}`);
    console.log(`  html: ${node.html.slice(0, 110)}`);
  }
}
await browser.close();
