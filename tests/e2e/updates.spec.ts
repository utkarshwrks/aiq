import { expect, test } from '@playwright/test';

test.describe('the update panel', () => {
  test('renders both lenses as separate columns on a wide viewport', async ({
    page,
  }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) < 1024,
      'two-column layout is desktop only',
    );

    await page.goto('/updates');

    await expect(page.getByText('Global advancements')).toBeVisible();
    await expect(page.getByText('India advancements')).toBeVisible();
  });

  test('offers the two lenses as tabs on a narrow viewport', async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) >= 1024,
      'tab layout is mobile only',
    );

    await page.goto('/updates');

    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(2);

    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'false');
  });

  test('every feed entry links out to its publisher', async ({ page }) => {
    await page.goto('/updates');

    const links = page.locator('li a[target="_blank"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(5);

    for (let i = 0; i < Math.min(count, 12); i += 1) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      const rel = await link.getAttribute('rel');

      // Items must leave the site: the panel indexes, it never republishes.
      expect(href).toMatch(/^https?:\/\//);
      expect(new URL(href!).hostname).not.toContain('localhost');
      expect(rel).toContain('noopener');
    }
  });

  test('states where its data came from', async ({ page }) => {
    await page.goto('/updates');
    await expect(page.getByText(/Live index|Committed snapshot/)).toBeVisible();
  });

  test('publishes the full source register', async ({ page }) => {
    await page.goto('/updates');
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(20);
  });

  test('the JSON feed endpoint validates its limit', async ({ request }) => {
    const ok = await request.get('/api/updates?limit=5');
    expect(ok.status()).toBe(200);
    const feed = await ok.json();
    expect(feed.global.length).toBeLessThanOrEqual(5);
    expect(feed).toHaveProperty('stats.sourceCount');

    const bad = await request.get('/api/updates?limit=999');
    expect(bad.status()).toBe(400);
  });
});
