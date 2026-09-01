/**
 * Visual capture utility.
 *
 * Renders a route in headless Chromium, waits for the 3D scenes to reach
 * a steady state, writes a screenshot and prints any console errors. Used
 * during development to check scenes that cannot be asserted on
 * meaningfully in a unit test.
 *
 *   node scripts/capture.mjs http://localhost:3000/lab/bloch out.png
 */
import { chromium } from '@playwright/test';

const [, , url, out, waitMs = '4000'] = process.argv;

if (!url || !out) {
  console.error('usage: node scripts/capture.mjs <url> <out.png> [waitMs]');
  process.exit(1);
}

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const problems = [];
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    problems.push(`[${message.type()}] ${message.text()}`);
  }
});
page.on('pageerror', (error) => problems.push(`[pageerror] ${error.message}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(Number(waitMs));
await page.screenshot({ path: out });

console.log(problems.slice(0, 30).join('\n') || 'no console errors or warnings');

await browser.close();
