import { expect, test } from '@playwright/test';

test.describe('glossary search', () => {
  test('filters as the reader types', async ({ page }) => {
    await page.goto('/glossary');

    const search = page.getByRole('searchbox', { name: 'Search the glossary' });
    await search.fill('decoherence');

    // The term itself ranks first; other entries whose definitions
    // mention decoherence legitimately match too, so the count is not
    // asserted as exactly one.
    await expect(page.getByText(/terms? \/ ranked by relevance/)).toBeVisible();
    await expect(page.getByRole('term').first()).toContainText('Decoherence');
    expect(await page.getByRole('term').count()).toBeLessThan(6);
  });

  test('matches an alias as well as the term itself', async ({ page }) => {
    await page.goto('/glossary');
    await page.getByRole('searchbox', { name: 'Search the glossary' }).fill('qkd');
    await expect(page.getByRole('term').first()).toContainText(
      'Quantum key distribution',
    );
  });

  test('ranks a term match above a definition match', async ({ page }) => {
    await page.goto('/glossary');
    await page.getByRole('searchbox', { name: 'Search the glossary' }).fill('qubit');
    // "Qubit" itself must come before entries that merely mention qubits.
    await expect(page.getByRole('term').first()).toContainText('Qubit');
  });

  test('shows a themed empty state rather than a blank page', async ({ page }) => {
    await page.goto('/glossary');
    await page
      .getByRole('searchbox', { name: 'Search the glossary' })
      .fill('zzzznotaterm');
    await expect(page.getByText('No term resolves')).toBeVisible();
  });

  test('the category filter narrows the list', async ({ page }) => {
    await page.goto('/glossary');

    const before = await page.getByRole('term').count();
    await page.getByRole('button', { name: 'Hardware', exact: true }).click();
    const after = await page.getByRole('term').count();

    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
  });
});
