import { expect, test } from '@playwright/test';

/**
 * Under reduced motion every 3D scene must be replaced by its static
 * substitute, not merely slowed. These tests assert the substitution
 * actually happens, because a scene that quietly keeps animating is the
 * exact failure this branch exists to prevent.
 */
test.describe('reduced motion', () => {
  test('the hero shows the static Bloch sphere and no canvas', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(
      page.getByRole('img', { name: /Interactive Bloch sphere/ }),
    ).toBeVisible();
  });

  test('the circuit plate shows the 2D diagram', async ({ page }) => {
    await page.goto('/algorithms');
    await page.waitForTimeout(1500);

    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(
      page.getByRole('img', { name: /Three-dimensional rendering/ }),
    ).toBeVisible();
  });

  test('the entanglement scene falls back on the about plate', async ({ page }) => {
    await page.goto('/about');
    await page.waitForTimeout(1500);

    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(
      page.getByRole('img', { name: /Two clusters of particles/ }),
    ).toBeVisible();
  });

  test('content is fully present, not merely still', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Global advancements')).toBeVisible();
  });
});
