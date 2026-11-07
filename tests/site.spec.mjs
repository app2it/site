import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/for-it/', '/security/', '/docs/'];

for (const path of pages) {
  test.describe(path, () => {
    test('has no automatic accessibility violations', async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes[0].target}`)).toEqual([]);
    });

    for (const width of [320, 768, 1440]) {
      test(`doesn't scroll sideways at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test('loads nothing from other sites, and can be indexed', async ({ page }) => {
      const external = [];
      page.on('request', (request) => {
        if (new URL(request.url()).hostname !== 'localhost') external.push(request.url());
      });
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(external).toEqual([]);
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    });
  });
}

test('says the code is not public yet, and offers no install command', async ({ page }) => {
  for (const path of ['/', '/for-it/', '/security/']) {
    await page.goto(path);
    await expect(page.locator('.notice')).toContainText("The code isn't public yet");
    await expect(page.locator('body')).not.toContainText(/npm install|brew install|curl -/);
  }
});
