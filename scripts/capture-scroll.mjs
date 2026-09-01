/**
 * Captures a route at several scroll offsets. A full-page screenshot of a
 * site with sticky chrome, lazy 3D and scroll-linked motion does not show
 * what the reader sees, so this steps through viewports instead.
 */
import { chromium } from '@playwright/test';

const [, , url, prefix, countArg = '4'] = process.argv;
const count = Number(countArg);

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
});

const problems = [];
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(3500);

for (let i = 0; i < count; i += 1) {
  await page.evaluate((n) => window.scrollTo(0, n * window.innerHeight * 0.92), i);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${prefix}-${i}.png` });
}

console.log(problems.slice(0, 20).join('\n') || 'no page errors');
await browser.close();
