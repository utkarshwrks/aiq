import { expect, test } from '@playwright/test';

const ROUTES = [
  ['/', 'A working map of'],
  ['/foundations', 'Foundations'],
  ['/algorithms', 'Algorithms'],
  ['/ecosystem', 'Ecosystem'],
  ['/india', 'India'],
  ['/updates', 'Updates'],
  ['/timeline', 'Timeline'],
  ['/glossary', 'Glossary'],
  ['/about', 'About'],
] as const;

test.describe('routes', () => {
  for (const [path, heading] of ROUTES) {
    test(`${path} renders with exactly one h1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText(heading);
    });
  }

  test('an unknown route returns the themed 404', async ({ page }) => {
    const response = await page.goto('/no-such-plate');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('Sector not charted');
  });

  test('the skip link is the first focusable element', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toContainText('Skip to content');
  });

  test('navigation reaches every plate', async ({ page }) => {
    await page.goto('/');

    // On a narrow viewport the route manifest lives in the index drawer
    // rather than in the bar, so the test opens it the way a reader would.
    const narrow = (page.viewportSize()?.width ?? 0) < 1024;
    if (narrow) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
    }

    const scope = narrow ? page.locator('#nav-drawer') : page.getByRole('navigation', { name: 'Primary' });

    for (const [path] of ROUTES.slice(1)) {
      await expect(scope.locator(`a[href="${path}"]`)).toHaveCount(1);
    }
  });

  test('the active route is marked for assistive technology', async ({ page }) => {
    await page.goto('/glossary');

    const narrow = (page.viewportSize()?.width ?? 0) < 1024;
    if (narrow) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await expect(
        page.locator('#nav-drawer [aria-current="page"]'),
      ).toContainText('Glossary');
      return;
    }

    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .locator('[aria-current="page"]'),
    ).toContainText('Glossary');
  });
});

test.describe('no emoji anywhere in the rendered output', () => {
  // The hard constraint the whole product is built under. Asserted on
  // the rendered text of every route rather than trusted.
  const EMOJI =
    /[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{FE0F}]/u;

  for (const [path] of ROUTES) {
    test(`${path} contains no emoji`, async ({ page }) => {
      await page.goto(path);
      const text = await page.locator('body').innerText();
      const match = text.match(EMOJI);
      expect(match, `found "${match?.[0]}" on ${path}`).toBeNull();
    });
  }
});
