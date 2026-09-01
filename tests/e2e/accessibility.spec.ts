import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Automated accessibility checks across every route.
 *
 * axe catches a specific and useful class of defect - contrast, missing
 * names, broken landmark and heading structure, form controls without
 * labels - and catches nothing about whether the page is actually usable
 * with a keyboard. The keyboard assertions below cover the interactions
 * this product's own components introduce, which is where its risk
 * actually is.
 */

const ROUTES = [
  '/',
  '/foundations',
  '/algorithms',
  '/ecosystem',
  '/india',
  '/updates',
  '/timeline',
  '/glossary',
  '/about',
];

test.describe('axe', () => {
  for (const route of ROUTES) {
    test(`${route} has no WCAG A or AA violations`, async ({ page }) => {
      await page.goto(route);
      // Let deferred scenes settle so their canvases are in the tree.
      await page.waitForTimeout(1200);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const summary = results.violations.map(
        (violation) =>
          `${violation.id} (${violation.nodes.length}): ${violation.help}`,
      );

      expect(summary, summary.join('\n')).toEqual([]);
    });
  }
});

test.describe('keyboard operation', () => {
  test('the Bloch sphere can be driven without a pointer', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    const controls = page.getByRole('group', {
      name: /Bloch sphere state controls/,
    });
    await controls.focus();

    const before = await controls.getByText(/deg/).first().innerText();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    const after = await controls.getByText(/deg/).first().innerText();

    // A pointer-driven surface with no keyboard route is unreachable for
    // a keyboard user; the arrow keys are that route.
    expect(after).not.toBe(before);
  });

  test('the region tabs are reachable and operable by keyboard', async ({
    page,
  }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) >= 1024,
      'tabs only exist on narrow viewports',
    );

    await page.goto('/updates');
    const tabs = page.getByRole('tab');
    await tabs.nth(1).focus();
    await page.keyboard.press('Enter');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  });

  test('the glossary search is labelled and focusable', async ({ page }) => {
    await page.goto('/glossary');
    const search = page.getByRole('searchbox', { name: 'Search the glossary' });
    await search.focus();
    await expect(search).toBeFocused();
  });

  test('the index drawer closes on Escape', async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) >= 1024,
      'the drawer only exists on narrow viewports',
    );

    await page.goto('/');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.locator('#nav-drawer')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#nav-drawer')).toBeHidden();
  });
});

test.describe('document structure', () => {
  for (const route of ROUTES) {
    test(`${route} has a main landmark and an ordered heading outline`, async ({
      page,
    }) => {
      await page.goto(route);

      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);

      // No heading level may be skipped: an outline that jumps h1 to h3
      // is unusable for anyone navigating by heading.
      const levels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((nodes) =>
          nodes.map((node) => Number(node.tagName.slice(1))),
        );

      let previous = levels[0] ?? 1;
      for (const level of levels) {
        expect(level - previous).toBeLessThanOrEqual(1);
        previous = level;
      }
    });
  }
});
