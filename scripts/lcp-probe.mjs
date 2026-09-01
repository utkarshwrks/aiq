/**
 * Reports the element the browser actually chose as LCP, under mobile
 * throttling. Lighthouse's element audit is empty when the LCP candidate
 * is inside a lazily mounted subtree, which is exactly this product's
 * case, so the measurement is taken directly.
 */
import { chromium } from '@playwright/test';

const [, , url] = process.argv;
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();

const client = await context.newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
});
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

await page.goto(url, { waitUntil: 'load', timeout: 90_000 });
await page.waitForTimeout(6000);

const report = await page.evaluate(() => {
  const entries = performance.getEntriesByType('largest-contentful-paint');
  const last = entries.at(-1);
  const paints = performance.getEntriesByType('paint');
  return {
    lcp: last ? Math.round(last.startTime) : null,
    lcpElement: last?.element
      ? `${last.element.tagName}.${last.element.className}`.slice(0, 160)
      : null,
    lcpSize: last?.size ?? null,
    fcp: Math.round(paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? 0),
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
