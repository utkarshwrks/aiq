import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end configuration.
 *
 * Runs against a production build rather than the dev server, because
 * the things worth asserting here - route bundles, static generation,
 * the reduced-motion fallbacks - only behave correctly in a real build.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? 'github' : 'list',

  use: {
    baseURL: 'http://127.0.0.1:3210',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: /reduced-motion\.spec\.ts/,
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testIgnore: /reduced-motion\.spec\.ts/,
    },
    {
      // A dedicated project for the reduced-motion branch, since it
      // swaps every 3D scene for a different component rather than just
      // slowing an animation.
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        contextOptions: { reducedMotion: 'reduce' },
      },
      testMatch: /reduced-motion\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npx next build && npx next start -p 3210',
    url: 'http://127.0.0.1:3210',
    reuseExistingServer: !process.env['CI'],
    timeout: 240_000,
  },
});
