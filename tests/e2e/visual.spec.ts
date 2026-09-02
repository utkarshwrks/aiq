import { expect, test, type Page } from '@playwright/test';

/**
 * Visual regression for the 3D and animated components.
 *
 * These are the parts of the product with no meaningful assertion in a
 * unit test. A Bloch sphere either renders a sphere with a vector on it
 * or it renders a black square, and only a pixel comparison tells the
 * two apart; the same is true of the circuit scene's gate layout and the
 * entanglement particle field.
 *
 * Two rules make these stable enough to be worth having:
 *
 * 1. Every scene is seeded and paused before capture. `?frozen=1` puts
 *    the scene into a deterministic pose and stops its animation loop,
 *    so a passing run does not depend on when the screenshot landed.
 * 2. A small pixel tolerance absorbs GPU driver differences. It is set
 *    low enough that a scene failing to mount, losing its vector, or
 *    losing its material still fails the comparison.
 *
 * Run `npx playwright test visual --update-snapshots` after a deliberate
 * visual change, and read the diff before accepting it.
 */

const TOLERANCE = {
  maxDiffPixelRatio: 0.02,
  animations: 'disabled' as const,
};

/**
 * Waits for the scene to report that it has drawn a deterministic frame.
 *
 * The lab pages mount each scene twice, in two configurations. The first
 * is the fully-featured one and the one worth holding a reference image
 * of; the second is a variant whose only difference is which chrome is
 * switched off.
 */
async function settle(page: Page, testId: string) {
  const scene = page.getByTestId(testId).first();
  await expect(scene).toBeVisible({ timeout: 30_000 });
  await expect(scene).toHaveAttribute('data-frozen', 'true', { timeout: 30_000 });
  return scene;
}

test.describe('3D scenes', () => {
  test('the Bloch sphere renders its vector and axes', async ({ page }) => {
    await page.goto('/lab/bloch?frozen=1');
    const scene = await settle(page, 'scene-bloch');
    await expect(scene).toHaveScreenshot('bloch-sphere.png', TOLERANCE);
  });

  test('the quantum circuit renders its wires and gates', async ({ page }) => {
    await page.goto('/lab/circuit?frozen=1');
    const scene = await settle(page, 'scene-circuit');
    await expect(scene).toHaveScreenshot('quantum-circuit.png', TOLERANCE);
  });

  test('the entanglement field renders both clusters', async ({ page }) => {
    await page.goto('/lab/entanglement?frozen=1');
    const scene = await settle(page, 'scene-entanglement');
    await expect(scene).toHaveScreenshot('entanglement-particles.png', TOLERANCE);
  });
});

test.describe('animated chrome', () => {
  test('the timeline sequence rail renders at rest', async ({ page }) => {
    await page.goto('/timeline');
    const sequence = page.getByRole('region', { name: /Sequence/ });
    await expect(sequence).toBeVisible();
    await expect(sequence).toHaveScreenshot('timeline-sequence.png', TOLERANCE);
  });
});
