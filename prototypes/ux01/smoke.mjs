import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch();
try {
  for (const width of [1000, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    const page = await context.newPage();
    await page.goto(process.env.UX01_URL ?? 'http://127.0.0.1:8397/');
    const mode = key => page.locator(`[data-mode="${key}"]`);
    assert.equal(await mode('compact').getAttribute('aria-pressed'), 'true');
    await mode('full').focus();
    await page.keyboard.press('Enter');
    assert.equal(await mode('full').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#cost').textContent(), '木材 10');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (width === 390) await page.locator('#select').tap();
    else await page.locator('#select').click();
    await mode('collapsed').click();
    assert.equal(await page.locator('#content').isVisible(), false);
    assert.equal(await page.locator('#cancel').isVisible(), true);
    await page.locator('#locale').click();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.locator('#intent').textContent(), 'Placing tent');
    assert.equal(await page.locator('#map').textContent(), 'Base map · 0');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#intent').textContent(), '');
    assert.equal(await mode('collapsed').evaluate(button => button === document.activeElement), true);
    await page.mouse.click(20, 100);
    assert.equal(await page.locator('#map').textContent(), 'Base map · 1');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.ok((await page.locator('#panel').boundingBox()).height <= 844 * .4 + 1);
    await mode('full').click();
    assert.equal(await page.locator('#cost').textContent(), '10 wood');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mode('collapsed').click();
    await page.reload();
    assert.equal(await mode('collapsed').getAttribute('aria-pressed'), 'true');
    await context.close();
    console.log(`UX-01 prototype ${width}px passed`);
  }
} finally {
  await browser.close();
}
