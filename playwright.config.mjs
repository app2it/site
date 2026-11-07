import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'python3 -m http.server 4321 --directory dist',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
